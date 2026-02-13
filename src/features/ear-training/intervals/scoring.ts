import { getIntervalLabel } from './constants'
import type { IntervalAttemptResult, IntervalQuestion } from './types'

export function scoreIntervalAnswer(
  question: IntervalQuestion,
  answerMidi: number,
): IntervalAttemptResult {
  const expectedMidi = question.targetMidi
  const intervalLabel = getIntervalLabel(question.intervalSemitones)

  return {
    answerMidi,
    expectedMidi,
    intervalSemitones: question.intervalSemitones,
    intervalLabel,
    isCorrect: answerMidi === expectedMidi,
    answeredAt: Date.now(),
  }
}
