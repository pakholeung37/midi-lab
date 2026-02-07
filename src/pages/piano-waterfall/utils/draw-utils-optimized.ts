// 优化后的 Canvas 绘制工具
// 相比原版，移除了昂贵的 shadowBlur，支持批量绘制

import type { GradientCache } from './gradient-cache'

/**
 * 绘制圆角矩形路径（不填充，不描边）
 */
export function drawRoundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/**
 * 批量绘制同色音符
 * 相比原版，移除了 save/restore 和 shadowBlur，改为批量设置状态
 */
export function drawNotesBatch(
  ctx: CanvasRenderingContext2D,
  notes: Array<{
    x: number
    y: number
    width: number
    height: number
    color: string
  }>,
  gradientCache: GradientCache,
  opacity = 0.85,
): void {
  if (notes.length === 0) return

  // 按颜色分组
  const colorGroups = new Map<
    string,
    Array<{ x: number; y: number; width: number; height: number }>
  >()

  for (const note of notes) {
    let group = colorGroups.get(note.color)
    if (!group) {
      group = []
      colorGroups.set(note.color, group)
    }
    group.push(note)
  }

  // 设置通用绘制属性（只设置一次）
  ctx.globalAlpha = opacity
  const radius = 4

  // 按颜色批量绘制
  for (const [color, groupNotes] of colorGroups) {
    // 获取该颜色的渐变（使用第一个音符的高度作为参考）
    const firstNote = groupNotes[0]
    const gradient = gradientCache.get(color, firstNote.height)

    ctx.fillStyle = gradient

    // 批量绘制路径
    for (const note of groupNotes) {
      drawRoundRectPath(ctx, note.x, note.y, note.width, note.height, radius)
      ctx.fill()
    }
  }

  // 重置全局透明度
  ctx.globalAlpha = 1
}

/**
 * 绘制钢琴白键（优化版）
 * 移除 save/restore，批量设置状态
 */
export function drawWhiteKeyOptimized(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isPressed: boolean,
  highlightColor?: string,
): void {
  const radius = Math.min(4, width * 0.1)

  // 绘制阴影（仅在未按下时）
  if (!isPressed) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 2
  }

  // 绘制键体路径
  drawRoundRectPath(ctx, x, y, width, height, radius)

  // 渐变填充
  const gradient = ctx.createLinearGradient(x, y, x, y + height)
  if (isPressed && highlightColor) {
    gradient.addColorStop(0, '#2a2a2a')
    gradient.addColorStop(0.5, highlightColor)
    gradient.addColorStop(1, highlightColor)
  } else {
    gradient.addColorStop(0, '#f5f5f5')
    gradient.addColorStop(0.05, '#ffffff')
    gradient.addColorStop(0.9, '#e8e8e8')
    gradient.addColorStop(1, '#d0d0d0')
  }

  ctx.fillStyle = gradient
  ctx.fill()

  // 清除阴影以绘制边框
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  ctx.strokeStyle = isPressed ? highlightColor || '#666' : '#bbb'
  ctx.lineWidth = isPressed ? 2 : 1
  ctx.stroke()
}

/**
 * 批量绘制钢琴键盘
 * 优化：批量设置状态，减少 Canvas 状态切换
 */
export function drawPianoKeyboard(
  ctx: CanvasRenderingContext2D,
  whiteKeys: Array<{
    x: number
    y: number
    width: number
    height: number
    midi: number
  }>,
  blackKeys: Array<{
    x: number
    y: number
    width: number
    height: number
    midi: number
  }>,
  activeKeys: ReadonlyMap<number, { color?: string }>,
): void {
  // 先绘制所有白键
  for (const key of whiteKeys) {
    const active = activeKeys.get(key.midi)
    drawWhiteKeyOptimized(
      ctx,
      key.x,
      key.y,
      key.width,
      key.height,
      !!active,
      active?.color,
    )
  }

  // 再绘制所有黑键
  for (const key of blackKeys) {
    const active = activeKeys.get(key.midi)
    drawBlackKeyOptimized(
      ctx,
      key.x,
      key.y,
      key.width,
      key.height,
      !!active,
      active?.color,
    )
  }
}

/**
 * 绘制钢琴黑键（优化版）
 */
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
