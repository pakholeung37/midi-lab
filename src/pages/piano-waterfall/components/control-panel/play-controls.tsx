import { MdPlayArrow, MdPause, MdStop } from 'react-icons/md'
import { Button } from './button'
import type { PlayControlsProps } from './types'

export function PlayControls({ isPlaying, onPlay, onPause, onStop }: PlayControlsProps) {
  return (
    <>
      <Button
        onClick={isPlaying ? onPause : onPlay}
        size="md"
        variant={isPlaying ? 'danger' : 'primary'}
        icon={isPlaying ? <MdPause className="w-4 h-4" /> : <MdPlayArrow className="w-4 h-4" />}
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
