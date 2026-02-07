import { useEffect, useRef, useCallback, useMemo } from 'react'
import type { WaterfallNote } from '../types'
import type { PianoKeyLayout } from '../utils/piano-layout'
import { drawGradientRoundRect } from '../utils/draw-utils'

interface WaterfallCanvasProps {
  notes: WaterfallNote[]
  keys: PianoKeyLayout[]
  currentTime: number
  width: number
  height: number
  pixelsPerSecond: number
}

export function WaterfallCanvas({
  notes,
  keys,
  currentTime,
  width,
  height,
  pixelsPerSecond,
}: WaterfallCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 构建 MIDI -> Key 索引以提升查找性能
  const keyMap = useMemo(() => {
    const map = new Map<number, PianoKeyLayout>()
    for (const key of keys) {
      map.set(key.midi, key)
    }
    return map
  }, [keys])

  // 绘制瀑布流
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布 - 使用透明背景
    ctx.clearRect(0, 0, width, height)

    // 当前播放时间对应底部（钢琴键盘顶部）
    // 未来的音符在上方，已过去的音符在下方（不可见）
    const startTime = currentTime
    const endTime = currentTime + height / pixelsPerSecond

    // 过滤可见音符
    const visibleNotes = notes.filter(
      (note) => note.time + note.duration >= startTime && note.time <= endTime,
    )

    // 绘制音符
    for (const note of visibleNotes) {
      // 使用 Map 查找对应的钢琴键
      const key = keyMap.get(note.midi)
      if (!key) continue

      // 计算音符位置
      // 音符距离当前时间的秒数
      const timeOffset = note.time - currentTime
      // 音符底部的 Y 坐标（从底部向上）
      const noteBottomY = height - timeOffset * pixelsPerSecond
      const noteHeight = Math.max(4, note.duration * pixelsPerSecond)
      const noteTopY = noteBottomY - noteHeight

      // 计算音符宽度 (比琴键略窄)
      const noteWidth = key.isBlack ? key.width * 0.9 : key.width * 0.85
      const noteX = key.x + (key.width - noteWidth) / 2

      // 绘制音符 (圆角矩形带发光)
      const radius = Math.min(4, noteWidth * 0.2)
      drawGradientRoundRect(
        ctx,
        noteX,
        noteTopY,
        noteWidth,
        noteHeight,
        radius,
        note.color,
        0.85,
      )
    }

    // 绘制当前时间指示线（在底部）
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, height - 1)
    ctx.lineTo(width, height - 1)
    ctx.stroke()
  }, [
    notes,
    keyMap,
    currentTime,
    width,
    height,
    pixelsPerSecond,
  ])

  // 使用 requestAnimationFrame 绘制
  useEffect(() => {
    let frameId: number

    const animate = () => {
      draw()
      frameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block"
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}
