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
  transposeSemitones,
  onTransposeSemitonesChange,
  horizontalScale,
  onHorizontalScaleChange,
  themeId,
  onThemeChange,
  showPianoKeys,
  onTogglePianoKeys,
}: SettingsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="w-56 p-3 space-y-3">
      <h3 className="text-xs font-medium text-slate-300">Settings</h3>

      {/* MIDI file selection */}
      {midiFiles.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs text-slate-400">MIDI File</span>
          <select
            value={selectedMidiPath || ''}
            onChange={(e) => onMidiSelect?.(e.target.value)}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="" disabled>
              Select file...
            </option>
            {midiFiles.map((file) => (
              <option key={file.path} value={file.path}>
                {file.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Upload MIDI */}
      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="default"
          size="lg"
          icon={<MdUpload className="w-3.5 h-3.5" />}
          title="Upload MIDI file"
          className="flex-1"
        >
          Upload MIDI
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

      {/* Vertical zoom */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Vertical Zoom</span>
          <span className="text-xs text-slate-500 font-mono">
            {Math.round((pixelsPerSecond / 150) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPixelsPerSecondChange(pixelsPerSecond - 10)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom out"
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
            title="Zoom in"
          >
            <MdZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Transpose */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Transpose</span>
          <button
            type="button"
            onClick={() => onTransposeSemitonesChange(0)}
            className={`
              text-xs font-mono px-2 py-0.5 rounded border transition-colors
              ${
                transposeSemitones === 0
                  ? 'text-slate-500 border-slate-700 bg-slate-800/40'
                  : 'text-cyan-300 border-cyan-700/60 bg-cyan-500/10 hover:bg-cyan-500/20'
              }
            `}
            title="Reset to zero"
          >
            {transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones} st
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => onTransposeSemitonesChange(transposeSemitones - 12)}
            className="h-6 rounded bg-slate-800/70 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors"
            title="Down one octave"
          >
            -12
          </button>
          <button
            type="button"
            onClick={() => onTransposeSemitonesChange(transposeSemitones - 1)}
            className="h-6 rounded bg-slate-800/70 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors"
            title="Down one semitone"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => onTransposeSemitonesChange(0)}
            className="h-6 rounded bg-slate-700/80 text-[10px] text-slate-200 hover:bg-slate-600 transition-colors"
            title="Reset"
          >
            0
          </button>
          <button
            type="button"
            onClick={() => onTransposeSemitonesChange(transposeSemitones + 1)}
            className="h-6 rounded bg-slate-800/70 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors"
            title="Up one semitone"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => onTransposeSemitonesChange(transposeSemitones + 12)}
            className="h-6 rounded bg-slate-800/70 text-[10px] text-slate-300 hover:bg-slate-700 transition-colors"
            title="Up one octave"
          >
            +12
          </button>
        </div>
        <div className="text-[10px] text-slate-500 text-center">
          Range: -24 to +24 semitones
        </div>
      </div>

      {/* Horizontal zoom */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Horizontal Zoom</span>
          <span className="text-xs text-slate-500 font-mono">
            {Math.round(horizontalScale * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onHorizontalScaleChange(horizontalScale - 0.05)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom out"
          >
            <MdZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={0.2}
            max={3}
            step={0.05}
            value={horizontalScale}
            onChange={(e) => onHorizontalScaleChange(Number(e.target.value))}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <button
            type="button"
            onClick={() => onHorizontalScaleChange(horizontalScale + 0.05)}
            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="Zoom in"
          >
            <MdZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Color theme */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-400">Color Theme</span>
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

      {/* Keyboard visibility toggle */}
      <Button
        onClick={onTogglePianoKeys}
        variant={showPianoKeys ? 'default' : 'primary'}
        size="lg"
        active={!showPianoKeys}
        className="w-full"
      >
        {showPianoKeys ? 'Hide Keyboard' : 'Show Keyboard'}
      </Button>

      {/* Help button */}
      <Button
        onClick={onToggleHelp}
        variant={showHelp ? 'primary' : 'default'}
        size="lg"
        active={showHelp}
        icon={<MdHelpOutline className="w-3.5 h-3.5" />}
        className="w-full"
      >
        Keyboard Shortcuts
      </Button>

      {/* Fullscreen button */}
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
        {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      </Button>

      {/* Track list */}
      <TrackList tracks={tracks} />
    </div>
  )
}
