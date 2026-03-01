import { useEffect, useRef, useState } from 'react'
import {
  WaterfallCanvas,
  ControlPanel,
  MusicInfoOverlay,
  usePlayback,
  useWaterfallStore,
} from '../../features/waterfall'
import type { InstrumentLayout } from '../../features/waterfall'
import { calculatePianoInstrument } from './piano-instrument'

function getZoomShortcutStep(pixelsPerSecond: number): number {
  if (pixelsPerSecond <= 30) return 2
  if (pixelsPerSecond <= 80) return 5
  if (pixelsPerSecond <= 200) return 10
  return 20
}

export function PianoWaterfallPage() {
  const {
    playback,
    audio,
    canvasSize,
    showHelp,
    showPianoKeys,
    horizontalScale,
    countdown,
    metronome,
    loop,
    pixelsPerSecond,
    transposeSemitones,
    setBpm,
    setCanvasSize,
    setPixelsPerSecond,
    setTransposeSemitones,
    toggleCountdown,
    toggleHelp,
    toggleMute,
    toggleMetronome,
    togglePianoKeys,
  } = useWaterfallStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const playbackHook = usePlayback()

  // 钢琴乐器布局
  const [instrumentLayout, setInstrumentLayout] =
    useState<InstrumentLayout | null>(null)

  // 计算布局
  useEffect(() => {
    if (!containerRef.current) return

    const updateLayout = () => {
      const width = containerRef.current?.clientWidth || 0
      const layout = calculatePianoInstrument(width, {
        showKeys: showPianoKeys,
        horizontalScale,
      })
      setInstrumentLayout(layout)
      setCanvasSize(width, containerRef.current?.clientHeight || 0)
    }

    updateLayout()

    const resizeObserver = new ResizeObserver(updateLayout)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [setCanvasSize, showPianoKeys, horizontalScale])

  // 瀑布流实际高度
  const actualWaterfallHeight = instrumentLayout
    ? Math.max(0, canvasSize.height - instrumentLayout.instrumentHeight)
    : 0

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
        case 'KeyK':
          e.preventDefault()
          if (playback.isPlaying) {
            playbackHook.pause()
          } else {
            playbackHook.play()
          }
          break
        case 'KeyS':
          e.preventDefault()
          playbackHook.handleStop()
          break
        case 'ArrowLeft':
        case 'KeyJ':
          e.preventDefault()
          playbackHook.seekByMeasure(-1)
          break
        case 'ArrowRight':
        case 'KeyL':
          e.preventDefault()
          playbackHook.seekByMeasure(1)
          break
        case 'ArrowUp':
          e.preventDefault()
          setBpm(Math.min(200, playback.bpm + 5))
          break
        case 'ArrowDown':
          e.preventDefault()
          setBpm(Math.max(0, playback.bpm - 5))
          break
        case 'Minus':
          e.preventDefault()
          setPixelsPerSecond(
            pixelsPerSecond - getZoomShortcutStep(pixelsPerSecond),
          )
          break
        case 'Equal':
          e.preventDefault()
          setPixelsPerSecond(
            pixelsPerSecond + getZoomShortcutStep(pixelsPerSecond),
          )
          break
        case 'BracketLeft':
          e.preventDefault()
          setTransposeSemitones(
            transposeSemitones - (e.shiftKey ? 12 : 1),
          )
          break
        case 'BracketRight':
          e.preventDefault()
          setTransposeSemitones(
            transposeSemitones + (e.shiftKey ? 12 : 1),
          )
          break
        case 'KeyT':
          if (e.repeat) return
          e.preventDefault()
          togglePianoKeys()
          break
        case 'KeyM':
          if (e.repeat) return
          e.preventDefault()
          if (e.shiftKey) {
            toggleMetronome()
          } else {
            toggleMute()
          }
          break
        case 'KeyC':
          if (e.repeat) return
          e.preventDefault()
          toggleCountdown()
          break
        case 'KeyR':
          if (e.repeat) return
          e.preventDefault()
          playbackHook.toggleLoop()
          break
        case 'KeyF':
          if (e.repeat) return
          e.preventDefault()
          playbackHook.toggleFullscreen()
          break
        case 'KeyH':
          if (e.repeat) return
          e.preventDefault()
          toggleHelp()
          break
        case 'Slash':
          if (e.shiftKey && !e.repeat) {
            e.preventDefault()
            toggleHelp()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    playback.isPlaying,
    playback.bpm,
    playbackHook,
    pixelsPerSecond,
    transposeSemitones,
    setBpm,
    setPixelsPerSecond,
    setTransposeSemitones,
    togglePianoKeys,
    toggleMute,
    toggleMetronome,
    toggleCountdown,
    toggleHelp,
  ])

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 overflow-hidden">
      {/* 悬浮控制栏 */}
      <ControlPanel playbackHook={playbackHook} />

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
                Loading MIDI file...
              </span>
            </div>
          </div>
        )}

        {/* 瀑布流和乐器面板 */}
        {instrumentLayout &&
          instrumentLayout.keys.length > 0 &&
          actualWaterfallHeight > 0 && (
            <div
              className="absolute top-0 bottom-0 left-1/2 flex flex-col -translate-x-1/2"
              style={{ width: instrumentLayout.totalWidth }}
            >
              <WaterfallCanvas
                layout={instrumentLayout}
                width={instrumentLayout.totalWidth}
                height={canvasSize.height}
              />
            </div>
          )}

        {/* 乐曲信息 overlay */}
        <MusicInfoOverlay />

        {/* 帮助提示 */}
        {showHelp && (
          <div className="fixed top-20 left-4 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 text-sm text-slate-300 max-w-sm z-40 shadow-2xl">
            <h4 className="font-medium text-slate-100 mb-3">Shortcuts</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Space / K
                </span>
                <span className="text-slate-500">Play / Pause</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  S
                </span>
                <span className="text-slate-500">Stop and rewind</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  ← → / J L
                </span>
                <span className="text-slate-500">Prev / Next measure</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  ↑ ↓
                </span>
                <span className="text-slate-500">Adjust BPM</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  - / +
                </span>
                <span className="text-slate-500">Waterfall zoom</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  [ / ]
                </span>
                <span className="text-slate-500">Transpose ±1 semitone</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Shift + [ / ]
                </span>
                <span className="text-slate-500">Transpose ±12 semitones</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  T
                </span>
                <span className="text-slate-500">
                  {showPianoKeys ? 'Hide keyboard' : 'Show keyboard'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  M
                </span>
                <span className="text-slate-500">
                  {audio.isMuted ? 'Unmute' : 'Mute'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  Shift + M
                </span>
                <span className="text-slate-500">
                  {metronome.enabled ? 'Disable metronome' : 'Enable metronome'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  C
                </span>
                <span className="text-slate-500">
                  {countdown.enabled ? 'Disable countdown' : 'Enable countdown'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  R
                </span>
                <span className="text-slate-500">
                  {loop.enabled ? 'Disable loop' : 'Enable loop'}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  F
                </span>
                <span className="text-slate-500">Toggle fullscreen</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                  H / ?
                </span>
                <span className="text-slate-500">Show / hide help</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
