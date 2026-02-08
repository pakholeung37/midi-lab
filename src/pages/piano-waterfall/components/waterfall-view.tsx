// 双层 Canvas 瀑布流视图
// 静态层：钢琴键盘（只在活跃键变化时重绘）
// 动态层：瀑布流音符（每帧更新）

import { useEffect, useRef, useCallback, useMemo } from 'react'
import type {
  WaterfallNote,
  ActiveKey,
  KeySignature,
  TimeSignature,
} from '../types'
import type { PianoKeyLayout } from '../utils/piano-layout'

import type { NoteTimeIndex } from '../core/note-index'
import { playbackState } from '../core/playback-state'
import { animationLoop, PRIORITY } from '../core/animation-loop'
import { drawRoundRectPath } from '../utils/draw-utils-optimized'
import { getScalePitchClasses, isOutOfKey } from '../utils/music-theory'
import { getBeatsInRange } from '../utils/beat-grid'
import { colorToRgba } from '../utils/color-cache'

interface WaterfallViewProps {
  notes: WaterfallNote[]
  noteIndex?: NoteTimeIndex
  keys: PianoKeyLayout[]
  width: number
  height: number
  pixelsPerSecond: number
  keySignatures?: KeySignature[]
  timeSignatures?: TimeSignature[]
  originalBpm?: number
}

export function WaterfallView({
  notes,
  noteIndex,
  keys,
  width,
  height,
  pixelsPerSecond,
  keySignatures = [],
  timeSignatures = [],
  originalBpm = 120,
}: WaterfallViewProps) {
  // 双层 canvas 引用
  const noteCanvasRef = useRef<HTMLCanvasElement>(null)
  const pianoCanvasRef = useRef<HTMLCanvasElement>(null)
  const waterfallHeightRef = useRef<number>(0)

  // 脏标记：上一帧的活跃键序列化，用于判断是否需要重绘钢琴
  // 使用 null 表示未初始化，确保首次一定会绘制
  const lastActiveKeysRef = useRef<string | null>(null)

  // 构建 MIDI -> Key 索引
  const keyMap = useMemo(() => {
    const map = new Map<number, PianoKeyLayout>()
    for (const key of keys) {
      map.set(key.midi, key)
    }
    return map
  }, [keys])

  // 分离白键和黑键
  const { whiteKeys, blackKeys } = useMemo(
    () => ({
      whiteKeys: keys.filter((k) => !k.isBlack),
      blackKeys: keys.filter((k) => k.isBlack),
    }),
    [keys],
  )

  // 计算钢琴键盘高度
  const pianoHeight = keys[0]?.height || 0
  waterfallHeightRef.current = Math.max(0, height - pianoHeight)

  // 获取当前时间点的调号对应的调内音集合
  const getScalePitchClassesAtTime = useCallback(
    (time: number): Set<number> => {
      if (keySignatures.length === 0) return new Set()

      const currentKeySig = keySignatures.reduce<KeySignature | null>(
        (acc, ks) => (ks.time <= time ? ks : acc),
        keySignatures[0] || null,
      )

      if (!currentKeySig) return new Set()
      return getScalePitchClasses(currentKeySig.key, currentKeySig.scale)
    },
    [keySignatures],
  )

  // 绘制节拍网格（批量路径）
  const drawBeatGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      currentTime: number,
      waterfallHeight: number,
    ) => {
      if (timeSignatures.length === 0 || originalBpm <= 0) return

      const timeWindow = waterfallHeight / pixelsPerSecond
      const startTime = Math.max(0, currentTime - 0.5)
      const endTime = currentTime + timeWindow

      const beats = getBeatsInRange(
        startTime,
        endTime,
        originalBpm,
        timeSignatures,
      )

      // 按强度分组批量绘制
      const strong: number[] = []
      const medium: number[] = []
      const weak: number[] = []

      for (const beat of beats) {
        const timeOffset = beat.time - currentTime
        const y = waterfallHeight - timeOffset * pixelsPerSecond
        if (y < 0 || y > waterfallHeight) continue

        if (beat.strength === 'strong') strong.push(y)
        else if (beat.strength === 'medium') medium.push(y)
        else weak.push(y)
      }

      // 批量绘制弱拍线
      if (weak.length > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 0.5
        ctx.beginPath()
        for (const y of weak) {
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
        }
        ctx.stroke()
      }

      // 批量绘制中等拍线
      if (medium.length > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (const y of medium) {
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
        }
        ctx.stroke()
      }

      // 批量绘制强拍线
      if (strong.length > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        for (const y of strong) {
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
        }
        ctx.stroke()
      }
    },
    [timeSignatures, originalBpm, pixelsPerSecond, width],
  )

  // 绘制八度线（垂直线，在每个 C 音位置）
  const drawOctaveLines = useCallback(
    (ctx: CanvasRenderingContext2D, waterfallHeight: number) => {
      // C 音的 MIDI 编号：C1=24, C2=36, C3=48, C4=60, C5=72, C6=84, C7=96
      const cNotes = [24, 36, 48, 60, 72, 84, 96]

      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 1
      ctx.beginPath()

      for (const midi of cNotes) {
        const key = keyMap.get(midi)
        if (key) {
          // 在 C 键的左边缘画线
          const x = key.x
          ctx.moveTo(x, 0)
          ctx.lineTo(x, waterfallHeight)
        }
      }

      ctx.stroke()
    },
    [keyMap],
  )

  // 绘制瀑布流音符（动态层）
  const drawNotes = useCallback(
    (ctx: CanvasRenderingContext2D, currentTime: number) => {
      const waterfallHeight = waterfallHeightRef.current
      if (waterfallHeight <= 0) return

      const scalePitchClasses = getScalePitchClassesAtTime(currentTime)
      const hasKeyInfo = scalePitchClasses.size > 0

      const timeWindow = waterfallHeight / pixelsPerSecond
      const startTime = currentTime - 0.5
      const endTime = currentTime + timeWindow

      const visibleNotes = noteIndex
        ? noteIndex.getNotesInRange(startTime, endTime)
        : notes.filter(
            (note) =>
              note.time + note.duration >= startTime && note.time <= endTime,
          )

      const radius = 4

      // 绘制调内音
      for (const note of visibleNotes) {
        const key = keyMap.get(note.midi)
        if (!key) continue
        if (hasKeyInfo && isOutOfKey(note.midi, scalePitchClasses)) continue

        const timeOffset = note.time - currentTime
        const noteBottomY = waterfallHeight - timeOffset * pixelsPerSecond
        const noteHeight = Math.max(4, note.duration * pixelsPerSecond)
        const noteTopY = noteBottomY - noteHeight

        if (noteBottomY < 0 || noteTopY > waterfallHeight) continue

        const noteWidth = key.isBlack ? key.width * 0.9 : key.width * 0.85
        const noteX = key.x + (key.width - noteWidth) / 2

        ctx.fillStyle = colorToRgba(note.color, 0.85)
        drawRoundRectPath(ctx, noteX, noteTopY, noteWidth, noteHeight, radius)
        ctx.fill()
      }

      // 绘制调外音
      if (hasKeyInfo) {
        for (const note of visibleNotes) {
          const key = keyMap.get(note.midi)
          if (!key) continue
          if (!isOutOfKey(note.midi, scalePitchClasses)) continue

          const timeOffset = note.time - currentTime
          const noteBottomY = waterfallHeight - timeOffset * pixelsPerSecond
          const noteHeight = Math.max(4, note.duration * pixelsPerSecond)
          const noteTopY = noteBottomY - noteHeight

          if (noteBottomY < 0 || noteTopY > waterfallHeight) continue

          const noteWidth = key.isBlack ? key.width * 0.9 : key.width * 0.85
          const noteX = key.x + (key.width - noteWidth) / 2

          ctx.fillStyle = colorToRgba(note.color, 0.4)
          drawRoundRectPath(ctx, noteX, noteTopY, noteWidth, noteHeight, radius)
          ctx.fill()
        }
      }

      // 当前时间线
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, waterfallHeight - 1)
      ctx.lineTo(width, waterfallHeight - 1)
      ctx.stroke()
    },
    [
      notes,
      noteIndex,
      keyMap,
      pixelsPerSecond,
      width,
      getScalePitchClassesAtTime,
    ],
  )

  // 绘制钢琴键盘（静态层）
  const drawKeyboard = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      activeKeys: ReadonlyMap<number, ActiveKey>,
    ) => {
      const waterfallHeight = waterfallHeightRef.current

      // 白键
      for (const key of whiteKeys) {
        const active = activeKeys.get(key.midi)
        drawWhiteKey(
          ctx,
          key.x,
          waterfallHeight,
          key.width,
          key.height,
          !!active,
          active?.color,
        )
      }

      // 黑键
      for (const key of blackKeys) {
        const active = activeKeys.get(key.midi)
        drawBlackKey(
          ctx,
          key.x,
          waterfallHeight,
          key.width,
          key.height,
          !!active,
          active?.color,
        )
      }

      // 底部边框
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height - 0.5)
      ctx.lineTo(width, height - 0.5)
      ctx.stroke()
    },
    [whiteKeys, blackKeys, height, width],
  )

  // 完整绘制循环
  const draw = useCallback(() => {
    const noteCanvas = noteCanvasRef.current
    const pianoCanvas = pianoCanvasRef.current
    if (!noteCanvas || !pianoCanvas) return

    const noteCtx = noteCanvas.getContext('2d')
    const pianoCtx = pianoCanvas.getContext('2d')
    if (!noteCtx || !pianoCtx) return

    const currentTime = playbackState.currentTime
    const activeKeys = playbackState.getActiveKeys()
    const waterfallHeight = waterfallHeightRef.current

    const dpr = window.devicePixelRatio || 1

    // === 动态层：每帧更新 ===
    noteCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    noteCtx.clearRect(0, 0, width, height)
    drawOctaveLines(noteCtx, waterfallHeight)
    drawBeatGrid(noteCtx, currentTime, waterfallHeight)
    drawNotes(noteCtx, currentTime)

    // === 静态层：仅在活跃键变化时更新 ===
    const activeKeysKey = serializeActiveKeys(activeKeys)
    if (activeKeysKey !== lastActiveKeysRef.current) {
      lastActiveKeysRef.current = activeKeysKey
      pianoCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      pianoCtx.clearRect(0, 0, width, height)
      drawKeyboard(pianoCtx, activeKeys)
    }
  }, [width, height, drawOctaveLines, drawBeatGrid, drawNotes, drawKeyboard])

  // 订阅动画循环
  useEffect(() => {
    const unsubscribe = animationLoop.subscribe(draw, PRIORITY.RENDER)
    return unsubscribe
  }, [draw])

  // 尺寸变化时更新 canvas
  useEffect(() => {
    const noteCanvas = noteCanvasRef.current
    const pianoCanvas = pianoCanvasRef.current
    if (!noteCanvas || !pianoCanvas) return

    const dpr = window.devicePixelRatio || 1

    // 设置两层 canvas 尺寸
    for (const canvas of [noteCanvas, pianoCanvas]) {
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    // 强制重绘钢琴键盘
    lastActiveKeysRef.current = null
    draw()
  }, [width, height, draw])

  return (
    <div className="relative" style={{ width, height }}>
      {/* 动态层：瀑布流 */}
      <canvas
        ref={noteCanvasRef}
        className="absolute inset-0"
        style={{ imageRendering: 'crisp-edges' }}
      />
      {/* 静态层：钢琴键盘 */}
      <canvas
        ref={pianoCanvasRef}
        className="absolute inset-0"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  )
}

// 序列化活跃键用于脏检查
function serializeActiveKeys(keys: ReadonlyMap<number, ActiveKey>): string {
  if (keys.size === 0) return ''
  const arr: string[] = []
  for (const [midi, key] of keys) {
    arr.push(`${midi}:${key.color || ''}`)
  }
  return arr.sort().join(',')
}

// 简化的白键绘制（移除阴影，减少渐变复杂度）
function drawWhiteKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isPressed: boolean,
  highlightColor?: string,
): void {
  const r = Math.min(4, w * 0.1)

  drawRoundRectPath(ctx, x, y, w, h, r)

  if (isPressed && highlightColor) {
    ctx.fillStyle = highlightColor
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + h)
    g.addColorStop(0, '#fff')
    g.addColorStop(1, '#d8d8d8')
    ctx.fillStyle = g
  }
  ctx.fill()

  ctx.strokeStyle = isPressed ? highlightColor || '#666' : '#bbb'
  ctx.lineWidth = 1
  ctx.stroke()
}

// 简化的黑键绘制（移除阴影和高光）
function drawBlackKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  isPressed: boolean,
  highlightColor?: string,
): void {
  const r = Math.min(3, w * 0.15)

  drawRoundRectPath(ctx, x, y, w, h, r)

  if (isPressed && highlightColor) {
    ctx.fillStyle = highlightColor
  } else {
    const g = ctx.createLinearGradient(x, y, x, y + h)
    g.addColorStop(0, '#333')
    g.addColorStop(1, '#111')
    ctx.fillStyle = g
  }
  ctx.fill()

  ctx.strokeStyle = isPressed ? highlightColor || '#444' : '#000'
  ctx.lineWidth = 1
  ctx.stroke()
}
