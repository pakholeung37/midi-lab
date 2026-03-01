// 钢琴乐器布局 - 实现 InstrumentLayout 接口
// 包含 88 键布局计算和键盘绘制逻辑

import type { ActiveKey } from '../../features/waterfall/types'
import type { InstrumentLayout } from '../../features/waterfall/instrument'
import { drawRoundRectPath } from '../../features/waterfall/utils/draw-utils-optimized'
import {
  calculatePianoLayout as calcLayout,
  type PianoKeyLayout,
} from './utils/piano-layout'

interface PianoInstrumentOptions {
  showKeys?: boolean
  horizontalScale?: number
}

export function calculatePianoInstrument(
  totalWidth: number,
  options?: PianoInstrumentOptions,
): InstrumentLayout {
  const showKeys = options?.showKeys ?? true
  const horizontalScale = options?.horizontalScale ?? 1
  const { keys } = calcLayout(totalWidth, { horizontalScale })

  const whiteKeys = keys.filter((k: PianoKeyLayout) => !k.isBlack)
  const blackKeys = keys.filter((k: PianoKeyLayout) => k.isBlack)

  const instrumentHeight = keys[0]?.height || 0
  const lastKey = keys[keys.length - 1]
  const totalKeyWidth = lastKey ? lastKey.x + lastKey.width : 0

  // 构建 MIDI -> Key 索引（用于参考线绘制）
  const keyMap = new Map<number, PianoKeyLayout>()
  for (const key of keys) {
    keyMap.set(key.midi, key)
  }

  return {
    keys: keys.map((k: PianoKeyLayout) => ({
      midi: k.midi,
      x: k.x,
      width: k.width,
      height: k.height,
      isBlack: k.isBlack,
      noteName: k.noteName,
    })),
    instrumentHeight,
    totalWidth: totalKeyWidth,

    drawInstrument(
      ctx: CanvasRenderingContext2D,
      activeKeys: ReadonlyMap<number, ActiveKey>,
      width: number,
      height: number,
    ) {
      if (!showKeys) return

      const waterfallHeight = Math.max(0, height - instrumentHeight)

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

    drawReferenceLines(
      ctx: CanvasRenderingContext2D,
      waterfallHeight: number,
      _width: number,
    ) {
      // 八度线（在每个 C 音位置）
      const cNotes = [24, 36, 48, 60, 72, 84, 96]

      ctx.strokeStyle = 'rgba(255,255,255,0.03)'
      ctx.lineWidth = 1
      ctx.beginPath()

      for (const midi of cNotes) {
        const key = keyMap.get(midi)
        if (key) {
          const x = key.x
          ctx.moveTo(x, 0)
          ctx.lineTo(x, waterfallHeight)
        }
      }

      ctx.stroke()
    },
  }
}

// 白键绘制
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

  ctx.strokeStyle = '#bbb'
  ctx.lineWidth = 1
  ctx.stroke()
}

// 黑键绘制
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

  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1
  ctx.stroke()
}
