import {
  MdPlayArrow,
  MdPause,
  MdStop,
  MdSpeed,
  MdHelpOutline,
  MdVolumeUp,
  MdVolumeOff,
  MdFullscreen,
  MdFullscreenExit,
} from 'react-icons/md'
import { ProgressBar } from './progress-bar'
import type { TrackInfo } from '../types'

interface ControlPanelProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  bpm: number
  originalBpm: number
  tracks: TrackInfo[]
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onSeek: (time: number) => void
  onBpmChange: (bpm: number) => void
  onToggleHelp: () => void
  showHelp: boolean
  isMuted: boolean
  volume: number
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

export function ControlPanel({
  isPlaying,
  currentTime,
  duration,
  bpm,
  originalBpm,
  tracks,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onBpmChange,
  onToggleHelp,
  showHelp,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  isFullscreen,
  onToggleFullscreen,
}: ControlPanelProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between gap-4">
        {/* 播放控制按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={isPlaying ? onPause : onPlay}
            className={`
              flex items-center justify-center w-12 h-12 rounded-xl
              transition-all duration-200
              ${
                isPlaying
                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
              }
            `}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? (
              <MdPause className="w-6 h-6" />
            ) : (
              <MdPlayArrow className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={onStop}
            className="
              flex items-center justify-center w-10 h-10 rounded-xl
              bg-slate-700/50 text-slate-400
              hover:bg-slate-700 hover:text-slate-200
              transition-all duration-200
            "
            title="停止"
          >
            <MdStop className="w-5 h-5" />
          </button>
        </div>

        {/* 播放信息 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-mono text-slate-200">
              {formatTime(currentTime)}
            </span>
            <span>/</span>
            <span className="font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* 右侧工具 */}
        <div className="flex items-center gap-2">
          {/* BPM 调节 */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50">
            <MdSpeed className="w-4 h-4 text-slate-500" />
            <div className="flex flex-col">
              <input
                type="range"
                min="40"
                max="200"
                step="5"
                value={bpm}
                onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
                className="
                  w-24 h-1.5 rounded-full appearance-none cursor-pointer
                  bg-slate-700 accent-cyan-500
                "
              />
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] text-slate-500">原始</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {originalBpm}
                </span>
                <span className="text-[10px] text-slate-600">/</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {bpm}
                </span>
                <span className="text-[10px] text-slate-500">BPM</span>
              </div>
            </div>
            <button
              onClick={() => onBpmChange(originalBpm)}
              className="ml-1 px-1.5 py-0.5 text-[10px] rounded bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300 transition-colors"
              title="重置为原始 BPM"
            >
              重置
            </button>
          </div>

          {/* 音量控制 */}
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-slate-800/50">
            <button
              onClick={onToggleMute}
              className={`
                flex items-center justify-center w-7 h-7 rounded-md transition-colors
                ${isMuted ? 'text-amber-400 hover:text-amber-300' : 'text-slate-400 hover:text-slate-300'}
              `}
              title={isMuted ? '取消静音' : '静音'}
            >
              {isMuted ? (
                <MdVolumeOff className="w-4 h-4" />
              ) : (
                <MdVolumeUp className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="
                w-16 h-1.5 rounded-full appearance-none cursor-pointer
                bg-slate-700 accent-cyan-500
              "
            />
          </div>

          {/* 帮助按钮 */}
          <button
            onClick={onToggleHelp}
            className={`
              flex items-center justify-center w-9 h-9 rounded-lg
              transition-all duration-200
              ${
                showHelp
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }
            `}
            title="帮助"
          >
            <MdHelpOutline className="w-5 h-5" />
          </button>

          {/* 全屏按钮 */}
          <button
            onClick={onToggleFullscreen}
            className="
              flex items-center justify-center w-9 h-9 rounded-lg
              bg-slate-800/50 text-slate-400
              hover:bg-slate-700 hover:text-slate-200
              transition-all duration-200
            "
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? (
              <MdFullscreenExit className="w-5 h-5" />
            ) : (
              <MdFullscreen className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* 进度条 */}
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        isPlaying={isPlaying}
      />

      {/* 音轨信息 */}
      {tracks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tracks.map((track) => (
            <div
              key={track.index}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/50 text-xs"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: track.color }}
              />
              <span className="text-slate-400 truncate max-w-[100px]">
                {track.name}
              </span>
              <span className="text-slate-600">({track.noteCount})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
