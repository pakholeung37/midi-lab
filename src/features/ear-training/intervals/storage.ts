import type {
  IntervalsPersistenceState,
  IntervalPresetId,
  PresetStats,
} from './types'

export const INTERVALS_STORAGE_KEY = 'midi-lab:ear-training:intervals:v1'
export const INTERVALS_STORAGE_VERSION = 1
const RECENT_RESULTS_LIMIT = 20

interface StorageLike {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

function resolveStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage
  if (typeof window === 'undefined') return null
  return window.localStorage
}

function emptyState(): IntervalsPersistenceState {
  return {
    version: INTERVALS_STORAGE_VERSION,
    presets: {},
  }
}

function clampRecentResults(results: boolean[]): boolean[] {
  if (results.length <= RECENT_RESULTS_LIMIT) return results
  return results.slice(results.length - RECENT_RESULTS_LIMIT)
}

function normalizePresetStats(value: unknown): PresetStats | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Partial<PresetStats>
  if (
    typeof candidate.attempts !== 'number' ||
    typeof candidate.correct !== 'number' ||
    typeof candidate.lastPracticedAt !== 'number' ||
    !Array.isArray(candidate.recentResults)
  ) {
    return null
  }

  const attempts = Math.max(0, Math.floor(candidate.attempts))
  const correct = Math.max(0, Math.min(attempts, Math.floor(candidate.correct)))
  const recentResults = clampRecentResults(
    candidate.recentResults.map((item) => Boolean(item)),
  )

  return {
    attempts,
    correct,
    accuracy: attempts === 0 ? 0 : correct / attempts,
    lastPracticedAt: candidate.lastPracticedAt,
    recentResults,
  }
}

export function loadIntervalsState(
  storage?: StorageLike,
): IntervalsPersistenceState {
  const targetStorage = resolveStorage(storage)
  if (!targetStorage) return emptyState()

  try {
    const raw = targetStorage.getItem(INTERVALS_STORAGE_KEY)
    if (!raw) return emptyState()

    const parsed = JSON.parse(raw) as Partial<IntervalsPersistenceState>
    if (parsed.version !== INTERVALS_STORAGE_VERSION) {
      return emptyState()
    }

    const presets: IntervalsPersistenceState['presets'] = {}
    if (parsed.presets && typeof parsed.presets === 'object') {
      for (const [presetId, stats] of Object.entries(parsed.presets)) {
        const normalized = normalizePresetStats(stats)
        if (normalized) {
          presets[presetId as IntervalPresetId] = normalized
        }
      }
    }

    return {
      version: INTERVALS_STORAGE_VERSION,
      presets,
    }
  } catch {
    return emptyState()
  }
}

export function saveIntervalsState(
  state: IntervalsPersistenceState,
  storage?: StorageLike,
): void {
  const targetStorage = resolveStorage(storage)
  if (!targetStorage) return

  targetStorage.setItem(INTERVALS_STORAGE_KEY, JSON.stringify(state))
}

export function getPresetStats(
  state: IntervalsPersistenceState,
  presetId: IntervalPresetId,
): PresetStats | null {
  return state.presets[presetId] ?? null
}

export function recordPresetAttempt(
  presetId: IntervalPresetId,
  isCorrect: boolean,
  answeredAt: number,
  storage?: StorageLike,
): IntervalsPersistenceState {
  const state = loadIntervalsState(storage)
  const current = state.presets[presetId]

  const attempts = (current?.attempts ?? 0) + 1
  const correct = (current?.correct ?? 0) + (isCorrect ? 1 : 0)
  const recentResults = clampRecentResults([
    ...(current?.recentResults ?? []),
    isCorrect,
  ])

  const nextState: IntervalsPersistenceState = {
    ...state,
    presets: {
      ...state.presets,
      [presetId]: {
        attempts,
        correct,
        accuracy: correct / attempts,
        lastPracticedAt: answeredAt,
        recentResults,
      },
    },
  }

  saveIntervalsState(nextState, storage)
  return nextState
}
