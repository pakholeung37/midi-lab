// 颜色转换缓存 - 避免每帧重复解析颜色字符串

const cache = new Map<string, { r: number; g: number; b: number }>()
const brightnessCache = new Map<string, string>()

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function parseColor(color: string): { r: number; g: number; b: number } {
  const cached = cache.get(color)
  if (cached) return cached

  let r = 0,
    g = 0,
    b = 0

  if (color.startsWith('#')) {
    r = Number.parseInt(color.slice(1, 3), 16)
    g = Number.parseInt(color.slice(3, 5), 16)
    b = Number.parseInt(color.slice(5, 7), 16)
  } else if (color.startsWith('rgb')) {
    const match = color.match(/\d+/g)
    if (match) {
      r = Number.parseInt(match[0], 10)
      g = Number.parseInt(match[1], 10)
      b = Number.parseInt(match[2], 10)
    }
  }

  const result = { r, g, b }
  cache.set(color, result)
  return result
}

export function colorToRgba(color: string, alpha: number): string {
  const { r, g, b } = parseColor(color)
  return `rgba(${r},${g},${b},${alpha})`
}

/**
 * 按亮度系数调整颜色。
 * 仅做变暗，不向白色提亮，避免中高力度出现发白。
 */
export function colorWithBrightness(color: string, factor: number): string {
  const normalizedFactor = clamp(factor, 0.55, 1)
  const cacheKey = `${color}|${normalizedFactor.toFixed(3)}`
  const cached = brightnessCache.get(cacheKey)
  if (cached) return cached

  const { r, g, b } = parseColor(color)

  const nr = Math.round(r * normalizedFactor)
  const ng = Math.round(g * normalizedFactor)
  const nb = Math.round(b * normalizedFactor)

  const result = `rgb(${nr},${ng},${nb})`
  brightnessCache.set(cacheKey, result)
  return result
}
