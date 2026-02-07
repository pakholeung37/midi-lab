import type { ProgressBarProps } from './types'

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    onSeek(percentage * duration)
  }

  return (
    <div className="flex flex-col gap-0.5 w-32">
      <div
        className="relative h-1.5 bg-slate-700 rounded-full cursor-pointer overflow-hidden"
        onClick={handleProgressClick}
      >
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
          style={{
            width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
          }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
