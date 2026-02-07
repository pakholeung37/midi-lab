// 渐变缓存 - 避免每帧创建新的渐变对象
// 对性能至关重要：创建 CanvasGradient 是昂贵的操作

export class GradientCache {
  private cache: Map<string, CanvasGradient> = new Map()
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
  private currentHeight = 0

  constructor(
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  ) {
    this.ctx = ctx
  }

  /**
   * 当画布高度变化时更新参考高度
   * 这会清空缓存，因为渐变是基于高度的
   */
  updateHeight(height: number) {
    if (this.currentHeight !== height) {
      this.currentHeight = height
      this.cache.clear()
    }
  }

  /**
   * 获取或创建渐变
   * @param color 基础颜色 (rgb/rgba 格式)
   * @param noteHeight 音符高度（用于确定渐变长度）
   */
  get(color: string, noteHeight: number): CanvasGradient {
    // 将高度分组，避免为每个像素高度创建不同的渐变
    // 10px 为一个区间
    const heightBucket = Math.floor(noteHeight / 10) * 10
    const key = `${color}-${heightBucket}`

    let gradient = this.cache.get(key)
    if (!gradient) {
      gradient = this.createGradient(color, heightBucket)
      this.cache.set(key, gradient)
    }

    return gradient
  }

  /**
   * 创建垂直渐变，顶部和底部透明，中间不透明
   */
  private createGradient(color: string, height: number): CanvasGradient {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, height)

    // 将颜色转换为带透明度的 rgba 格式
    const baseColor = this.toRgba(color, 0.85)
    const transparentColor = this.toRgba(color, 0)

    // 渐变 stops：透明 -> 不透明 -> 不透明 -> 透明
    gradient.addColorStop(0, transparentColor)
    gradient.addColorStop(0.1, baseColor)
    gradient.addColorStop(0.9, baseColor)
    gradient.addColorStop(1, transparentColor)

    return gradient
  }

  /**
   * 将 rgb/rgba/hex 颜色转换为 rgba 格式
   */
  private toRgba(color: string, alpha: number): string {
    // 如果已经是 rgba，替换 alpha
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+%?\s*\)$/, `${alpha})`)
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

  /** 清空缓存 */
  clear() {
    this.cache.clear()
  }

  /** 获取缓存统计信息（用于调试） */
  getStats() {
    return {
      cachedGradients: this.cache.size,
      currentHeight: this.currentHeight,
    }
  }
}

// 全局渐变缓存实例（在没有 canvas context 时使用）
let globalGradientCache: GradientCache | null = null

export function getGradientCache(
  ctx?: CanvasRenderingContext2D,
): GradientCache {
  if (!globalGradientCache && ctx) {
    globalGradientCache = new GradientCache(ctx)
  }
  if (!globalGradientCache) {
    throw new Error(
      'GradientCache not initialized - provide a canvas context first',
    )
  }
  return globalGradientCache
}
