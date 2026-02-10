// 通用瀑布流 Canvas 视图
// 双层 Canvas：动态层（音符+网格）+ 静态层（乐器面板）
// 通过 InstrumentLayout 接口支持不同乐器

import { useEffect, useRef, useCallback, useMemo } from 'react'
import type {
  WaterfallNote,
  ActiveKey,
  KeySignature,
  TimeSignature,
} from '../types'
import type { InstrumentLayout, InstrumentKey } from '../instrument'

import type { NoteTimeIndex } from '../core/note-index'
import { playbackState } from '../core/playback-state'
import { animationLoop, PRIORITY } from '../core/animation-loop'
import { drawRoundRectPath } from '../utils/draw-utils-optimized'
import { getScalePitchClasses, isOutOfKey } from '../utils/music-theory'
import { getBeatsInRange } from '../utils/beat-grid'
import { colorToRgba } from '../utils/color-cache'

interface WaterfallCanvasProps {
  notes: WaterfallNote[]
  noteIndex?: NoteTimeIndex
  layout: InstrumentLayout
  width: number
  height: number
  pixelsPerSecond: number
  keySignatures?: KeySignature[]
  timeSignatures?: TimeSignature[]
  originalBpm?: number
}

export function WaterfallCanvas({
  notes,
  noteIndex,
  layout,
  width,
  height,
  pixelsPerSecond,
  keySignatures = [],
  timeSignatures = [],
  originalBpm = 120,
}: WaterfallCanvasProps) {
  // 双层 canvas 引用
  const noteCanvasRef = useRef<HTMLCanvasElement>(null)
  const instrumentCanvasRef = useRef<HTMLCanvasElement>(null)
  const waterfallHeightRef = useRef<number>(0)

  // 脏标记：上一帧的活跃键序列化
  const lastActiveKeysRef = useRef<string | null>(null)

  // 构建 MIDI -> Key 索引
  const keyMap = useMemo(() => {
    const map = new Map<number, InstrumentKey>()
    for (const key of layout.keys) {
      map.set(key.midi, key)
    }
    return map
  }, [layout.keys])

  // 计算乐器面板高度
  const instrumentHeight = layout.instrumentHeight
  waterfallHeightRef.current = Math.max(0, height - instrumentHeight)

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
      const strong: { y: number; measure: number }[] = []
      const medium: number[] = []
      const weak: number[] = []

      for (const beat of beats) {
        const timeOffset = beat.time - currentTime
        const y = waterfallHeight - timeOffset * pixelsPerSecond
        if (y < 0 || y > waterfallHeight) continue

        if (beat.strength === 'strong')
          strong.push({ y, measure: beat.measure })
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
        for (const { y } of strong) {
          ctx.moveTo(0, y)
          ctx.lineTo(width, y)
        }
        ctx.stroke()

        // 绘制小节号
        ctx.font = '10px monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'
        for (const { y, measure } of strong) {
          ctx.fillText(String(measure), 4, y - 2)
        }
      }
    },
    [timeSignatures, originalBpm, pixelsPerSecond, width],
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

      // 绘制调外音（更浅的颜色）
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

          ctx.fillStyle = colorToRgba(note.color, 0.35)
          drawRoundRectPath(
            ctx, noteX, noteTopY, noteWidth, noteHeight, radius,
          )
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

  // 完整绘制循环
  const draw = useCallback(() => {
    const noteCanvas = noteCanvasRef.current
    const instrumentCanvas = instrumentCanvasRef.current
    if (!noteCanvas || !instrumentCanvas) return

    const noteCtx = noteCanvas.getContext('2d')
    const instrumentCtx = instrumentCanvas.getContext('2d')
    if (!noteCtx || !instrumentCtx) return

    const currentTime = playbackState.currentTime
    const activeKeys = playbackState.getActiveKeys()
    const waterfallHeight = waterfallHeightRef.current

    const dpr = window.devicePixelRatio || 1

    // === 动态层：每帧更新 ===
    noteCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    noteCtx.clearRect(0, 0, width, height)

    // 绘制参考线（由乐器提供）
    if (layout.drawReferenceLines) {
      layout.drawReferenceLines(noteCtx, waterfallHeight, width)
    }

    drawBeatGrid(noteCtx, currentTime, waterfallHeight)
    drawNotes(noteCtx, currentTime)

    // === 静态层：仅在活跃键变化时更新 ===
    const activeKeysKey = serializeActiveKeys(activeKeys)
    if (activeKeysKey !== lastActiveKeysRef.current) {
      lastActiveKeysRef.current = activeKeysKey
      instrumentCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      instrumentCtx.clearRect(0, 0, width, height)
      layout.drawInstrument(
        instrumentCtx, activeKeys, width, height,
      )
    }
  }, [width, height, layout, drawBeatGrid, drawNotes])

  // 订阅动画循环
  useEffect(() => {
    const unsubscribe = animationLoop.subscribe(draw, PRIORITY.RENDER)
    return unsubscribe
  }, [draw])

  // 尺寸变化时更新 canvas
  useEffect(() => {
    const noteCanvas = noteCanvasRef.current
    const instrumentCanvas = instrumentCanvasRef.current
    if (!noteCanvas || !instrumentCanvas) return

    const dpr = window.devicePixelRatio || 1

    // 设置两层 canvas 尺寸
    for (const canvas of [noteCanvas, instrumentCanvas]) {
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
    }

    // 强制重绘
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
      {/* 静态层：乐器面板 */}
      <canvas
        ref={instrumentCanvasRef}
        className="absolute inset-0"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  )
}

// 序列化活跃键用于脏检查
function serializeActiveKeys(
  keys: ReadonlyMap<number, ActiveKey>,
): string {
  if (keys.size === 0) return ''
  const arr: string[] = []
  for (const [midi, key] of keys) {
    arr.push(`${midi}:${key.color || ''}`)
  }
  return arr.sort().join(',')
}
