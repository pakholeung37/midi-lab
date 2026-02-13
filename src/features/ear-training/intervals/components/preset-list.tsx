import { DEFAULT_QUESTION_COUNT, INTERVAL_PRESETS } from '../constants'
import { formatPercent, formatRelativeTime } from '../utils'
import type { IntervalPresetId, PresetStats } from '../types'

interface PresetListProps {
  questionCount?: number
  statsByPreset: Partial<Record<IntervalPresetId, PresetStats>>
  onStart: (presetId: IntervalPresetId) => void
}

export function PresetList({
  questionCount = DEFAULT_QUESTION_COUNT,
  statsByPreset,
  onStart,
}: PresetListProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-14 text-slate-100">
      <header className="mb-4 border-b border-slate-800 pb-3">
        <h1 className="text-2xl font-semibold tracking-tight">Intervals</h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
          <span>
            Input method: <span className="text-cyan-300">piano + MIDI</span>
          </span>
          <span>
            Questions: <span className="text-amber-300">{questionCount}</span>
          </span>
        </div>
      </header>

      <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm">
        {INTERVAL_PRESETS.map((preset) => {
          const stats = statsByPreset[preset.id]
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onStart(preset.id)}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-slate-800/60"
            >
              <div className="min-w-0">
                <p className="truncate text-lg font-medium text-slate-100">
                  {preset.title}
                </p>
                <p className="truncate text-sm text-slate-400">
                  {preset.description}
                </p>
              </div>
              <div className="ml-4 shrink-0 text-right text-xs text-slate-400">
                {stats ? (
                  <>
                    <p className="text-sm text-cyan-300">
                      {formatPercent(stats.accuracy)}
                    </p>
                    <p>{formatRelativeTime(stats.lastPracticedAt)}</p>
                  </>
                ) : (
                  <p className="text-slate-500">Not practiced</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
