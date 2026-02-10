// 拍号事件
export interface TimeSignature {
  time: number // 开始时间（秒）
  numerator: number // 分子，如 4
  denominator: number // 分母，如 4
  measures?: number // 所在小节数
}

// 调号事件
export interface KeySignature {
  time: number // 开始时间（秒）
  key: string // 调名，如 "C", "G", "Bb", "F#"
  scale: 'major' | 'minor' // 大调或小调
}

// 瀑布流音符
export interface WaterfallNote {
  id: string
  midi: number // 0-127, 钢琴范围 21-108
  time: number // 开始时间（秒）
  duration: number // 持续时间（秒）
  velocity: number // 力度 0-1
  trackIndex: number // 音轨索引
  color: string // 霓虹色
}

// 播放状态
export interface PlaybackState {
  isPlaying: boolean
  currentTime: number // 当前位置（秒）
  bpm: number // 当前播放 BPM
  originalBpm: number // 原始 MIDI BPM
}

// 音频状态
export interface AudioState {
  isMuted: boolean
  volume: number // 0-1
}

// 活动按键
export interface ActiveKey {
  midi: number
  velocity: number
  source: 'waterfall' | 'input'
  color: string
}

// 音轨信息
export interface TrackInfo {
  index: number
  name: string
  color: string
  noteCount: number
}

// MIDI 文件解析结果
export interface MidiFileData {
  notes: WaterfallNote[]
  tracks: TrackInfo[]
  duration: number // 总时长（秒）
  name: string
  originalBpm: number // 原始 BPM
  timeSignatures: TimeSignature[] // 拍号变化
  keySignatures: KeySignature[] // 调号变化
  noteIndex?: import('./core/note-index').NoteTimeIndex // 时间索引（可选）
}
