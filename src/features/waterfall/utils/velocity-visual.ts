function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

const VELOCITY_FLOOR = 0.25
const VELOCITY_CEILING = 0.9
const VISUAL_GAMMA = 0.75

/**
 * 固定非线性力度映射：
 * 1) 先把常见力度区间 [0.25, 0.9] 映射到 [0, 1]
 * 2) 再用 gamma(<1) 提亮常用力度，并拉开层次
 */
export function mapVelocityNonLinear(velocity: number): number {
  const normalized = clamp(
    (velocity - VELOCITY_FLOOR) / (VELOCITY_CEILING - VELOCITY_FLOOR),
    0,
    1,
  )
  return normalized ** VISUAL_GAMMA
}
