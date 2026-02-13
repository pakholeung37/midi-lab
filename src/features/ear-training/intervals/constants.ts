import type { IntervalPreset } from './types'

export const DEFAULT_QUESTION_COUNT = 20

export const PIANO_MIN_MIDI = 21
export const PIANO_MAX_MIDI = 108
export const DEFAULT_ROOT_MIN_MIDI = 48 // C3
export const DEFAULT_ROOT_MAX_MIDI = 72 // C5

const INTERVAL_LABELS: Record<number, string> = {
  1: 'm2',
  2: 'M2',
  3: 'm3',
  4: 'M3',
  5: 'P4',
  6: 'TT',
  7: 'P5',
  8: 'm6',
  9: 'M6',
  10: 'm7',
  11: 'M7',
  12: 'P8',
  13: 'm9',
  14: 'M9',
  15: 'm10',
  16: 'M10',
  17: 'P11',
  18: 'A11',
  19: 'P12',
  20: 'm13',
  21: 'M13',
  22: 'm14',
  23: 'M14',
  24: 'P15',
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
    id: 'seconds_thirds_melodic',
    title: 'Seconds and thirds',
    description: 'melodic',
    mode: 'melodic-asc',
    intervalSemitones: [1, 2, 3, 4],
  },
  {
    id: 'fourth_tritone_fifth_melodic',
    title: 'Fourth, tritone and fifth',
    description: 'melodic',
    mode: 'melodic-asc',
    intervalSemitones: [5, 6, 7],
  },
  {
    id: 'seconds_thirds_harmonic',
    title: 'Seconds and thirds',
    description: 'harmonic',
    mode: 'harmonic',
    intervalSemitones: [1, 2, 3, 4],
  },
  {
    id: 'up_to_fifth_melodic',
    title: 'Up to fifth',
    description: 'melodic',
    mode: 'melodic-asc',
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
    description: 'melodic',
    mode: 'melodic-asc',
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
