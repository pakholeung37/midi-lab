import { MdSpeed } from 'react-icons/md'
import * as Popover from '@radix-ui/react-popover'
import * as Slider from '@radix-ui/react-slider'
import type { BpmControlProps } from './types'

export function BpmControl({ bpm, originalBpm, onBpmChange }: BpmControlProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={`
            flex items-center gap-1 px-2 py-1 rounded-md
            text-xs font-mono transition-colors
            data-[state=open]:bg-cyan-500/20 data-[state=open]:text-cyan-400
            text-slate-400 hover:text-slate-300
          `}
          title="调整 BPM"
        >
          <MdSpeed className="w-3 h-3" />
          <span>{bpm}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-xl z-50 min-w-[140px]"
          sideOffset={8}
        >
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

          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[bpm]}
            onValueChange={([value]) => onBpmChange(value)}
            min={40}
            max={200}
            step={1}
          >
            <Slider.Track className="bg-slate-700 relative grow rounded-full h-1">
              <Slider.Range className="absolute bg-cyan-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-3 h-3 bg-white rounded-full shadow-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              aria-label="BPM"
            />
          </Slider.Root>

          <div className="flex justify-between mt-1 text-[10px] text-slate-600">
            <span>40</span>
            <span>200</span>
          </div>

          <Popover.Arrow className="fill-slate-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
