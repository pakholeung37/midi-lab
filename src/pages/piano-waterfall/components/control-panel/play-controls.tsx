import { MdPlayArrow, MdPause, MdStop } from 'react-icons/md'
import { Button } from './button'
import type { PlayControlsProps } from './types'

export function PlayControls({
  isPlaying,
  isCountingDown,
  currentBeat,
  onPlay,
  onPause,
  onStop,
}: PlayControlsProps) {
  // 倒数中显示当前拍数
  if (isCountingDown) {
    return (
      <>
        <Button
          size="sm"
          className="bg-amber-500/20! border border-amber-500/30! font-bold text-amber-400! tabular-nums w-7"
        >
          {currentBeat}
        </Button>

        <Button
          onClick={onStop}
          size="sm"
          variant="default"
          icon={<MdStop className="w-3.5 h-3.5" />}
          title="停止"
        />
      </>
    )
  }

  return (
    <>
      <Button
        onClick={isPlaying ? onPause : onPlay}
        size="sm"
        variant={isPlaying ? 'danger' : 'primary'}
        icon={
          isPlaying ? (
            <MdPause className="w-4 h-4" />
          ) : (
            <MdPlayArrow className="w-4 h-4" />
          )
        }
        title={isPlaying ? '暂停' : '播放'}
      />

      <Button
        onClick={onStop}
        size="sm"
        variant="default"
        icon={<MdStop className="w-3.5 h-3.5" />}
        title="停止"
      />
    </>
  )
}
