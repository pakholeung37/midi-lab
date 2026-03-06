import type { TrackListProps } from './types'

export function TrackList({
  tracks,
  trackVolumes,
  onTrackVolumeChange,
}: TrackListProps) {
  if (tracks.length === 0) return null

  return (
    <>
      <div className="h-px bg-slate-700/50 my-3" />
      <div>
        <h4 className="text-xs font-medium text-slate-500 mb-2">Tracks</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {tracks.map((track) => (
            <div key={track.index} className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: track.color }}
                />
                <span className="text-slate-400 truncate">{track.name}</span>
                <span className="text-slate-600 text-[10px]">
                  ({track.noteCount})
                </span>
                <span className="text-slate-500 text-[10px] ml-auto font-mono">
                  {Math.round((trackVolumes[track.index] ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={trackVolumes[track.index] ?? 1}
                onChange={(e) =>
                  onTrackVolumeChange(track.index, Number(e.target.value))
                }
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                aria-label={`${track.name} volume`}
                title={`${track.name} volume`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
