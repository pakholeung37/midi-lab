interface SessionControlsProps {
  canNext: boolean
  isPlaying: boolean
  onReplay: () => void
  onNext: () => void
  onFinish: () => void
}

export function SessionControls({
  canNext,
  isPlaying,
  onReplay,
  onNext,
  onFinish,
}: SessionControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-4">
      <button
        type="button"
        onClick={onReplay}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
      >
        {isPlaying ? 'Playing...' : 'Replay'}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        className="rounded-lg border border-cyan-700 bg-cyan-600/20 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-600/30 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
      >
        Next question
      </button>

      <button
        type="button"
        onClick={onFinish}
        className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
      >
        Finish set
      </button>
    </div>
  )
}
