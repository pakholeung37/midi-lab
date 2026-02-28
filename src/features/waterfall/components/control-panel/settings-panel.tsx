import { useRef } from 'react'
import {
  MdHelpOutline,
  MdFullscreen,
  MdFullscreenExit,
  MdUpload,
  MdZoomIn,
  MdZoomOut,
} from 'react-icons/md'
import { Button } from './button'
import { TrackList } from './track-list'
import type { SettingsPanelProps } from './types'
import { THEMES } from '../../utils/themes'
import { midiFiles } from 'virtual:midi-list'

export function SettingsPanelContent({
  showHelp,
  onToggleHelp,
  isFullscreen,
  onToggleFullscreen,
  onFileSelect,
  onMidiSelect,
  selectedMidiPath,
  tracks,
  pixelsPerSecond,
  onPixelsPerSecondChange,
  themeId,
  onThemeChange,
  showPianoKeys,
  onTogglePianoKeys,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="w-56 p-3 space-y-3">
      <h3 className="text-xs font-medium text-slate-300">设置</h3>

      {/* MIDI 文件选择 */}
      {midiFiles.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400">MIDI 文件</span>
          <select
            value={selectedMidiPath || ''}
            onChange={(e) => onMidiSelect?.(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="" disabled>
              选择文件...
            </option>
            {midiFiles.map((file) => (
              <option key={file.path} value={file.path}>
                {file.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 上传 MIDI */}
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
            onClick={() => onPixelsPerSecondChange(pixelsPerSecond - 10)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="缩小"
          >
            <MdZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={5}
            max={500}
            step={5}
            value={pixelsPerSecond}
            onChange={(e) => onPixelsPerSecondChange(Number(e.target.value))}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <button
            type="button"
            onClick={() => onPixelsPerSecondChange(pixelsPerSecond + 10)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="放大"
          >
            <MdZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 颜色主题 */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-400">颜色主题</span>
        <div className="grid grid-cols-4 gap-1.5">
          {THEMES.map((theme) => (
            <button
              type="button"
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`
                relative p-1.5 rounded text-xs transition-all
                ${
                  themeId === theme.id
                    ? 'bg-slate-600 ring-1 ring-cyan-500'
                    : 'bg-slate-700 hover:bg-slate-600'
                }
              `}
              title={theme.name}
            >
              <div className="flex gap-0.5 mb-1">
                {theme.colors.slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="text-slate-300 text-[10px] leading-none">
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 琴键显示开关 */}
      <Button
        onClick={onTogglePianoKeys}
        variant={showPianoKeys ? 'default' : 'primary'}
        size="lg"
        active={!showPianoKeys}
        className="w-full"
      >
        {showPianoKeys ? '隐藏琴键' : '显示琴键'}
      </Button>

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
