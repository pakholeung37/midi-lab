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

export function PianoWaterfallPage() {
  const {
    playback,
    canvasSize,
    showHelp,
    showPianoKeys,
    setBpm,
    setCanvasSize,
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
  }, [setCanvasSize, showPianoKeys])

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
          e.preventDefault()
          if (playback.isPlaying) {
            playbackHook.pause()
          } else {
            playbackHook.play()
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          playbackHook.seekByMeasure(-1)
          break
        case 'ArrowRight':
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
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playback.isPlaying, playback.bpm, playbackHook, setBpm])

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
                正在加载 MIDI 文件...
              </span>
            </div>
          </div>
        )}

        {/* 瀑布流和乐器面板 */}
        {instrumentLayout &&
          instrumentLayout.keys.length > 0 &&
          actualWaterfallHeight > 0 && (
            <div
              className="absolute inset-0 flex flex-col"
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
                <span className="text-slate-500">上/下一小节</span>
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
