import { describe, expect, it } from 'vitest'
import { scoreIntervalAnswer } from './scoring'
import type { IntervalQuestion } from './types'

describe('scoreIntervalAnswer', () => {
  const question: IntervalQuestion = {
    id: 'q-1',
    presetId: 'thirds_melodic_asc',
    mode: 'melodic-asc',
    rootMidi: 60,
    targetMidi: 64,
    intervalSemitones: 4,
  }

  it('marks the exact target note as correct', () => {
    const result = scoreIntervalAnswer(question, 64)
    expect(result.isCorrect).toBe(true)
    expect(result.intervalLabel).toBe('M3')
    expect(result.expectedMidi).toBe(64)
  })

  it('marks other notes as incorrect', () => {
    const result = scoreIntervalAnswer(question, 63)
    expect(result.isCorrect).toBe(false)
    expect(result.expectedMidi).toBe(64)
  })
})
