import { useRef } from 'react'
import { MdHelpOutline, MdFullscreen, MdFullscreenExit, MdUpload, MdMusicNote } from 'react-icons/md'
import { Button } from './button'
import { VolumeControl } from './volume-control'
import { TrackList } from './track-list'
import type { SettingsPanelProps } from './types'

export function SettingsPanel({
  isOpen,
  position,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  showHelp,
  onToggleHelp,
  isFullscreen,
  onToggleFullscreen,
  onFileSelect,
  onLoadDefaultMidi,
  tracks,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  return (
    <div
      className="fixed z-50 w-56 p-3 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/50 shadow-2xl"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <h3 className="text-xs font-medium text-slate-300 mb-3">设置</h3>

      <div className="space-y-3">
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

        {/* 音量控制 */}
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />

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
          icon={isFullscreen ? <MdFullscreenExit className="w-3.5 h-3.5" /> : <MdFullscreen className="w-3.5 h-3.5" />}
          className="w-full"
        >
          {isFullscreen ? '退出全屏' : '进入全屏'}
        </Button>
      </div>

      {/* 音轨信息 */}
      <TrackList tracks={tracks} />
    </div>
  )
}
