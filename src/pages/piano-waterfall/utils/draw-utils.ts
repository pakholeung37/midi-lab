// Canvas 绘制工具

// 绘制圆角矩形
export function drawRoundRect(
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

// 绘制发光效果
export function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
  blur: number,
): void {
  ctx.save()
  ctx.shadowColor = color
  ctx.shadowBlur = blur
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)
  ctx.restore()
}

// 绘制渐变填充的圆角矩形
export function drawGradientRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  opacity: number = 1,
): void {
  ctx.save()

  // 创建垂直渐变
  const gradient = ctx.createLinearGradient(x, y, x, y + height)
  const baseColor = color.replace(')', `, ${opacity})`).replace('rgb', 'rgba')
  const transparentColor = color.replace(')', ', 0)').replace('rgb', 'rgba')

  gradient.addColorStop(0, transparentColor)
  gradient.addColorStop(0.1, baseColor)
  gradient.addColorStop(0.9, baseColor)
  gradient.addColorStop(1, transparentColor)

  // 绘制发光效果
  ctx.shadowColor = color
  ctx.shadowBlur = 15
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 绘制圆角矩形路径
  drawRoundRect(ctx, x, y, width, height, radius)

  // 填充
  ctx.fillStyle = gradient
  ctx.fill()

  // 绘制边框
  ctx.strokeStyle = baseColor
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.restore()
}

// 绘制钢琴白键
export function drawWhiteKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isPressed: boolean,
  highlightColor?: string,
): void {
  ctx.save()

  // 键的圆角
  const radius = Math.min(4, width * 0.1)

  // 绘制阴影
  if (!isPressed) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 3
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 2
  }

  // 绘制键体
  drawRoundRect(ctx, x, y, width, height, radius)

  // 渐变填充
  const gradient = ctx.createLinearGradient(x, y, x, y + height)
  if (isPressed && highlightColor) {
    // 按下状态 - 使用高亮色
    gradient.addColorStop(0, '#2a2a2a')
    gradient.addColorStop(0.5, highlightColor)
    gradient.addColorStop(1, highlightColor)
  } else {
    // 正常状态
    gradient.addColorStop(0, '#f5f5f5')
    gradient.addColorStop(0.05, '#ffffff')
    gradient.addColorStop(0.9, '#e8e8e8')
    gradient.addColorStop(1, '#d0d0d0')
  }

  ctx.fillStyle = gradient
  ctx.fill()

  // 移除阴影以绘制边框
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0

  // 绘制边框
  ctx.strokeStyle = isPressed ? highlightColor || '#666' : '#bbb'
  ctx.lineWidth = isPressed ? 2 : 1
  ctx.stroke()

  ctx.restore()
}

// 绘制钢琴黑键
export function drawBlackKey(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isPressed: boolean,
  highlightColor?: string,
): void {
  ctx.save()

  // 黑键圆角
  const radius = Math.min(3, width * 0.15)

  // 绘制阴影
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 3

  // 绘制键体
  drawRoundRect(ctx, x, y, width, height, radius)

  // 渐变填充
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height)
  if (isPressed && highlightColor) {
    // 按下状态
    gradient.addColorStop(0, '#1a1a1a')
    gradient.addColorStop(0.3, highlightColor)
    gradient.addColorStop(1, highlightColor)
  } else {
    // 正常状态 - 模拟乌木质感
    gradient.addColorStop(0, '#333')
    gradient.addColorStop(0.1, '#111')
    gradient.addColorStop(0.5, '#0a0a0a')
    gradient.addColorStop(0.9, '#1a1a1a')
    gradient.addColorStop(1, '#222')
  }

  ctx.fillStyle = gradient
  ctx.fill()

  // 移除阴影
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

  ctx.restore()
}
