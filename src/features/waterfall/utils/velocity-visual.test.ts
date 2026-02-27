import { describe, expect, it } from 'vitest'
import { mapVelocityNonLinear } from './velocity-visual'

describe('mapVelocityNonLinear', () => {
  it('clamps out-of-range input and preserves bounds', () => {
    expect(mapVelocityNonLinear(-1)).toBe(0)
    expect(mapVelocityNonLinear(0)).toBe(0)
    expect(mapVelocityNonLinear(0.25)).toBe(0)
    expect(mapVelocityNonLinear(0.9)).toBe(1)
    expect(mapVelocityNonLinear(1)).toBe(1)
    expect(mapVelocityNonLinear(2)).toBe(1)
  })

  it('is monotonic for ascending velocity values', () => {
    const samples = [0.25, 0.35, 0.45, 0.6, 0.75, 0.9]
    let previous = -1

    for (const value of samples) {
      const mapped = mapVelocityNonLinear(value)
      expect(mapped).toBeGreaterThan(previous)
      previous = mapped
    }
  })

  it('uses fixed range normalization + gamma 0.75 mapping', () => {
    expect(mapVelocityNonLinear(0.575)).toBeCloseTo(0.594603, 5)
    expect(mapVelocityNonLinear(0.64)).toBeCloseTo(0.681732, 5)
  })
})
