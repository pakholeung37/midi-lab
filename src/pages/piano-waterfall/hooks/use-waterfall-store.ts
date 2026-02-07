import { create } from 'zustand'
import type {
  ActiveKey,
  AudioState,
  MidiFileData,
  PlaybackState,
  WaterfallNote,
} from '../types'

interface WaterfallState {
  // MIDI 文件数据
  midiData: MidiFileData | null
  // 播放状态
  playback: PlaybackState
  // 音频状态
  audio: AudioState
  // 倒数状态
  countdown: {
    enabled: boolean // 是否启用倒数
    isCountingDown: boolean // 是否正在倒数
    currentBeat: number // 当前倒数拍数 (4, 3, 2, 1)
  }
  // 活动按键 (来自瀑布流 + 实时输入)
  activeKeys: Map<number, ActiveKey>
  // 当前可见的音符
  visibleNotes: WaterfallNote[]
  // 画布尺寸
  canvasSize: { width: number; height: number }
  // 时间窗口 (秒) - 显示未来多少秒的音符
  timeWindow: number
  // 提前量 (秒) - 给用户准备时间
  lookAheadTime: number
  // 是否显示帮助
  showHelp: boolean
}

interface WaterfallActions {
  // 设置 MIDI 数据
  setMidiData: (data: MidiFileData | null) => void
  // 播放控制
  play: () => void
  pause: () => void
  togglePlay: () => void
  // 时间控制
  setCurrentTime: (time: number) => void
  seek: (time: number) => void
  // BPM 控制
  setBpm: (bpm: number) => void
  // 音频控制
  toggleMute: () => void
  setVolume: (volume: number) => void
  // 倒数控制
  toggleCountdown: () => void
  startCountdown: () => void
  setCountdownBeat: (beat: number) => void
  stopCountdown: () => void
  // 活动按键
  addActiveKey: (key: ActiveKey) => void
  removeActiveKey: (midi: number, source: 'waterfall' | 'input') => void
  clearActiveKeys: () => void
  // 可见音符
  setVisibleNotes: (notes: WaterfallNote[]) => void
  // 画布尺寸
  setCanvasSize: (width: number, height: number) => void
  // 时间窗口
  setTimeWindow: (seconds: number) => void
  // 提前量
  setLookAheadTime: (seconds: number) => void
  // 帮助
  toggleHelp: () => void
}

const initialState: WaterfallState = {
  midiData: null,
  playback: {
    isPlaying: false,
    currentTime: 0,
    bpm: 120,
    originalBpm: 120,
  },
  audio: {
    isMuted: false,
    volume: 0.5,
  },
  countdown: {
    enabled: true,
    isCountingDown: false,
    currentBeat: 0,
  },
  activeKeys: new Map(),
  visibleNotes: [],
  canvasSize: { width: 0, height: 0 },
  timeWindow: 4, // 默认显示未来 4 秒的音符
  lookAheadTime: 2, // 默认提前 2 秒显示
  showHelp: false,
}

export const useWaterfallStore = create<WaterfallState & WaterfallActions>(
  (set, get) => ({
    ...initialState,

    setMidiData: (data) =>
      set({
        midiData: data,
        playback: { ...initialState.playback },
        activeKeys: new Map(),
        visibleNotes: [],
      }),

    play: () =>
      set((state) => ({
        playback: { ...state.playback, isPlaying: true },
      })),

    pause: () =>
      set((state) => ({
        playback: { ...state.playback, isPlaying: false },
      })),

    togglePlay: () => {
      const { playback } = get()
      set((state) => ({
        playback: { ...state.playback, isPlaying: !playback.isPlaying },
      }))
    },

    setCurrentTime: (time) =>
      set((state) => ({
        playback: { ...state.playback, currentTime: Math.max(0, time) },
      })),

    seek: (time) =>
      set((state) => ({
        playback: { ...state.playback, currentTime: Math.max(0, time) },
      })),

    setBpm: (bpm) =>
      set((state) => ({
        playback: {
          ...state.playback,
          bpm: Math.max(40, Math.min(240, bpm)),
        },
      })),

    toggleMute: () =>
      set((state) => ({
        audio: { ...state.audio, isMuted: !state.audio.isMuted },
      })),

    setVolume: (volume) =>
      set((state) => ({
        audio: { ...state.audio, volume: Math.max(0, Math.min(1, volume)) },
      })),

    toggleCountdown: () =>
      set((state) => ({
        countdown: { ...state.countdown, enabled: !state.countdown.enabled },
      })),

    startCountdown: () =>
      set((state) => ({
        countdown: { ...state.countdown, isCountingDown: true, currentBeat: 4 },
      })),

    setCountdownBeat: (beat) =>
      set((state) => ({
        countdown: { ...state.countdown, currentBeat: beat },
      })),

    stopCountdown: () =>
      set((state) => ({
        countdown: { ...state.countdown, isCountingDown: false, currentBeat: 0 },
      })),

    addActiveKey: (key) =>
      set((state) => {
        const newMap = new Map(state.activeKeys)
        newMap.set(key.midi, key)
        return { activeKeys: newMap }
      }),

    removeActiveKey: (midi, source) =>
      set((state) => {
        const newMap = new Map(state.activeKeys)
        const existing = newMap.get(midi)
        if (existing && existing.source === source) {
          newMap.delete(midi)
        }
        return { activeKeys: newMap }
      }),

    clearActiveKeys: () => set({ activeKeys: new Map() }),

    setVisibleNotes: (notes) => set({ visibleNotes: notes }),

    setCanvasSize: (width, height) => set({ canvasSize: { width, height } }),

    setTimeWindow: (seconds) => set({ timeWindow: seconds }),

    setLookAheadTime: (seconds) =>
      set({ lookAheadTime: Math.max(0, Math.min(10, seconds)) }),

    toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),
  }),
)
