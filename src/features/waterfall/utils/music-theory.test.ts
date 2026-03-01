import { describe, expect, it } from 'vitest'
import {
  hasKeyModulation,
  inferTonality,
  getScalePitchClasses,
  normalizeToneJsKeySignature,
} from './music-theory'

function sortPitchClasses(set: Set<number>): number[] {
  return Array.from(set).sort((a, b) => a - b)
}

describe('normalizeToneJsKeySignature', () => {
  it('keeps major keys unchanged', () => {
    expect(normalizeToneJsKeySignature('Eb', 'major')).toEqual({
      key: 'Eb',
      scale: 'major',
    })
  })

  it('maps ToneJS minor key name to tonic', () => {
    expect(normalizeToneJsKeySignature('C', 'minor')).toEqual({
      key: 'A',
      scale: 'minor',
    })
    expect(normalizeToneJsKeySignature('Eb', 'minor')).toEqual({
      key: 'C',
      scale: 'minor',
    })
  })
})

describe('getScalePitchClasses', () => {
  it('returns correct pitch classes for normalized A minor', () => {
    const normalized = normalizeToneJsKeySignature('C', 'minor')
    expect(sortPitchClasses(getScalePitchClasses(normalized.key, normalized.scale)))
      .toEqual([0, 2, 4, 5, 7, 9, 11])
  })
})

describe('inferTonality', () => {
  it('infers C major for an obvious C major melody', () => {
    const notes = [
      { id: '1', midi: 60, time: 0, duration: 1.2, velocity: 0.8, trackIndex: 0, color: '#fff' },
      { id: '2', midi: 64, time: 1.3, duration: 0.8, velocity: 0.7, trackIndex: 0, color: '#fff' },
      { id: '3', midi: 67, time: 2.2, duration: 0.8, velocity: 0.7, trackIndex: 0, color: '#fff' },
      { id: '4', midi: 72, time: 3.2, duration: 1.8, velocity: 0.85, trackIndex: 0, color: '#fff' },
      { id: '5', midi: 48, time: 0, duration: 3.8, velocity: 0.74, trackIndex: 1, color: '#fff' }, // bass C
      { id: '6', midi: 55, time: 4.2, duration: 0.8, velocity: 0.68, trackIndex: 1, color: '#fff' }, // bass G
      { id: '7', midi: 48, time: 5.1, duration: 1.9, velocity: 0.78, trackIndex: 1, color: '#fff' }, // ending bass C
      { id: '8', midi: 60, time: 5.2, duration: 1.7, velocity: 0.82, trackIndex: 0, color: '#fff' }, // ending C
    ]

    const inferred = inferTonality(notes)
    expect(inferred).not.toBeNull()
    expect(inferred?.key).toBe('C')
    expect(inferred?.scale).toBe('major')
  })

  it('prefers G minor over relative Bb major when tonic center is G', () => {
    const notes = [
      { id: '1', midi: 55, time: 0, duration: 2, velocity: 0.8, trackIndex: 0, color: '#fff' }, // G
      { id: '2', midi: 58, time: 2.2, duration: 0.8, velocity: 0.75, trackIndex: 0, color: '#fff' }, // Bb
      { id: '3', midi: 62, time: 3.1, duration: 0.8, velocity: 0.75, trackIndex: 0, color: '#fff' }, // D
      { id: '4', midi: 67, time: 4, duration: 1.2, velocity: 0.8, trackIndex: 0, color: '#fff' }, // G
      { id: '5', midi: 70, time: 5.4, duration: 1.2, velocity: 0.8, trackIndex: 0, color: '#fff' }, // Bb
      { id: '6', midi: 74, time: 6.7, duration: 0.8, velocity: 0.7, trackIndex: 0, color: '#fff' }, // D
      { id: '7', midi: 67, time: 8, duration: 2.6, velocity: 0.85, trackIndex: 0, color: '#fff' }, // ending G
      { id: '8', midi: 43, time: 0, duration: 4.8, velocity: 0.75, trackIndex: 1, color: '#fff' }, // bass G
      { id: '9', midi: 46, time: 5, duration: 1.2, velocity: 0.72, trackIndex: 1, color: '#fff' }, // bass Bb
      { id: '10', midi: 50, time: 6.3, duration: 1, velocity: 0.72, trackIndex: 1, color: '#fff' }, // bass D
      { id: '11', midi: 43, time: 7.5, duration: 3.1, velocity: 0.8, trackIndex: 1, color: '#fff' }, // ending bass G
      { id: '12', midi: 65, time: 1.1, duration: 0.7, velocity: 0.68, trackIndex: 0, color: '#fff' }, // F
      { id: '13', midi: 63, time: 2.9, duration: 0.7, velocity: 0.68, trackIndex: 0, color: '#fff' }, // Eb
      { id: '14', midi: 69, time: 5.9, duration: 0.5, velocity: 0.65, trackIndex: 0, color: '#fff' }, // A passing tone
    ]

    const inferred = inferTonality(notes)
    expect(inferred).not.toBeNull()
    expect(inferred?.key).toBe('G')
    expect(inferred?.scale).toBe('minor')
    expect(inferred?.confidence).toBeGreaterThan(0.5)
  })
})

describe('hasKeyModulation', () => {
  it('returns false for empty or repeated same key signatures', () => {
    expect(hasKeyModulation([])).toBe(false)
    expect(
      hasKeyModulation([
        { time: 0, key: 'Bb', scale: 'major' },
        { time: 0, key: 'Bb', scale: 'major' },
        { time: 32, key: 'Bb', scale: 'major' },
      ]),
    ).toBe(false)
  })

  it('returns true when key or mode changes', () => {
    expect(
      hasKeyModulation([
        { time: 0, key: 'C', scale: 'major' },
        { time: 24, key: 'G', scale: 'major' },
      ]),
    ).toBe(true)

    expect(
      hasKeyModulation([
        { time: 0, key: 'A', scale: 'minor' },
        { time: 48, key: 'A', scale: 'major' },
      ]),
    ).toBe(true)
  })
})
