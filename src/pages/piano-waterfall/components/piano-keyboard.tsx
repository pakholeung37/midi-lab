import { useEffect, useRef, useCallback } from 'react'
import type { PianoKeyLayout } from '../utils/piano-layout'
import { drawWhiteKey, drawBlackKey } from '../utils/draw-utils'
import type { ActiveKey } from '../types'

interface PianoKeyboardProps {
  keys: PianoKeyLayout[]
  activeKeys: Map<number, ActiveKey>
  width: number
  height: number
}

export function PianoKeyboard({
  keys,
  activeKeys,
  width,
  height,
}: PianoKeyboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number | undefined>(undefined)

  // 绘制钢琴键盘
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 分离白键和黑键
    const whiteKeys = keys.filter((k) => !k.isBlack)
    const blackKeys = keys.filter((k) => k.isBlack)

    // 先绘制所有白键
    for (const key of whiteKeys) {
      const activeKey = activeKeys.get(key.midi)
      const isPressed = !!activeKey
      const highlightColor = activeKey?.color

      drawWhiteKey(
        ctx,
        key.x,
        0,
        key.width,
        key.height,
        isPressed,
        highlightColor,
      )
    }

    // 再绘制所有黑键（在白键之上）
    for (const key of blackKeys) {
      const activeKey = activeKeys.get(key.midi)
      const isPressed = !!activeKey
      const highlightColor = activeKey?.color

      drawBlackKey(
        ctx,
        key.x,
        0,
        key.width,
        key.height,
        isPressed,
        highlightColor,
      )
    }

    // 绘制底部边框线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height - 0.5)
    ctx.lineTo(width, height - 0.5)
    ctx.stroke()
  }, [keys, activeKeys, width, height])

  // 使用 requestAnimationFrame 绘制
  useEffect(() => {
    const animate = () => {
      draw()
      frameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
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
