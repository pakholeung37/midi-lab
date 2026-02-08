import { useCallback, useRef, useState } from 'react'
import type { ProgressBarProps } from './types'

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const calculateTimeFromX = useCallback(
    (clientX: number) => {
      if (!trackRef.current || duration <= 0) return 0
      const rect = trackRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(1, x / rect.width))
      return percentage * duration
    },
    [duration],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      onSeek(calculateTimeFromX(e.clientX))

      const handleMouseMove = (e: MouseEvent) => {
        onSeek(calculateTimeFromX(e.clientX))
      }

      const handleMouseUp = () => {
        setIsDragging(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [calculateTimeFromX, onSeek],
  )

  return (
    <div className="flex flex-col gap-0.5 w-32">
      <div
        ref={trackRef}
        className="group relative h-1.5 bg-slate-700 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full pointer-events-none"
          style={{ width: `${progress}%` }}
        />
        {/* Draggable thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-transform pointer-events-none ${
            isDragging ? 'scale-125' : 'scale-0 group-hover:scale-100'
          }`}
          style={{ left: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-slate-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
