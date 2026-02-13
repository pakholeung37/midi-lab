import {
  DEFAULT_ROOT_MAX_MIDI,
  DEFAULT_ROOT_MIN_MIDI,
  PIANO_MAX_MIDI,
  PIANO_MIN_MIDI,
} from './constants'
import type { IntervalPreset, IntervalQuestion } from './types'

interface GeneratorOptions {
  rootMinMidi?: number
  rootMaxMidi?: number
  rng?: () => number
}

function randomItem<T>(arr: readonly T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function getCandidateRoots(
  preset: IntervalPreset,
  intervalSemitones: number,
  rootMinMidi = DEFAULT_ROOT_MIN_MIDI,
  rootMaxMidi = DEFAULT_ROOT_MAX_MIDI,
): number[] {
  const roots: number[] = []

  for (let rootMidi = rootMinMidi; rootMidi <= rootMaxMidi; rootMidi++) {
    const targetMidi =
      preset.mode === 'melodic-desc'
        ? rootMidi - intervalSemitones
        : rootMidi + intervalSemitones

    if (targetMidi < PIANO_MIN_MIDI || targetMidi > PIANO_MAX_MIDI) {
      continue
    }

    roots.push(rootMidi)
  }

  return roots
}

export function generateIntervalQuestion(
  preset: IntervalPreset,
  options: GeneratorOptions = {},
): IntervalQuestion {
  const {
    rootMinMidi = DEFAULT_ROOT_MIN_MIDI,
    rootMaxMidi = DEFAULT_ROOT_MAX_MIDI,
    rng = Math.random,
  } = options

  const intervalSemitones = randomItem(preset.intervalSemitones, rng)
  const candidateRoots = getCandidateRoots(
    preset,
    intervalSemitones,
    rootMinMidi,
    rootMaxMidi,
  )

  if (candidateRoots.length === 0) {
    throw new Error(
      `No candidate roots for preset ${preset.id} and interval ${intervalSemitones}`,
    )
  }

  const rootMidi = randomItem(candidateRoots, rng)
  const targetMidi =
    preset.mode === 'melodic-desc'
      ? rootMidi - intervalSemitones
      : rootMidi + intervalSemitones

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    presetId: preset.id,
    mode: preset.mode,
    rootMidi,
    targetMidi,
    intervalSemitones,
  }
}
