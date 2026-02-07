import { useState } from 'react'
import { MdSpeed } from 'react-icons/md'
import type { BpmControlProps } from './types'

export function BpmControl({ bpm, originalBpm, onBpmChange }: BpmControlProps) {
  const [showBpmSlider, setShowBpmSlider] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setShowBpmSlider(!showBpmSlider)}
        className={`
          flex items-center gap-1 px-2 py-1 rounded-md
          text-xs font-mono transition-colors
          ${showBpmSlider ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:text-slate-300'}
        `}
        title="调整 BPM"
      >
        <MdSpeed className="w-3 h-3" />
        <span>{bpm}</span>
      </button>

      {/* BPM 滑块弹窗 */}
      {showBpmSlider && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-xl z-50 min-w-[140px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">BPM</span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-mono text-cyan-400">{bpm}</span>
              <button
                onClick={() => onBpmChange(originalBpm)}
                className="text-[10px] text-slate-600 hover:text-slate-400"
                title="重置"
              >
                重置
              </button>
            </div>
          </div>
          <input
            type="range"
            min="40"
            max="200"
            step="1"
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer bg-slate-700 accent-cyan-500"
          />
          <div className="flex justify-between mt-1 text-[10px] text-slate-600">
            <span>40</span>
            <span>200</span>
          </div>
        </div>
      )}
    </div>
  )
}
