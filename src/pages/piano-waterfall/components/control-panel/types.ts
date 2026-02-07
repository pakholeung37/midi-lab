import type { TrackInfo } from '../../types'

export interface ControlPanelProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  bpm: number
  originalBpm: number
  tracks: TrackInfo[]
  countdown: {
    enabled: boolean
    isCountingDown: boolean
    currentBeat: number
  }
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onSeek: (time: number) => void
  onBpmChange: (bpm: number) => void
  onToggleHelp: () => void
  onToggleCountdown: () => void
  showHelp: boolean
  isMuted: boolean
  volume: number
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onFileSelect?: (file: File) => void
  onLoadDefaultMidi?: () => void
  hasMidiData?: boolean
}

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
  volume: number
  isMuted: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
  showHelp: boolean
  onToggleHelp: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onFileSelect?: (file: File) => void
  onLoadDefaultMidi?: () => void
  tracks: TrackInfo[]
}

export interface TrackListProps {
  tracks: TrackInfo[]
}

export interface VolumeControlProps {
  volume: number
  isMuted: boolean
  onVolumeChange: (volume: number) => void
  onToggleMute: () => void
}
