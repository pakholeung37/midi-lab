import type { IntervalPreset } from './types'

export const DEFAULT_QUESTION_COUNT = 20

export const PIANO_MIN_MIDI = 21
export const PIANO_MAX_MIDI = 108
export const DEFAULT_ROOT_MIN_MIDI = 48 // C3
export const DEFAULT_ROOT_MAX_MIDI = 72 // C5

const INTERVAL_LABELS: Record<number, string> = {
  1: 'minor 2nd',
  2: 'major 2nd',
  3: 'minor 3rd',
  4: 'major 3rd',
  5: 'perfect 4th',
  6: 'tritone',
  7: 'perfect 5th',
  8: 'minor 6th',
  9: 'major 6th',
  10: 'minor 7th',
  11: 'major 7th',
  12: 'perfect 8th',
  13: 'minor 9th',
  14: 'major 9th',
  15: 'minor 10th',
  16: 'major 10th',
  17: 'perfect 11th',
  18: 'augmented 11th',
  19: 'perfect 12th',
  20: 'minor 13th',
  21: 'major 13th',
  22: 'minor 14th',
  23: 'major 14th',
  24: 'perfect 15th',
}

export function getIntervalLabel(semitones: number): string {
  return INTERVAL_LABELS[semitones] ?? `${semitones} st`
}

export const INTERVAL_PRESETS: readonly IntervalPreset[] = [
  {
    id: 'seconds_melodic_asc',
    title: 'Seconds',
    description: 'melodic, ascending',
    mode: 'melodic-asc',
    intervalSemitones: [1, 2],
  },
  {
    id: 'seconds_melodic_desc',
    title: 'Seconds',
    description: 'melodic, descending',
    mode: 'melodic-desc',
    intervalSemitones: [1, 2],
  },
  {
    id: 'seconds_melodic_mixed',
    title: 'Seconds',
    description: 'melodic, ascending + descending',
    mode: 'melodic-mixed',
    intervalSemitones: [1, 2],
  },
  {
    id: 'thirds_melodic_asc',
    title: 'Thirds',
    description: 'melodic, ascending',
    mode: 'melodic-asc',
    intervalSemitones: [3, 4],
  },
  {
    id: 'thirds_melodic_desc',
    title: 'Thirds',
    description: 'melodic, descending',
    mode: 'melodic-desc',
    intervalSemitones: [3, 4],
  },
  {
    id: 'thirds_melodic_mixed',
    title: 'Thirds',
    description: 'melodic, ascending + descending',
    mode: 'melodic-mixed',
    intervalSemitones: [3, 4],
  },
  {
    id: 'seconds_thirds_melodic',
    title: 'Seconds and thirds',
    description: 'melodic, ascending',
    mode: 'melodic-asc',
    intervalSemitones: [1, 2, 3, 4],
  },
  {
    id: 'seconds_thirds_melodic_desc',
    title: 'Seconds and thirds',
    description: 'melodic, descending',
    mode: 'melodic-desc',
    intervalSemitones: [1, 2, 3, 4],
  },
  {
    id: 'seconds_thirds_melodic_mixed',
    title: 'Seconds and thirds',
    description: 'melodic, ascending + descending',
    mode: 'melodic-mixed',
    intervalSemitones: [1, 2, 3, 4],
  },
  {
    id: 'seconds_thirds_harmonic',
    title: 'Seconds and thirds',
    description: 'harmonic',
    mode: 'harmonic',
    intervalSemitones: [1, 2, 3, 4],
  },
  {
    id: 'fourth_tritone_fifth_melodic',
    title: 'Fourth, tritone and fifth',
    description: 'melodic, ascending',
    mode: 'melodic-asc',
    intervalSemitones: [5, 6, 7],
  },
  {
    id: 'fourth_tritone_fifth_melodic_desc',
    title: 'Fourth, tritone and fifth',
    description: 'melodic, descending',
    mode: 'melodic-desc',
    intervalSemitones: [5, 6, 7],
  },
  {
    id: 'fourth_tritone_fifth_melodic_mixed',
    title: 'Fourth, tritone and fifth',
    description: 'melodic, ascending + descending',
    mode: 'melodic-mixed',
    intervalSemitones: [5, 6, 7],
  },
  {
    id: 'up_to_fifth_melodic',
    title: 'Up to fifth',
    description: 'melodic, ascending',
    mode: 'melodic-asc',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'up_to_fifth_melodic_desc',
    title: 'Up to fifth',
    description: 'melodic, descending',
    mode: 'melodic-desc',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'up_to_fifth_melodic_mixed',
    title: 'Up to fifth',
    description: 'melodic, ascending + descending',
    mode: 'melodic-mixed',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'up_to_fifth_harmonic',
    title: 'Up to fifth',
    description: 'harmonic',
    mode: 'harmonic',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'up_to_octave_melodic',
    title: 'Up to octave',
    description: 'melodic, ascending',
    mode: 'melodic-asc',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'up_to_octave_melodic_desc',
    title: 'Up to octave',
    description: 'melodic, descending',
    mode: 'melodic-desc',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'up_to_octave_melodic_mixed',
    title: 'Up to octave',
    description: 'melodic, ascending + descending',
    mode: 'melodic-mixed',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'up_to_octave_harmonic',
    title: 'Up to octave',
    description: 'harmonic',
    mode: 'harmonic',
    intervalSemitones: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'up_to_fifteenth_harmonic',
    title: 'Up to fifteenth',
    description: 'harmonic',
    mode: 'harmonic',
    intervalSemitones: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
      22, 23, 24,
    ],
  },
]

export function getPresetById(id: IntervalPreset['id']): IntervalPreset {
  const preset = INTERVAL_PRESETS.find((item) => item.id === id)
  if (!preset) {
    throw new Error(`Unknown interval preset: ${id}`)
  }
  return preset
}
