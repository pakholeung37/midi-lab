function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

const VELOCITY_FLOOR = 0.25
const VELOCITY_CEILING = 0.9

/**
 * 固定线性力度映射：
 * 把常见力度区间 [0.25, 0.9] 线性映射到 [0, 1]
 */
export function mapVelocityNonLinear(velocity: number): number {
  return clamp(
    (velocity - VELOCITY_FLOOR) / (VELOCITY_CEILING - VELOCITY_FLOOR),
    0,
    1,
  )
}
