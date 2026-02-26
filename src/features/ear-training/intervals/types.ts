export type IntervalMode =
  | 'melodic-asc'
  | 'melodic-desc'
  | 'melodic-mixed'
  | 'harmonic'

export type IntervalPresetId =
  | 'seconds_melodic_asc'
  | 'seconds_melodic_desc'
  | 'seconds_melodic_mixed'
  | 'thirds_melodic_asc'
  | 'thirds_melodic_desc'
  | 'thirds_melodic_mixed'
  | 'seconds_thirds_melodic'
  | 'seconds_thirds_melodic_desc'
  | 'seconds_thirds_melodic_mixed'
  | 'fourth_tritone_fifth_melodic'
  | 'fourth_tritone_fifth_melodic_desc'
  | 'fourth_tritone_fifth_melodic_mixed'
  | 'seconds_thirds_harmonic'
  | 'up_to_fifth_melodic'
  | 'up_to_fifth_melodic_desc'
  | 'up_to_fifth_melodic_mixed'
  | 'up_to_fifth_harmonic'
  | 'up_to_octave_melodic'
  | 'up_to_octave_melodic_desc'
  | 'up_to_octave_melodic_mixed'
  | 'up_to_octave_harmonic'
  | 'up_to_fifteenth_harmonic'

export interface IntervalPreset {
  id: IntervalPresetId
  title: string
  description: string
  mode: IntervalMode
  intervalSemitones: readonly number[]
}

export interface IntervalQuestion {
  id: string
  presetId: IntervalPresetId
  mode: IntervalMode
  rootMidi: number
  targetMidi: number
  intervalSemitones: number
}

export interface IntervalAttemptResult {
  answerMidi: number
  expectedMidi: number
  intervalSemitones: number
  intervalLabel: string
  isCorrect: boolean
  answeredAt: number
}

export interface PresetStats {
  attempts: number
  correct: number
  accuracy: number
  lastPracticedAt: number
  recentResults: boolean[]
}

export interface IntervalsPersistenceState {
  version: 1
  presets: Partial<Record<IntervalPresetId, PresetStats>>
}
