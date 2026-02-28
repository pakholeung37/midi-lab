import { MdVolumeOff, MdVolumeUp } from 'react-icons/md'
import * as Popover from '@radix-ui/react-popover'
import * as Slider from '@radix-ui/react-slider'
import type { MasterVolumeControlProps } from './types'

export function MasterVolumeControl({
  volume,
  metronomeVolume,
  isMuted,
  onVolumeChange,
  onMetronomeVolumeChange,
  onToggleMute,
}: MasterVolumeControlProps) {
  const volumePercent = Math.round(volume * 100)

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
          title="调整音量"
        >
          {isMuted ? (
            <MdVolumeOff className="w-3 h-3" />
          ) : (
            <MdVolumeUp className="w-3 h-3" />
          )}
          <span>{volumePercent}%</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-xl z-50 min-w-[180px] space-y-3"
          sideOffset={8}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">MIDI 音量</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-cyan-400">
                  {volumePercent}%
                </span>
                <button
                  onClick={onToggleMute}
                  className="text-[10px] text-slate-600 hover:text-slate-400"
                  title={isMuted ? '取消静音' : '静音'}
                >
                  {isMuted ? '取消静音' : '静音'}
                </button>
              </div>
            </div>

            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[volume]}
              onValueChange={([value]) => onVolumeChange(value)}
              min={0}
              max={1}
              step={0.05}
            >
              <Slider.Track className="bg-slate-700 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-cyan-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-3 h-3 bg-white rounded-full shadow-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                aria-label="MIDI 音量"
              />
            </Slider.Root>

            <div className="flex justify-between mt-1 text-[10px] text-slate-600">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">节拍器音量</span>
              <span className="text-sm font-mono text-cyan-400">
                {Math.round(metronomeVolume * 100)}%
              </span>
            </div>

            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              value={[metronomeVolume]}
              onValueChange={([value]) => onMetronomeVolumeChange(value)}
              min={0}
              max={1}
              step={0.05}
            >
              <Slider.Track className="bg-slate-700 relative grow rounded-full h-1">
                <Slider.Range className="absolute bg-cyan-500 rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-3 h-3 bg-white rounded-full shadow-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                aria-label="节拍器音量"
              />
            </Slider.Root>

            <div className="flex justify-between mt-1 text-[10px] text-slate-600">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          <Popover.Arrow className="fill-slate-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
