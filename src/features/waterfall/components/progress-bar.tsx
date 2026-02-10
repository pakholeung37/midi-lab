import { useState, useCallback, useRef } from 'react'

interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  isPlaying: boolean
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  isPlaying,
}: ProgressBarProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)
  const barRef = useRef<HTMLDivElement>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const displayProgress = isDragging ? (dragTime / duration) * 100 : progress

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!barRef.current || duration <= 0) return 0
      const rect = barRef.current.getBoundingClientRect()
      const percentage = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      )
      return percentage * duration
    },
    [duration],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      const time = calculateTimeFromPosition(e.clientX)
      setIsDragging(true)
      setDragTime(time)
    },
    [calculateTimeFromPosition],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const time = calculateTimeFromPosition(e.clientX)
      setDragTime(time)
    },
    [isDragging, calculateTimeFromPosition],
  )

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onSeek(dragTime)
      setIsDragging(false)
    }
  }, [isDragging, dragTime, onSeek])

  return (
    <div
      className="flex items-center gap-3 w-full"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* 当前时间 */}
      <span className="text-xs text-slate-400 font-mono w-12 text-right">
        {formatTime(isDragging ? dragTime : currentTime)}
      </span>

      {/* 进度条 */}
      <div
        ref={barRef}
        onMouseDown={handleMouseDown}
        className={`
          relative flex-1 h-2 rounded-full bg-slate-700 cursor-pointer
          ${isDragging ? 'cursor-grabbing' : 'cursor-pointer'}
        `}
      >
        {/* 已播放部分 */}
        <div
          className={`
            absolute left-0 top-0 h-full rounded-full
            ${isDragging ? 'bg-cyan-400' : isPlaying ? 'bg-cyan-500' : 'bg-slate-500'}
          `}
          style={{ width: `${displayProgress}%` }}
        />

        {/* 拖拽指示器 */}
        <div
          className={`
            absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-md
            transition-opacity duration-150
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}
          style={{ left: `calc(${displayProgress}% - 6px)` }}
        />
      </div>

      {/* 总时长 */}
      <span className="text-xs text-slate-400 font-mono w-12">
        {formatTime(duration)}
      </span>
    </div>
  )
}
