import { useChordRecognition } from '../../hooks/use-chord-recognition'

export function ChordDisplay() {
  const { chord, activeNotes } = useChordRecognition()

  return (
    <div className="min-w-16 text-center px-2">
      {activeNotes.length === 0 ? (
        <span className="text-slate-500 text-sm">--</span>
      ) : chord ? (
        <span className="text-sm font-medium">
          <span className="text-cyan-400">{chord.root}</span>
          <span className="text-slate-300">{chord.type}</span>
          {chord.bass && (
            <>
              <span className="text-slate-500">/</span>
              <span className="text-amber-400">{chord.bass}</span>
            </>
          )}
        </span>
      ) : (
        <span className="text-slate-400 text-sm">
          {activeNotes.length} notes
        </span>
      )}
    </div>
  )
}
