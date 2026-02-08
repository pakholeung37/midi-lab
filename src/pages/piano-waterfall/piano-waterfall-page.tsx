import { useEffect, useMemo, useState, useRef } from 'react'
import { WaterfallView } from './components/waterfall-view'
import { ControlPanel } from './components/control-panel'
import { MusicInfoOverlay } from './components/music-info-overlay'
import { useWaterfallStore } from './hooks/use-waterfall-store'
import { playbackState } from './core/playback-state'
import { usePlayback } from './hooks/use-playback'
import { calculatePianoLayout } from './utils/piano-layout'

export function PianoWaterfallPage() {
  // 从 store 获取 UI 状态
  const {
    midiData,
    playback,
    audio,
    metronomeVolume,
    countdown,
    metronome,
    canvasSize,
    showHelp,
    pixelsPerSecond,
    setBpm,
    toggleMute,
    setVolume,
    setMetronomeVolume: setStoreMetronomeVolume,
    toggleCountdown,
    toggleMetronome,
    toggleHelp,
    setCanvasSize,
    setPixelsPerSecond,
  } = useWaterfallStore()

  // 容器引用
  const containerRef = useRef<HTMLDivElement>(null)

  // 使用新的 playback hook
  const playbackHook = usePlayback()

  // 进度条实时更新的 currentTime
  const [displayTime, setDisplayTime] = useState(0)

  // 订阅 playbackState 以实时更新进度条
  useEffect(() => {
    const unsubscribe = playbackState.subscribe(() => {
      setDisplayTime(playbackState.currentTime)
    })
    return unsubscribe
  }, [])

  // 计算钢琴布局
  const [pianoLayout, setPianoLayout] = useState<
    ReturnType<typeof calculatePianoLayout>
  >({ keys: [], scale: 1, totalWhiteKeys: 52 })

  // 计算布局
  useEffect(() => {
    if (!containerRef.current) return

    const updateLayout = () => {
      const width = containerRef.current?.clientWidth || 0
      const layout = calculatePianoLayout(width)
      setPianoLayout(layout)
      setCanvasSize(width, containerRef.current?.clientHeight || 0)
    }

    updateLayout()

    const resizeObserver = new ResizeObserver(updateLayout)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [setCanvasSize])

  // 计算钢琴总宽度
  const pianoWidth = useMemo(() => {
    if (pianoLayout.keys.length === 0) return 0
    const lastKey = pianoLayout.keys[pianoLayout.keys.length - 1]
    return lastKey.x + lastKey.width
  }, [pianoLayout.keys])

  // 钢琴键盘高度
  const pianoHeight = pianoLayout.keys[0]?.height || 0

  // 瀑布流实际高度
  const actualWaterfallHeight = Math.max(0, canvasSize.height - pianoHeight)

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            playbackHook.pause()
          } else {
            playbackHook.play()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          playbackState.setCurrentTime(
            Math.max(0, playbackState.currentTime - 5),
          )
          break
        case 'ArrowRight':
          e.preventDefault()
          if (midiData) {
            playbackState.setCurrentTime(
              Math.min(midiData.duration, playbackState.currentTime + 5),
            )
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
  }, [playback.isPlaying, playback.bpm, midiData, playbackHook, setBpm])

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden">
      {/* 悬浮控制栏 */}
      <ControlPanel
        isPlaying={playback.isPlaying}
        currentTime={displayTime}
        duration={midiData?.duration || 0}
        bpm={playback.bpm}
        originalBpm={playback.originalBpm}
        tracks={midiData?.tracks || []}
        countdown={countdown}
        metronome={metronome}
        onPlay={playbackHook.play}
        onPause={playbackHook.pause}
        onStop={playbackHook.handleStop}
        onSeek={(time) => playbackState.setCurrentTime(time)}
        onBpmChange={setBpm}
        onToggleHelp={toggleHelp}
        onToggleCountdown={toggleCountdown}
        onToggleMetronome={toggleMetronome}
        showHelp={showHelp}
        isMuted={audio.isMuted}
        midiVolume={audio.volume}
        metronomeVolume={metronomeVolume}
        onToggleMute={toggleMute}
        onMidiVolumeChange={setVolume}
        onMetronomeVolumeChange={setStoreMetronomeVolume}
        isFullscreen={playbackHook.isFullscreen}
        onToggleFullscreen={playbackHook.toggleFullscreen}
        onFileSelect={playbackHook.handleFileSelect}
        onLoadDefaultMidi={playbackHook.loadDefaultMidi}
        hasMidiData={!!midiData}
        pixelsPerSecond={pixelsPerSecond}
        onPixelsPerSecondChange={setPixelsPerSecond}
      />

      {/* 主画布区域 */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #0f172a 0%, #020617 100%)',
        }}
      >
        {/* 加载中提示 */}
        {playbackHook.isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin" />
              <span className="text-slate-400 text-sm">
                正在加载 MIDI 文件...
              </span>
            </div>
          </div>
        )}

        {/* 瀑布流和钢琴键盘统一视图 */}
        {pianoLayout.keys.length > 0 && actualWaterfallHeight > 0 && (
          <div
            className="absolute inset-0 flex flex-col"
            style={{ width: pianoWidth }}
          >
            <WaterfallView
              notes={midiData?.notes || []}
              noteIndex={midiData?.noteIndex}
              keys={pianoLayout.keys}
              width={pianoWidth}
              height={canvasSize.height}
              pixelsPerSecond={pixelsPerSecond}
              keySignatures={midiData?.keySignatures}
              timeSignatures={midiData?.timeSignatures}
              originalBpm={midiData?.originalBpm}
            />
          </div>
        )}

        {/* 乐曲信息 overlay */}
        {midiData && (
          <MusicInfoOverlay
            name={midiData.name}
            timeSignatures={midiData.timeSignatures}
            keySignatures={midiData.keySignatures}
            currentTime={displayTime}
          />
        )}

        {/* 帮助提示 */}
        {showHelp && (
          <div className="fixed top-20 left-4 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-sm text-slate-300 max-w-xs z-40 shadow-2xl">
            <h4 className="font-medium text-slate-100 mb-3">快捷键</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Space
                </span>
                <span className="text-slate-500">播放/暂停</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  ← →
                </span>
                <span className="text-slate-500">前进/后退 5s</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  ↑ ↓
                </span>
                <span className="text-slate-500">调整 BPM</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
