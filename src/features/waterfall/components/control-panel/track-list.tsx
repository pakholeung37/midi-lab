import type { TrackListProps } from './types'

export function TrackList({ tracks }: TrackListProps) {
  if (tracks.length === 0) return null

  return (
    <>
      <div className="h-px bg-slate-700/50 my-3" />
      <div>
        <h4 className="text-xs font-medium text-slate-500 mb-2">Tracks</h4>
        <div className="space-y-1 max-h-28 overflow-y-auto">
          {tracks.map((track) => (
            <div key={track.index} className="flex items-center gap-2 text-xs">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: track.color }}
              />
              <span className="text-slate-400 truncate">{track.name}</span>
              <span className="text-slate-600 text-[10px]">
                ({track.noteCount})
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
