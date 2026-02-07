import { useEffect, useMemo } from 'react'
import { PianoKeyboard } from './components/piano-keyboard'
import { WaterfallCanvas } from './components/waterfall-canvas'
import { ControlPanel } from './components/control-panel'
import { usePianoWaterfall } from './use-piano-waterfall'

// 像素/秒 的速度
const PIXELS_PER_SECOND = 150

export function PianoWaterfallPage() {
  const {
    containerRef,
    pianoLayout,
    midiData,
    playback,
    activeKeys,
    countdown,
    metronome,
    isLoading,
    error,
    showHelp,
    handleFileSelect,
    handleStop,
    toggleHelp,
    play,
    pause,
    seek,
    setBpm,
    isMuted,
    volume,
    toggleMute,
    setVolume,
    toggleCountdown,
    toggleMetronome,
    isFullscreen,
    toggleFullscreen,
    loadDefaultMidi,
    canvasSize,
  } = usePianoWaterfall()

  // 计算钢琴总宽度
  const pianoWidth = useMemo(() => {
    if (pianoLayout.keys.length === 0) return 0
    const lastKey = pianoLayout.keys[pianoLayout.keys.length - 1]
    return lastKey.x + lastKey.width
  }, [pianoLayout.keys])

  // 钢琴键盘高度
  const pianoHeight = pianoLayout.keys[0]?.height || 0

  // 瀑布流实际高度（容器高度 - 钢琴高度）
  const actualWaterfallHeight = Math.max(0, canvasSize.height - pianoHeight)

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框的快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (playback.isPlaying) {
            pause()
          } else {
            play()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          seek(Math.max(0, playback.currentTime - 5))
          break
        case 'ArrowRight':
          e.preventDefault()
          if (midiData) {
            seek(Math.min(midiData.duration, playback.currentTime + 5))
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          setBpm(Math.min(200, playback.bpm + 5))
          break
        case 'ArrowDown':
          e.preventDefault()
          setBpm(Math.max(40, playback.bpm - 5))
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    playback.isPlaying,
    playback.currentTime,
    playback.bpm,
    midiData,
    play,
    pause,
    seek,
    setBpm,
  ])

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden">
      {/* 悬浮控制栏 - 最小 UI */}
      <ControlPanel
        isPlaying={playback.isPlaying}
        currentTime={playback.currentTime}
        duration={midiData?.duration || 0}
        bpm={playback.bpm}
        originalBpm={playback.originalBpm}
        tracks={midiData?.tracks || []}
        countdown={countdown}
        metronome={metronome}
        onPlay={play}
        onPause={pause}
        onStop={handleStop}
        onSeek={seek}
        onBpmChange={setBpm}
        onToggleHelp={toggleHelp}
        onToggleCountdown={toggleCountdown}
        onToggleMetronome={toggleMetronome}
        showHelp={showHelp}
        isMuted={isMuted}
        volume={volume}
        onToggleMute={toggleMute}
        onVolumeChange={setVolume}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onFileSelect={handleFileSelect}
        onLoadDefaultMidi={loadDefaultMidi}
        hasMidiData={!!midiData}
      />

      {/* 错误提示 */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm border border-red-500/30">
          {error}
        </div>
      )}

      {/* 主画布区域 */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #0f172a 0%, #020617 100%)',
        }}
      >
        {/* 加载中提示 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
              <span className="text-slate-400 text-sm">正在加载 MIDI 文件...</span>
            </div>
          </div>
        )}

        {/* 瀑布流和钢琴键盘容器 - 统一宽度和居中 */}
        {pianoLayout.keys.length > 0 && (
          <div
            className="absolute inset-0 flex flex-col"
            style={{ width: pianoWidth }}
          >
            {/* 瀑布流区域 */}
            <div className="flex-1 relative overflow-hidden">
              {midiData && actualWaterfallHeight > 0 && (
                <WaterfallCanvas
                  notes={midiData.notes}
                  keys={pianoLayout.keys}
                  currentTime={playback.currentTime}
                  width={pianoWidth}
                  height={actualWaterfallHeight}
                  pixelsPerSecond={PIXELS_PER_SECOND}
                />
              )}
            </div>

            {/* 钢琴键盘 */}
            <div style={{ height: pianoHeight, flexShrink: 0 }}>
              <PianoKeyboard
                keys={pianoLayout.keys}
                activeKeys={activeKeys}
                width={pianoWidth}
                height={pianoHeight}
              />
            </div>
          </div>
        )}

        {/* 帮助提示 - 悬浮样式 */}
        {showHelp && (
          <div className="fixed top-20 left-4 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-sm text-slate-300 max-w-xs z-40 shadow-2xl">
            <h4 className="font-medium text-slate-100 mb-3">快捷键</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Space</span>
                <span className="text-slate-500">播放/暂停</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">← →</span>
                <span className="text-slate-500">前进/后退 5s</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">↑ ↓</span>
                <span className="text-slate-500">调整 BPM</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
