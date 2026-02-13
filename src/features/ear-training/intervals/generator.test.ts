import { describe, expect, it } from 'vitest'
import { getPresetById } from './constants'
import { generateIntervalQuestion } from './generator'

describe('generateIntervalQuestion', () => {
  it('generates ascending melodic intervals with expected direction', () => {
    const preset = getPresetById('seconds_melodic_asc')

    for (let i = 0; i < 50; i++) {
      const question = generateIntervalQuestion(preset)
      expect(preset.intervalSemitones).toContain(question.intervalSemitones)
      expect(question.targetMidi - question.rootMidi).toBe(
        question.intervalSemitones,
      )
    }
  })

  it('generates descending melodic intervals with expected direction', () => {
    const preset = getPresetById('seconds_melodic_desc')

    for (let i = 0; i < 50; i++) {
      const question = generateIntervalQuestion(preset)
      expect(preset.intervalSemitones).toContain(question.intervalSemitones)
      expect(question.rootMidi - question.targetMidi).toBe(
        question.intervalSemitones,
      )
    }
  })

  it('keeps notes inside the piano range for large intervals', () => {
    const preset = getPresetById('up_to_fifteenth_harmonic')

    for (let i = 0; i < 100; i++) {
      const question = generateIntervalQuestion(preset)
      expect(question.rootMidi).toBeGreaterThanOrEqual(21)
      expect(question.rootMidi).toBeLessThanOrEqual(108)
      expect(question.targetMidi).toBeGreaterThanOrEqual(21)
      expect(question.targetMidi).toBeLessThanOrEqual(108)
    }
  })
})
