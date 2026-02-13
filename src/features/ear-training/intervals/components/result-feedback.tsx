import { getNoteName } from '../../../../pages/piano-waterfall/utils/piano-layout'
import type { IntervalAttemptResult } from '../types'

interface ResultFeedbackProps {
  result: IntervalAttemptResult | null
}

export function ResultFeedback({ result }: ResultFeedbackProps) {
  if (!result) {
    return (
      <div className="px-4 py-3 text-center text-sm text-slate-500">
        Play and answer with the target note.
      </div>
    )
  }

  if (result.isCorrect) {
    return (
      <div className="px-4 py-3 text-center text-sm text-emerald-300">
        Correct: {result.intervalLabel} ({getNoteName(result.expectedMidi)})
      </div>
    )
  }

  return (
    <div className="px-4 py-3 text-center text-sm text-rose-300">
      Incorrect. Correct note: {getNoteName(result.expectedMidi)} (
      {result.intervalLabel})
    </div>
  )
}
