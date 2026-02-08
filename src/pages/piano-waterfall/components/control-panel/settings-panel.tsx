import { useRef } from 'react'
import {
  MdHelpOutline,
  MdFullscreen,
  MdFullscreenExit,
  MdUpload,
  MdMusicNote,
  MdZoomIn,
  MdZoomOut,
} from 'react-icons/md'
import { Button } from './button'
import { VolumeControl } from './volume-control'
import { TrackList } from './track-list'
import type { SettingsPanelProps } from './types'

export function SettingsPanelContent({
  midiVolume,
  metronomeVolume,
  isMuted,
  onMidiVolumeChange,
  onMetronomeVolumeChange,
  onToggleMute,
  showHelp,
  onToggleHelp,
  isFullscreen,
  onToggleFullscreen,
  onFileSelect,
  onLoadDefaultMidi,
  tracks,
  pixelsPerSecond,
  onPixelsPerSecondChange,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="w-56 p-3 space-y-3">
      <h3 className="text-xs font-medium text-slate-300">设置</h3>

      {/* 上传 MIDI / 加载默认 */}
      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="default"
          size="lg"
          icon={<MdUpload className="w-3.5 h-3.5" />}
          title="上传 MIDI 文件"
          className="flex-1"
        >
          上传 MIDI
        </Button>
        <Button
          onClick={onLoadDefaultMidi}
          variant="default"
          size="lg"
          icon={<MdMusicNote className="w-3.5 h-3.5" />}
          title="加载示例 MIDI"
          className="flex-1"
        >
          示例音乐
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".mid,.midi,.MID,.MIDI"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file && onFileSelect) {
              onFileSelect(file)
            }
            e.target.value = ''
          }}
          className="hidden"
        />
      </div>

      {/* MIDI 音量控制 */}
      <VolumeControl
        label="MIDI 音量"
        volume={midiVolume}
        isMuted={isMuted}
        onVolumeChange={onMidiVolumeChange}
        onToggleMute={onToggleMute}
      />

      {/* 节拍器音量控制 */}
      <VolumeControl
        label="节拍器音量"
        volume={metronomeVolume}
        onVolumeChange={onMetronomeVolumeChange}
      />

      {/* 瀑布流缩放 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">瀑布流缩放</span>
          <span className="text-xs text-slate-500 font-mono">
            {Math.round((pixelsPerSecond / 150) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPixelsPerSecondChange(pixelsPerSecond - 25)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="缩小"
          >
            <MdZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={50}
            max={400}
            step={25}
            value={pixelsPerSecond}
            onChange={(e) => onPixelsPerSecondChange(Number(e.target.value))}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <button
            type="button"
            onClick={() => onPixelsPerSecondChange(pixelsPerSecond + 25)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="放大"
          >
            <MdZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 帮助按钮 */}
      <Button
        onClick={onToggleHelp}
        variant={showHelp ? 'primary' : 'default'}
        size="lg"
        active={showHelp}
        icon={<MdHelpOutline className="w-3.5 h-3.5" />}
        className="w-full"
      >
        快捷键帮助
      </Button>

      {/* 全屏按钮 */}
      <Button
        onClick={onToggleFullscreen}
        variant="default"
        size="lg"
        icon={
          isFullscreen ? (
            <MdFullscreenExit className="w-3.5 h-3.5" />
          ) : (
            <MdFullscreen className="w-3.5 h-3.5" />
          )
        }
        className="w-full"
      >
        {isFullscreen ? '退出全屏' : '进入全屏'}
      </Button>

      {/* 音轨信息 */}
      <TrackList tracks={tracks} />
    </div>
  )
}
