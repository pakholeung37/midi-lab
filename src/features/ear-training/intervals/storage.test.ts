import { describe, expect, it } from 'vitest'
import {
  INTERVALS_STORAGE_KEY,
  loadIntervalsState,
  recordPresetAttempt,
} from './storage'

class MemoryStorage {
  private data = new Map<string, string>()

  getItem(key: string): string | null {
    return this.data.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value)
  }
}

describe('intervals storage', () => {
  it('creates stats after recording attempts', () => {
    const storage = new MemoryStorage()

    recordPresetAttempt('seconds_melodic_asc', true, 1000, storage)
    const state = recordPresetAttempt(
      'seconds_melodic_asc',
      false,
      2000,
      storage,
    )

    const stats = state.presets.seconds_melodic_asc
    expect(stats).toBeTruthy()
    expect(stats?.attempts).toBe(2)
    expect(stats?.correct).toBe(1)
    expect(stats?.accuracy).toBe(0.5)
    expect(stats?.lastPracticedAt).toBe(2000)
  })

  it('keeps only the latest 20 recent results', () => {
    const storage = new MemoryStorage()

    for (let i = 0; i < 25; i++) {
      recordPresetAttempt('up_to_octave_harmonic', i % 2 === 0, i + 1, storage)
    }

    const state = loadIntervalsState(storage)
    expect(state.presets.up_to_octave_harmonic?.recentResults.length).toBe(20)
  })

  it('returns empty state when stored version is invalid', () => {
    const storage = new MemoryStorage()
    storage.setItem(
      INTERVALS_STORAGE_KEY,
      JSON.stringify({ version: 999, presets: {} }),
    )

    const state = loadIntervalsState(storage)
    expect(state.presets).toEqual({})
  })
})
