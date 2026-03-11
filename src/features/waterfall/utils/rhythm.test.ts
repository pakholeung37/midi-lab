import { describe, expect, it } from 'vitest'
import { getBeatsInRange } from './beat-grid'
import { getBeatDurationSeconds, getMeasureDurationSeconds } from './rhythm'

describe('getBeatDurationSeconds', () => {
  it('uses the denominator note value instead of assuming quarter-note beats', () => {
    expect(getBeatDurationSeconds(120, 4)).toBeCloseTo(0.5, 5)
    expect(getBeatDurationSeconds(120, 8)).toBeCloseTo(0.25, 5)
    expect(getBeatDurationSeconds(120, 2)).toBeCloseTo(1, 5)
  })
})

describe('getMeasureDurationSeconds', () => {
  it('calculates compound-meter bar length correctly for 12/8', () => {
    expect(
      getMeasureDurationSeconds(120, { numerator: 12, denominator: 8 }),
    ).toBeCloseTo(3, 5)
  })
})

describe('getBeatsInRange', () => {
  it('places 12/8 beats at eighth-note spacing', () => {
    const beats = getBeatsInRange(0, 3, 120, [
      { time: 0, numerator: 12, denominator: 8 },
    ])

    expect(beats).toHaveLength(12)
    expect(beats[0]).toMatchObject({ time: 0, beat: 1, strength: 'strong' })
    expect(beats[3]).toMatchObject({ time: 0.75, beat: 4, strength: 'medium' })
    expect(beats[11]).toMatchObject({ time: 2.75, beat: 12 })
  })

  it('places 2/2 beats at half-note spacing', () => {
    const beats = getBeatsInRange(0, 2, 120, [
      { time: 0, numerator: 2, denominator: 2 },
    ])

    expect(beats).toHaveLength(2)
    expect(beats[0]).toMatchObject({ time: 0, beat: 1, strength: 'strong' })
    expect(beats[1]).toMatchObject({ time: 1, beat: 2, strength: 'weak' })
  })
})
