import { formatPercent } from '../utils'

interface QuizHeaderProps {
  questionNumber: number
  questionCount: number
  successRate: number
  onFinish: () => void
}

export function QuizHeader({
  questionNumber,
  questionCount,
  successRate,
  onFinish,
}: QuizHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3 text-slate-100 backdrop-blur-sm">
      <button
        type="button"
        onClick={onFinish}
        className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-200 transition hover:bg-slate-800"
      >
        Finish
      </button>

      <div className="text-center leading-tight">
        <p className="text-xs text-slate-400">
          Question {questionNumber} of {questionCount}
        </p>
        <p className="text-sm text-cyan-300">
          Success rate {formatPercent(successRate)}
        </p>
      </div>

      <div className="w-16 text-right text-xs text-slate-500">Intervals</div>
    </header>
  )
}
