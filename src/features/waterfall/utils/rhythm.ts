import type { TimeSignature } from '../types'

export function getBeatDurationSeconds(
  bpm: number,
  denominator: number,
): number {
  if (bpm <= 0 || denominator <= 0) return 0

  const quarterNoteDuration = 60 / bpm
  return quarterNoteDuration * (4 / denominator)
}

export function getMeasureDurationSeconds(
  bpm: number,
  timeSignature: Pick<TimeSignature, 'numerator' | 'denominator'>,
): number {
  return (
    getBeatDurationSeconds(bpm, timeSignature.denominator) *
    timeSignature.numerator
  )
}
