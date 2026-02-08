import * as Popover from '@radix-ui/react-popover'
import { MdSettings, MdTimer, MdMusicNote } from 'react-icons/md'
import { Button } from './button'
import { PlayControls } from './play-controls'
import { ProgressBar } from './progress-bar'
import { BpmControl } from './bpm-control'
import { ChordDisplay } from './chord-display'
import { SettingsPanelContent } from './settings-panel'
import type { ControlPanelProps } from './types'

export function ControlPanel({
  isPlaying,
  currentTime,
  duration,
  bpm,
  originalBpm,
  tracks,
  countdown,
  metronome,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onBpmChange,
  onToggleHelp,
  onToggleCountdown,
  onToggleMetronome,
  showHelp,
  isMuted,
  midiVolume,
  metronomeVolume,
  onToggleMute,
  onMidiVolumeChange,
  onMetronomeVolumeChange,
  isFullscreen,
  onToggleFullscreen,
  onFileSelect,
  onLoadDefaultMidi,
  pixelsPerSecond,
  onPixelsPerSecondChange,
}: ControlPanelProps) {
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
        {/* 播放控制 */}
        <PlayControls
          isPlaying={isPlaying}
          isCountingDown={countdown.isCountingDown}
          currentBeat={countdown.currentBeat}
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

        {/* 和弦显示 */}
        <ChordDisplay />

        {/* 分隔线 */}
        <div className="w-px h-6 bg-slate-700/50" />

        {/* BPM 显示/控制 */}
        <BpmControl
          bpm={bpm}
          originalBpm={originalBpm}
          onBpmChange={onBpmChange}
        />
        {/* 倒数开关 */}
        <Button
          size="sm"
          variant={countdown.enabled ? 'primary' : 'ghost'}
          icon={<MdTimer className="w-4 h-4" />}
          onClick={onToggleCountdown}
          title={countdown.enabled ? '倒数已启用' : '倒数已禁用'}
        />

        {/* 节拍器开关 */}
        <Button
          size="sm"
          variant={metronome.enabled ? 'primary' : 'ghost'}
          icon={<MdMusicNote className="w-4 h-4" />}
          onClick={onToggleMetronome}
          title={metronome.enabled ? '节拍器已启用' : '节拍器已禁用'}
        />

        {/* 设置按钮 - Radix Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button
              size="sm"
              variant="ghost"
              icon={<MdSettings className="w-4 h-4" />}
              title="设置"
            />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className="rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              sideOffset={8}
              align="end"
            >
              <SettingsPanelContent
                midiVolume={midiVolume}
                metronomeVolume={metronomeVolume}
                isMuted={isMuted}
                onMidiVolumeChange={onMidiVolumeChange}
                onMetronomeVolumeChange={onMetronomeVolumeChange}
                onToggleMute={onToggleMute}
                showHelp={showHelp}
                onToggleHelp={onToggleHelp}
                isFullscreen={isFullscreen}
                onToggleFullscreen={onToggleFullscreen}
                onFileSelect={onFileSelect}
                onLoadDefaultMidi={onLoadDefaultMidi}
                tracks={tracks}
                pixelsPerSecond={pixelsPerSecond}
                onPixelsPerSecondChange={onPixelsPerSecondChange}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  )
}
