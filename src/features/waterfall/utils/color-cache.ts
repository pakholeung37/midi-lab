// 颜色转换缓存 - 避免每帧重复解析颜色字符串

const cache = new Map<string, { r: number; g: number; b: number }>()
const brightnessCache = new Map<string, string>()
const hueShiftCache = new Map<string, string>()

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case rn:
      h = (gn - bn) / d + (gn < bn ? 6 : 0)
      break
    case gn:
      h = (bn - rn) / d + 2
      break
    default:
      h = (rn - gn) / d + 4
      break
  }

  return { h: h * 60, s, l }
}

function hueToRgb(p: number, q: number, t: number): number {
  let x = t
  if (x < 0) x += 1
  if (x > 1) x -= 1
  if (x < 1 / 6) return p + (q - p) * 6 * x
  if (x < 1 / 2) return q
  if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
  return p
}

function hslToRgb(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  if (s === 0) {
    const v = Math.round(l * 255)
    return { r: v, g: v, b: v }
  }

  const hn = h / 360
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  return {
    r: Math.round(hueToRgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, hn) * 255),
    b: Math.round(hueToRgb(p, q, hn - 1 / 3) * 255),
  }
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

/**
 * 调整颜色 hue，shiftDegrees 为正负角度。
 * 使用 1 度量化缓存，兼顾效果和性能。
 */
export function colorWithHueShift(color: string, shiftDegrees: number): string {
  const normalizedShift = Math.round(clamp(shiftDegrees, -180, 180))
  if (normalizedShift === 0) return color

  const cacheKey = `${color}|${normalizedShift}`
  const cached = hueShiftCache.get(cacheKey)
  if (cached) return cached

  const { r, g, b } = parseColor(color)
  const { h, s, l } = rgbToHsl(r, g, b)
  const shiftedHue = (h + normalizedShift + 360) % 360
  const rgb = hslToRgb(shiftedHue, s, l)

  const result = `rgb(${rgb.r},${rgb.g},${rgb.b})`
  hueShiftCache.set(cacheKey, result)
  return result
}
