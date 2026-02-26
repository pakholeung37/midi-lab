import { getNoteName } from '../../../../pages/piano-waterfall/utils/piano-layout'
import type { IntervalMode } from '../types'

interface StaffPromptProps {
  rootMidi: number
  mode: IntervalMode
}

function getModeLabel(mode: IntervalMode): string {
  if (mode === 'melodic-asc') return 'melodic ascending'
  if (mode === 'melodic-desc') return 'melodic descending'
  if (mode === 'melodic-mixed') return 'melodic ascending + descending'
  return 'harmonic'
}

export function StaffPrompt({ rootMidi, mode }: StaffPromptProps) {
  return (
    <section className="px-4 py-5 text-center text-slate-100">
      <p className="text-2xl font-medium">What interval is it?</p>
      <p className="mt-1 text-sm text-slate-400">{getModeLabel(mode)}</p>

      <div className="mx-auto mt-5 max-w-md rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-6">
        <p className="text-sm text-slate-400">Root note</p>
        <p className="mt-1 text-4xl font-semibold text-cyan-300">
          {getNoteName(rootMidi)}
        </p>
        <p className="mt-3 text-sm text-slate-500">Find the second note.</p>
      </div>
    </section>
  )
}
