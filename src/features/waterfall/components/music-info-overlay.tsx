// 乐曲信息显示组件（左上角 overlay）

import { useEffect, useState } from 'react'
import type { TimeSignature, KeySignature } from '../types'
import { formatKeySignature, formatTimeSignature } from '../utils/music-theory'
import { useWaterfallStore } from '../hooks/use-waterfall-store'
import { playbackState } from '../core/playback-state'

export function MusicInfoOverlay() {
  const { midiData } = useWaterfallStore()
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const unsubscribe = playbackState.subscribe(() => {
      setCurrentTime(playbackState.currentTime)
    })
    return unsubscribe
  }, [])

  if (!midiData) return null

  const { name, timeSignatures, keySignatures } = midiData

  // 获取当前时间点的拍号（找最后一个 time <= currentTime 的）
  const currentTimeSignature = timeSignatures.reduce<TimeSignature | null>(
    (acc, ts) => (ts.time <= currentTime ? ts : acc),
    timeSignatures[0] || null,
  )

  // 获取当前时间点的调号
  const currentKeySignature = keySignatures.reduce<KeySignature | null>(
    (acc, ks) => (ks.time <= currentTime ? ks : acc),
    keySignatures[0] || null,
  )

  return (
    <div className="absolute top-4 left-14 z-30 pointer-events-none">
      <div className="flex items-center gap-3 text-xs text-slate-400">
        {/* 文件名 */}
        <span className="truncate max-w-[180px]">{name}</span>

        <span className="text-slate-600">·</span>

        {/* 调号 */}
        <span className="font-mono">
          {currentKeySignature
            ? formatKeySignature(
                currentKeySignature.key,
                currentKeySignature.scale,
              )
            : '--'}
        </span>

        <span className="text-slate-600">·</span>

        {/* 拍号 */}
        <span className="font-mono">
          {currentTimeSignature
            ? formatTimeSignature(
                currentTimeSignature.numerator,
                currentTimeSignature.denominator,
              )
            : '--'}
        </span>
      </div>
    </div>
  )
}
