// ControlPanel - 内部直接消费 store 和 playback
// 不再需要外部透传大量 props

import { useEffect, useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { MdSettings, MdTimer, MdMusicNote } from 'react-icons/md'
import { Button } from './button'
import { PlayControls } from './play-controls'
import { ProgressBar } from './progress-bar'
import { BpmControl } from './bpm-control'
import { MasterVolumeControl } from './master-volume-control'
import { ChordDisplay } from './chord-display'
import { LoopControl } from './loop-control'
import { SettingsPanelContent } from './settings-panel'
import { useWaterfallStore } from '../../hooks/use-waterfall-store'
import type { usePlayback } from '../../hooks/use-playback'
import { playbackState } from '../../core/playback-state'

interface ControlPanelProps {
  playbackHook: ReturnType<typeof usePlayback>
}

export function ControlPanel({ playbackHook: pb }: ControlPanelProps) {
  const {
    midiData,
    playback,
    audio,
    metronomeVolume,
    countdown,
    metronome,
    showHelp,
    pixelsPerSecond,
    transposeSemitones,
    horizontalScale,
    themeId,
    showPianoKeys,
    loop,
    setBpm,
    toggleMute,
    setVolume,
    setMetronomeVolume,
    toggleCountdown,
    toggleMetronome,
    toggleHelp,
    setPixelsPerSecond,
    setTransposeSemitones,
    setHorizontalScale,
    togglePianoKeys,
  } = useWaterfallStore()

  // 进度条实时更新的 currentTime
  const [displayTime, setDisplayTime] = useState(0)

  useEffect(() => {
    const unsubscribe = playbackState.subscribe(() => {
      setDisplayTime(playbackState.currentTime)
    })
    return unsubscribe
  }, [])

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
        {/* 播放控制 */}
        <PlayControls
          isPlaying={playback.isPlaying}
          isCountingDown={countdown.isCountingDown}
          currentBeat={countdown.currentBeat}
          onPlay={pb.play}
          onPause={pb.pause}
          onStop={pb.handleStop}
        />

        {/* 进度条 */}
        <ProgressBar
          currentTime={displayTime}
          duration={midiData?.duration || 0}
          onSeek={(time) => playbackState.setCurrentTime(time)}
        />

        {/* 和弦显示 */}
        <ChordDisplay />

        {/* 分隔线 */}
        <div className="w-px h-6 bg-slate-700/50" />

        {/* BPM 显示/控制 */}
        <BpmControl
          bpm={playback.bpm}
          originalBpm={playback.originalBpm}
          onBpmChange={setBpm}
        />
        <MasterVolumeControl
          volume={audio.volume}
          metronomeVolume={metronomeVolume}
          isMuted={audio.isMuted}
          onVolumeChange={setVolume}
          onMetronomeVolumeChange={setMetronomeVolume}
          onToggleMute={toggleMute}
        />
        {/* 倒数开关 */}
        <Button
          size="sm"
          variant={countdown.enabled ? 'primary' : 'ghost'}
          icon={<MdTimer className="w-4 h-4" />}
          onClick={toggleCountdown}
          title={countdown.enabled ? 'Countdown enabled' : 'Countdown disabled'}
        />

        {/* 节拍器开关 */}
        <Button
          size="sm"
          variant={metronome.enabled ? 'primary' : 'ghost'}
          icon={<MdMusicNote className="w-4 h-4" />}
          onClick={toggleMetronome}
          title={metronome.enabled ? 'Metronome enabled' : 'Metronome disabled'}
        />

        {/* 小节循环 */}
        <LoopControl
          loop={loop}
          totalMeasures={pb.getTotalMeasures()}
          onToggleLoop={pb.toggleLoop}
          onLoopRangeChange={pb.setLoopRange}
        />

        {/* 设置按钮 - Radix Popover */}
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button
              size="sm"
              variant="ghost"
              icon={<MdSettings className="w-4 h-4" />}
              title="Settings"
            />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              className="rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
              sideOffset={8}
              align="end"
            >
              <SettingsPanelContent
                showHelp={showHelp}
                onToggleHelp={toggleHelp}
                isFullscreen={pb.isFullscreen}
                onToggleFullscreen={pb.toggleFullscreen}
                onFileSelect={pb.handleFileSelect}
                onMidiSelect={pb.loadMidiFromPath}
                selectedMidiPath={pb.selectedMidiPath}
                tracks={midiData?.tracks || []}
                pixelsPerSecond={pixelsPerSecond}
                onPixelsPerSecondChange={setPixelsPerSecond}
                transposeSemitones={transposeSemitones}
                onTransposeSemitonesChange={setTransposeSemitones}
                horizontalScale={horizontalScale}
                onHorizontalScaleChange={setHorizontalScale}
                themeId={themeId}
                onThemeChange={pb.handleThemeChange}
                showPianoKeys={showPianoKeys}
                onTogglePianoKeys={togglePianoKeys}
              />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  )
}
