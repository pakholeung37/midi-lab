import { useEffect } from 'react'
import { FileDropZone } from './components/file-drop-zone'
import { PianoKeyboard } from './components/piano-keyboard'
import { WaterfallCanvas } from './components/waterfall-canvas'
import { ControlPanel } from './components/control-panel'
import { usePianoWaterfall } from './use-piano-waterfall'
import './styles.css'

// 像素/秒 的速度
const PIXELS_PER_SECOND = 150

export function PianoWaterfallPage() {
  const {
    containerRef,
    pianoLayout,
    midiData,
    playback,
    activeKeys,
    timeWindow,
    lookAheadTime,
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
    waterfallHeight,
    isMuted,
    volume,
    toggleMute,
    setVolume,
    isFullscreen,
    toggleFullscreen,
  } = usePianoWaterfall()

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
      {/* 顶部控制栏 */}
      <div className="flex-shrink-0 p-4 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
        <ControlPanel
          isPlaying={playback.isPlaying}
          currentTime={playback.currentTime}
          duration={midiData?.duration || 0}
          bpm={playback.bpm}
          originalBpm={playback.originalBpm}
          tracks={midiData?.tracks || []}
          onPlay={play}
          onPause={pause}
          onStop={handleStop}
          onSeek={seek}
          onBpmChange={setBpm}
          onToggleHelp={toggleHelp}
          showHelp={showHelp}
          isMuted={isMuted}
          volume={volume}
          onToggleMute={toggleMute}
          onVolumeChange={setVolume}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* 错误提示 */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* 主画布区域 */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: 'linear-gradient(to bottom, #0f172a 0%, #020617 100%)',
        }}
      >
        {/* 文件拖拽区域 - 空状态显示 */}
        {!midiData && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <FileDropZone
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* 瀑布流 Canvas */}
        {midiData && pianoLayout.keys.length > 0 && (
          <div
            className="absolute left-0 right-0"
            style={{
              top: 0,
              bottom: pianoLayout.keys[0]?.height || 100,
            }}
          >
            <WaterfallCanvas
              notes={midiData.notes}
              keys={pianoLayout.keys}
              currentTime={playback.currentTime}
              timeWindow={timeWindow}
              lookAheadTime={lookAheadTime}
              width={
                pianoLayout.keys[pianoLayout.keys.length - 1]?.x +
                  pianoLayout.keys[pianoLayout.keys.length - 1]?.width || 0
              }
              height={waterfallHeight}
              pixelsPerSecond={PIXELS_PER_SECOND}
            />
          </div>
        )}

        {/* 钢琴键盘 Canvas */}
        {pianoLayout.keys.length > 0 && (
          <div
            className="absolute left-0 right-0 bottom-0"
            style={{ height: pianoLayout.keys[0]?.height || 100 }}
          >
            <PianoKeyboard
              keys={pianoLayout.keys}
              activeKeys={activeKeys}
              width={
                pianoLayout.keys[pianoLayout.keys.length - 1]?.x +
                  pianoLayout.keys[pianoLayout.keys.length - 1]?.width || 0
              }
              height={pianoLayout.keys[0]?.height || 100}
            />
          </div>
        )}

        {/* 帮助提示 */}
        {showHelp && (
          <div className="absolute top-4 left-4 p-4 rounded-xl bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-sm text-slate-300 max-w-xs z-30">
            <h4 className="font-medium text-slate-100 mb-2">快捷键</h4>
            <ul className="space-y-1 text-xs">
              <li className="flex justify-between">
                <span>空格</span>
                <span className="text-slate-500">播放/暂停</span>
              </li>
              <li className="flex justify-between">
                <span>← / →</span>
                <span className="text-slate-500">前进/后退 5s</span>
              </li>
              <li className="flex justify-between">
                <span>↑ / ↓</span>
                <span className="text-slate-500">调整BPM</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
