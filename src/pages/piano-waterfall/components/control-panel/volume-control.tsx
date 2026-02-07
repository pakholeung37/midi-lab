import { MdVolumeUp, MdVolumeOff } from 'react-icons/md'
import type { VolumeControlProps } from './types'

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500">音量</span>
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-1 text-xs ${isMuted ? 'text-amber-400' : 'text-slate-500'}`}
        >
          {isMuted ? (
            <MdVolumeOff className="w-3 h-3" />
          ) : (
            <MdVolumeUp className="w-3 h-3" />
          )}
          <span className="text-[10px]">{isMuted ? '静音' : `${Math.round(volume * 100)}%`}</span>
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={volume}
        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer bg-slate-700 accent-cyan-500"
      />
    </div>
  )
}
