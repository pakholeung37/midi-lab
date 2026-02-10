import * as Popover from '@radix-ui/react-popover'
import { MdRepeat } from 'react-icons/md'
import { Button } from './button'

export interface LoopControlProps {
  loop: {
    enabled: boolean
    startMeasure: number
    endMeasure: number
  }
  totalMeasures: number
  onToggleLoop: () => void
  onLoopRangeChange: (start: number, end: number) => void
}

export function LoopControl({
  loop,
  totalMeasures,
  onToggleLoop,
  onLoopRangeChange,
}: LoopControlProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          size="sm"
          variant={loop.enabled ? 'primary' : 'ghost'}
          icon={<MdRepeat className="w-4 h-4" />}
          title={loop.enabled ? '循环已启用' : '循环已禁用'}
        />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="rounded-lg bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-2xl z-50 p-3 animate-in fade-in-0 zoom-in-95"
          sideOffset={8}
          align="center"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-300">小节循环</span>
              <button
                type="button"
                onClick={onToggleLoop}
                className={`
                  px-2 py-0.5 rounded text-xs transition-colors
                  ${
                    loop.enabled
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }
                `}
              >
                {loop.enabled ? '开' : '关'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">小节</span>
              <input
                type="number"
                min={1}
                max={totalMeasures}
                value={loop.startMeasure}
                onChange={(e) =>
                  onLoopRangeChange(Number(e.target.value), loop.endMeasure)
                }
                className="w-12 px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-center"
              />
              <span className="text-slate-500">-</span>
              <input
                type="number"
                min={loop.startMeasure}
                max={totalMeasures}
                value={loop.endMeasure}
                onChange={(e) =>
                  onLoopRangeChange(loop.startMeasure, Number(e.target.value))
                }
                className="w-12 px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 text-center"
              />
              <span className="text-slate-500">/ {totalMeasures}</span>
            </div>
          </div>
          <Popover.Arrow className="fill-slate-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
