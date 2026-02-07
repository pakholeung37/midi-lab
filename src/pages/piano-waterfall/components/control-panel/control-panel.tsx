import { useState, useRef } from 'react'
import { MdSettings, MdClose } from 'react-icons/md'
import { Button } from './button'
import { PlayControls } from './play-controls'
import { ProgressBar } from './progress-bar'
import { BpmControl } from './bpm-control'
import { SettingsPanel } from './settings-panel'
import type { ControlPanelProps } from './types'

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
  onFileSelect,
  onLoadDefaultMidi,
}: ControlPanelProps) {
  const [showSettings, setShowSettings] = useState(false)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const [settingsPosition, setSettingsPosition] = useState({ top: 0, right: 0 })

  const handleToggleSettings = () => {
    if (!showSettings && settingsButtonRef.current) {
      const rect = settingsButtonRef.current.getBoundingClientRect()
      setSettingsPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right - 190,
      })
    }
    setShowSettings(!showSettings)
  }

  return (
    <>
      {/* 紧凑主控制栏 */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
          {/* 播放控制 */}
          <PlayControls
            isPlaying={isPlaying}
            onPlay={onPlay}
            onPause={onPause}
            onStop={onStop}
          />

          {/* 进度条 */}
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />

          {/* 分隔线 */}
          <div className="w-px h-6 bg-slate-700/50" />

          {/* BPM 显示/控制 */}
          <BpmControl
            bpm={bpm}
            originalBpm={originalBpm}
            onBpmChange={onBpmChange}
          />

          {/* 设置按钮 */}
          <Button
            ref={settingsButtonRef}
            onClick={handleToggleSettings}
            size="sm"
            variant={showSettings ? 'primary' : 'ghost'}
            active={showSettings}
            icon={showSettings ? <MdClose className="w-4 h-4" /> : <MdSettings className="w-4 h-4" />}
            title="设置"
          />
        </div>
      </div>

      {/* 设置面板 */}
      <SettingsPanel
        isOpen={showSettings}
        position={settingsPosition}
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={onVolumeChange}
        onToggleMute={onToggleMute}
        showHelp={showHelp}
        onToggleHelp={onToggleHelp}
        isFullscreen={isFullscreen}
        onToggleFullscreen={onToggleFullscreen}
        onFileSelect={onFileSelect}
        onLoadDefaultMidi={onLoadDefaultMidi}
        tracks={tracks}
      />
    </>
  )
}
