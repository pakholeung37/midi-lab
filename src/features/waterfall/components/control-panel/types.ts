import type { TrackInfo } from '../../types'

export interface PlayControlsProps {
  isPlaying: boolean
  isCountingDown: boolean
  currentBeat: number
  onPlay: () => void
  onPause: () => void
  onStop: () => void
}

export interface ProgressBarProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export interface BpmControlProps {
  bpm: number
  originalBpm: number
  onBpmChange: (bpm: number) => void
}

export interface SettingsPanelProps {
  midiVolume: number
  metronomeVolume: number
  isMuted: boolean
  onMidiVolumeChange: (volume: number) => void
  onMetronomeVolumeChange: (volume: number) => void
  onToggleMute: () => void
  showHelp: boolean
  onToggleHelp: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onFileSelect?: (file: File) => void
  onMidiSelect?: (path: string) => void
  selectedMidiPath?: string | null
  tracks: TrackInfo[]
  pixelsPerSecond: number
  onPixelsPerSecondChange: (value: number) => void
  themeId: string
  onThemeChange: (id: string) => void
}

export interface TrackListProps {
  tracks: TrackInfo[]
}

export interface VolumeControlProps {
  label: string
  volume: number
  isMuted?: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute?: () => void
}
