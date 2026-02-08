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
  metronome: {
    enabled: boolean
  }
  onPlay: () => void
  onPause: () => void
  onStop: () => void
  onSeek: (time: number) => void
  onBpmChange: (bpm: number) => void
  onToggleHelp: () => void
  onToggleCountdown: () => void
  onToggleMetronome: () => void
  showHelp: boolean
  isMuted: boolean
  midiVolume: number
  metronomeVolume: number
  onToggleMute: () => void
  onMidiVolumeChange: (volume: number) => void
  onMetronomeVolumeChange: (volume: number) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  onFileSelect?: (file: File) => void
  onLoadDefaultMidi?: () => void
  hasMidiData?: boolean
  pixelsPerSecond: number
  onPixelsPerSecondChange: (value: number) => void
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
  onLoadDefaultMidi?: () => void
  tracks: TrackInfo[]
  pixelsPerSecond: number
  onPixelsPerSecondChange: (value: number) => void
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
