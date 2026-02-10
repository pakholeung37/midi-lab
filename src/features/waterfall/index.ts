// 通用瀑布流引擎 - 公共 API
export { WaterfallCanvas } from './components/waterfall-canvas'
export { ControlPanel } from './components/control-panel'
export { MusicInfoOverlay } from './components/music-info-overlay'

export { usePlayback } from './hooks/use-playback'
export { useWaterfallStore } from './hooks/use-waterfall-store'

export { playbackState } from './core/playback-state'

export type {
  InstrumentLayout,
  InstrumentKey,
  CalculateLayout,
} from './instrument'
export type {
  WaterfallNote,
  MidiFileData,
  TrackInfo,
  ActiveKey,
  PlaybackState,
  AudioState,
  TimeSignature,
  KeySignature,
} from './types'
