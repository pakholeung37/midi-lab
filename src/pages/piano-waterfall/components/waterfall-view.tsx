// 统一的瀑布流 + 钢琴键盘视图
// 使用单一 Canvas 渲染，减少层叠和状态切换

import { useEffect, useRef, useCallback, useMemo } from 'react'
import type { WaterfallNote, ActiveKey } from '../types'
import type { PianoKeyLayout } from '../utils/piano-layout'

import type { NoteTimeIndex } from '../core/note-index'
import { playbackState } from '../core/playback-state'
import { animationLoop, PRIORITY } from '../core/animation-loop'
import {
  drawWhiteKeyOptimized,
  drawRoundRectPath,
} from '../utils/draw-utils-optimized'

interface WaterfallViewProps {
  notes: WaterfallNote[]
  noteIndex?: NoteTimeIndex // 使用索引进行 O(log n) 查询
  keys: PianoKeyLayout[]
  width: number
  height: number
  pixelsPerSecond: number
}

export function WaterfallView({
  notes,
  noteIndex,
  keys,
  width,
  height,
  pixelsPerSecond,
}: WaterfallViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const waterfallHeightRef = useRef<number>(0)

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

  // 绘制瀑布流音符
  const drawNotes = useCallback(
    (ctx: CanvasRenderingContext2D, currentTime: number) => {
      const waterfallHeight = waterfallHeightRef.current
      if (waterfallHeight <= 0) return

      // 可见时间范围：从当前时间往前一点（显示正在播放的），到未来的时间窗口
      const timeWindow = waterfallHeight / pixelsPerSecond
      const startTime = currentTime - 0.5 // 往前半秒，确保正在播放的音符也显示
      const endTime = currentTime + timeWindow

      // 使用索引查询可见音符 O(k) 而不是 O(n)
      const visibleNotes = noteIndex
        ? noteIndex.getNotesInRange(startTime, endTime)
        : notes.filter(
            (note) =>
              note.time + note.duration >= startTime && note.time <= endTime,
          )

      // 按颜色分组绘制，减少状态切换
      const notesByColor = new Map<string, WaterfallNote[]>()
      for (const note of visibleNotes) {
        const list = notesByColor.get(note.color) || []
        list.push(note)
        notesByColor.set(note.color, list)
      }

      // 批量绘制每个颜色组
      const radius = 4

      for (const [color, colorNotes] of notesByColor) {
        for (const note of colorNotes) {
          const key = keyMap.get(note.midi)
          if (!key) continue

          // 计算音符位置
          // 音符的底部 Y = 瀑布流底部 - (音符开始时间 - 当前时间) * 像素/秒
          const timeOffset = note.time - currentTime
          const noteBottomY = waterfallHeight - timeOffset * pixelsPerSecond
          const noteHeight = Math.max(4, note.duration * pixelsPerSecond)
          const noteTopY = noteBottomY - noteHeight

          // 跳过完全不可见的音符
          if (noteBottomY < 0 || noteTopY > waterfallHeight) continue

          // 音符宽度 (比琴键略窄)
          const noteWidth = key.isBlack ? key.width * 0.9 : key.width * 0.85
          const noteX = key.x + (key.width - noteWidth) / 2

          // 使用纯色填充
          ctx.fillStyle = colorToRgba(color, 0.85)

          // 使用优化的绘制路径
          drawRoundRectPath(ctx, noteX, noteTopY, noteWidth, noteHeight, radius)
          ctx.fill()
        }
      }

      // 绘制当前时间指示线
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, waterfallHeight - 1)
      ctx.lineTo(width, waterfallHeight - 1)
      ctx.stroke()
    },
    [notes, noteIndex, keyMap, pixelsPerSecond, width],
  )

  // 绘制钢琴键盘
  const drawKeyboard = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      activeKeys: ReadonlyMap<number, ActiveKey>,
    ) => {
      const waterfallHeight = waterfallHeightRef.current

      // 先绘制所有白键
      for (const key of whiteKeys) {
        const active = activeKeys.get(key.midi)
        drawWhiteKeyOptimized(
          ctx,
          key.x,
          waterfallHeight,
          key.width,
          key.height,
          !!active,
          active?.color,
        )
      }

      // 再绘制所有黑键（在白键之上）
      for (const key of blackKeys) {
        const active = activeKeys.get(key.midi)
        drawBlackKeyOptimized(
          ctx,
          key.x,
          waterfallHeight,
          key.width,
          key.height,
          !!active,
          active?.color,
        )
      }

      // 绘制底部边框线
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height - 0.5)
      ctx.lineTo(width, height - 0.5)
      ctx.stroke()
    },
    [whiteKeys, blackKeys, height, width],
  )

  // 完整的绘制循环
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 获取当前状态
    const currentTime = playbackState.currentTime
    const activeKeys = playbackState.getActiveKeys()

    // 重置变换矩阵并设置 DPR 缩放
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制瀑布流
    drawNotes(ctx, currentTime)

    // 绘制钢琴键盘
    drawKeyboard(ctx, activeKeys)
  }, [width, height, drawNotes, drawKeyboard])

  // 订阅动画循环
  useEffect(() => {
    const unsubscribe = animationLoop.subscribe(draw, PRIORITY.RENDER)
    return unsubscribe
  }, [draw])

  // 尺寸变化时更新 canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 设置实际像素尺寸（考虑 devicePixelRatio 以支持 Retina 屏）
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr

    // 设置 CSS 显示尺寸
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // 立即重绘
    draw()
  }, [width, height, draw])

  return (
    <canvas
      ref={canvasRef}
      className="block"
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}

// 将颜色转换为 rgba 格式
function colorToRgba(color: string, alpha: number): string {
  // 如果已经是 rgba，替换 alpha
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${alpha})`)
  }

  // 如果是 rgb，转换为 rgba
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
  }

  // 如果是 hex，转换为 rgba
  if (color.startsWith('#')) {
    const r = Number.parseInt(color.slice(1, 3), 16)
    const g = Number.parseInt(color.slice(3, 5), 16)
    const b = Number.parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  // 未知格式，原样返回
  return color
}

// 绘制钢琴黑键（优化版，内联避免额外导入）
function drawBlackKeyOptimized(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isPressed: boolean,
  highlightColor?: string,
): void {
  const radius = Math.min(3, width * 0.15)

  // 绘制阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 3

  // 绘制键体
  drawRoundRectPath(ctx, x, y, width, height, radius)

  // 渐变填充
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
  if (isPressed && highlightColor) {
    gradient.addColorStop(0, '#1a1a1a')
    gradient.addColorStop(0.3, highlightColor)
    gradient.addColorStop(1, highlightColor)
  } else {
    gradient.addColorStop(0, '#333')
    gradient.addColorStop(0.1, '#111')
    gradient.addColorStop(0.5, '#0a0a0a')
    gradient.addColorStop(0.9, '#1a1a1a')
    gradient.addColorStop(1, '#222')
  }

  ctx.fillStyle = gradient
  ctx.fill()

  // 清除阴影
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 高光边缘
  if (!isPressed) {
    const highlightGradient = ctx.createLinearGradient(
      x,
      y,
      x,
      y + height * 0.4,
    )
    highlightGradient.addColorStop(0, 'rgba(255,255,255,0.3)')
    highlightGradient.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.fillStyle = highlightGradient
    ctx.fillRect(x + 2, y, width - 4, height * 0.4)
  }

  // 边框
  ctx.strokeStyle = isPressed ? highlightColor || '#444' : '#000'
  ctx.lineWidth = isPressed ? 2 : 1
  ctx.stroke()
}
