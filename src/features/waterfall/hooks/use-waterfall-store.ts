import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AudioState, MidiFileData } from '../types'
import { DEFAULT_THEME_ID } from '../utils/themes'

interface WaterfallState {
  // MIDI 文件数据（带索引）
  midiData: MidiFileData | null
  // 当前选择的 MIDI 文件路径（持久化）
  selectedMidiPath: string | null
  // 播放控制状态（UI 用）
  playback: {
    isPlaying: boolean
    bpm: number
    originalBpm: number
  }
  // 音频状态
  audio: AudioState
  // 节拍器音量（独立于 MIDI 音量）
  metronomeVolume: number
  // 倒数状态
  countdown: {
    enabled: boolean // 是否启用倒数
    isCountingDown: boolean // 是否正在倒数
    currentBeat: number // 当前倒数拍数 (4, 3, 2, 1)
  }
  // 节拍器状态
  metronome: {
    enabled: boolean // 是否启用节拍器
  }
  // 画布尺寸
  canvasSize: { width: number; height: number }
  // 瀑布流缩放（像素/秒）
  pixelsPerSecond: number
  // 时间窗口 (秒) - 显示未来多少秒的音符
  timeWindow: number
  // 提前量 (秒) - 给用户准备时间
  lookAheadTime: number
  // 是否显示帮助
  showHelp: boolean
  // 瀑布流主题 ID
  themeId: string
  // 是否显示钢琴键盘
  showPianoKeys: boolean
  // 小节循环状态
  loop: {
    enabled: boolean // 是否启用循环
    startMeasure: number // 开始小节（1-based）
    endMeasure: number // 结束小节（1-based）
  }
}

interface WaterfallActions {
  // 设置 MIDI 数据
  setMidiData: (data: MidiFileData | null) => void
  // 设置选择的 MIDI 文件路径
  setSelectedMidiPath: (path: string | null) => void
  // 播放控制
  play: () => void
  pause: () => void
  togglePlay: () => void
  // 时间控制（兼容接口，实际使用 playbackState）
  seek: (time: number) => void
  // BPM 控制
  setBpm: (bpm: number) => void
  // 音频控制
  toggleMute: () => void
  setVolume: (volume: number) => void
  setMetronomeVolume: (volume: number) => void
  // 倒数控制
  toggleCountdown: () => void
  startCountdown: () => void
  setCountdownBeat: (beat: number) => void
  stopCountdown: () => void
  // 节拍器控制
  toggleMetronome: () => void
  // 画布尺寸
  setCanvasSize: (width: number, height: number) => void
  // 瀑布流缩放
  setPixelsPerSecond: (value: number) => void
  // 时间窗口
  setTimeWindow: (seconds: number) => void
  // 提前量
  setLookAheadTime: (seconds: number) => void
  // 帮助
  toggleHelp: () => void
  // 主题
  setThemeId: (id: string) => void
  // 钢琴键盘显示
  togglePianoKeys: () => void
  // 循环控制
  toggleLoop: () => void
  setLoopRange: (start: number, end: number) => void
}

// 需要持久化的状态（用户偏好设置）
interface PersistedState {
  audio: AudioState
  metronomeVolume: number
  pixelsPerSecond: number
  selectedMidiPath: string | null
  countdown: {
    enabled: boolean
    isCountingDown: boolean
    currentBeat: number
  }
  metronome: {
    enabled: boolean
  }
  showHelp: boolean
  themeId: string
  showPianoKeys: boolean
  loop: {
    enabled: boolean
    startMeasure: number
    endMeasure: number
  }
}

const initialState: WaterfallState = {
  midiData: null,
  selectedMidiPath: null,
  playback: {
    isPlaying: false,
    bpm: 120,
    originalBpm: 120,
  },
  audio: {
    isMuted: false,
    volume: 0.5,
  },
  metronomeVolume: 0.5,
  countdown: {
    enabled: true,
    isCountingDown: false,
    currentBeat: 0,
  },
  metronome: {
    enabled: false,
  },
  canvasSize: { width: 0, height: 0 },
  pixelsPerSecond: 150,
  timeWindow: 4,
  lookAheadTime: 2,
  showHelp: false,
  themeId: DEFAULT_THEME_ID,
  showPianoKeys: true,
  loop: {
    enabled: false,
    startMeasure: 1,
    endMeasure: 4,
  },
}

export const useWaterfallStore = create<
  WaterfallState & WaterfallActions,
  [['zustand/persist', PersistedState]]
>(
  persist(
    (set, get) => ({
      ...initialState,

      setMidiData: (data) =>
        set({
          midiData: data,
          playback: {
            isPlaying: false,
            bpm: data?.originalBpm || 120,
            originalBpm: data?.originalBpm || 120,
          },
        }),

      setSelectedMidiPath: (path) => set({ selectedMidiPath: path }),

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

      seek: (_time: number) => {
        // seek 已迁移到 playbackState，此方法保留用于兼容
        // 外部应调用 playbackState.setCurrentTime(time)
      },

      setBpm: (bpm) =>
        set((state) => ({
          playback: {
            ...state.playback,
            bpm: Math.max(0, Math.min(240, bpm)),
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

      setMetronomeVolume: (volume) =>
        set({ metronomeVolume: Math.max(0, Math.min(1, volume)) }),

      toggleCountdown: () =>
        set((state) => ({
          countdown: { ...state.countdown, enabled: !state.countdown.enabled },
        })),

      startCountdown: () =>
        set((state) => ({
          countdown: {
            ...state.countdown,
            isCountingDown: true,
            currentBeat: 4,
          },
        })),

      setCountdownBeat: (beat) =>
        set((state) => ({
          countdown: { ...state.countdown, currentBeat: beat },
        })),

      stopCountdown: () =>
        set((state) => ({
          countdown: {
            ...state.countdown,
            isCountingDown: false,
            currentBeat: 0,
          },
        })),

      toggleMetronome: () =>
        set((state) => ({
          metronome: { ...state.metronome, enabled: !state.metronome.enabled },
        })),

      setCanvasSize: (width, height) => set({ canvasSize: { width, height } }),

      setPixelsPerSecond: (value) =>
        set({ pixelsPerSecond: Math.max(50, Math.min(400, value)) }),

      setTimeWindow: (seconds) => set({ timeWindow: seconds }),

      setLookAheadTime: (seconds) =>
        set({ lookAheadTime: Math.max(0, Math.min(10, seconds)) }),

      toggleHelp: () => set((state) => ({ showHelp: !state.showHelp })),

      setThemeId: (id) => set({ themeId: id }),

      togglePianoKeys: () =>
        set((state) => ({ showPianoKeys: !state.showPianoKeys })),

      toggleLoop: () =>
        set((state) => ({
          loop: { ...state.loop, enabled: !state.loop.enabled },
        })),

      setLoopRange: (start, end) =>
        set((state) => ({
          loop: {
            ...state.loop,
            startMeasure: Math.max(1, start),
            endMeasure: Math.max(start, end),
          },
        })),
    }),
    {
      name: 'waterfall-store',
      partialize: (state) => ({
        audio: state.audio,
        metronomeVolume: state.metronomeVolume,
        pixelsPerSecond: state.pixelsPerSecond,
        selectedMidiPath: state.selectedMidiPath,
        countdown: {
          enabled: state.countdown.enabled,
          isCountingDown: false,
          currentBeat: 0,
        },
        metronome: state.metronome,
        showHelp: state.showHelp,
        themeId: state.themeId,
        showPianoKeys: state.showPianoKeys,
        loop: state.loop,
      }),
    },
  ),
)
