// 播放控制 Hook
// 替代原来的 use-piano-waterfall.ts
// 负责协调动画循环、音频播放和状态更新

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWaterfallStore } from './use-waterfall-store'
import { playbackState } from '../core/playback-state'
import { useMidiFile } from './use-midi-file'
import { useMidiInput } from './use-midi-input'
import { useAudio } from './use-audio'
import { calculatePianoLayout } from '../utils/piano-layout'
import { useAnimationFrame, PRIORITY } from './use-animation-frame'
import type { PianoKeyLayout } from '../utils/piano-layout'

const PIXELS_PER_SECOND = 150
const DEFAULT_MIDI_FILE = '/One_Summers_Day_Spirited_Away__Joe_Hisaishi.mid'

export function usePlayback() {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastTimeRef = useRef<number>(0)
  const pianoLayoutRef = useRef<{ keys: PianoKeyLayout[]; scale: number }>({
    keys: [],
    scale: 1,
  })

  // 节拍器和倒数计时器引用
  const metronomeIntervalRef = useRef<number | undefined>(undefined)
  const countdownTimeoutRef = useRef<number | undefined>(undefined)

  // Store 状态（只读 UI 状态）
  const {
    midiData,
    playback: storePlayback,
    audio,
    metronomeVolume,
    countdown,
    metronome,
    canvasSize,
    timeWindow,
    setMidiData,
    play: storePlay,
    pause: storePause,
    seek,
    setBpm,
    toggleMute,
    setVolume,
    setMetronomeVolume: setStoreMetronomeVolume,
    toggleCountdown,
    startCountdown,
    setCountdownBeat,
    stopCountdown,
    toggleMetronome,
    setCanvasSize,
    showHelp,
    toggleHelp,
  } = useWaterfallStore()

  // Hooks
  const { midiData: parsedMidiData, parseMidiFile, isLoading } = useMidiFile()
  const { startListening, stopListening } = useMidiInput()
  const {
    playNote,
    stopNote,
    stopAllNotes,
    playClick,
    setMidiVolume,
    setMetronomeVolume: setAudioMetronomeVolume,
  } = useAudio()

  // 同步解析后的 MIDI 数据到 store
  useEffect(() => {
    if (parsedMidiData && parsedMidiData !== midiData) {
      setMidiData(parsedMidiData)
    }
  }, [parsedMidiData, midiData, setMidiData])

  // 同步音量到音频引擎
  useEffect(() => {
    setMidiVolume(audio.volume)
  }, [audio.volume, setMidiVolume])

  useEffect(() => {
    setAudioMetronomeVolume(metronomeVolume)
  }, [metronomeVolume, setAudioMetronomeVolume])

  // 自动启动 MIDI 输入监听
  useEffect(() => {
    startListening()
    return () => stopListening()
  }, [startListening, stopListening])

  // 加载默认 MIDI 文件
  const loadDefaultMidi = useCallback(async () => {
    try {
      const response = await fetch(DEFAULT_MIDI_FILE)
      if (!response.ok) throw new Error('Failed to load default MIDI')
      const blob = await response.blob()
      const file = new File([blob], 'default.mid', { type: 'audio/midi' })
      await parseMidiFile(file)
    } catch (err) {
      console.error('Failed to load default MIDI:', err)
    }
  }, [parseMidiFile])

  // 自动加载默认文件
  useEffect(() => {
    loadDefaultMidi()
  }, [loadDefaultMidi])

  // 计算钢琴布局
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const layout = calculatePianoLayout(width)
        pianoLayoutRef.current = layout
        setCanvasSize(width, containerRef.current.clientHeight)
      }
    }

    updateLayout()

    const resizeObserver = new ResizeObserver(updateLayout)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => resizeObserver.disconnect()
  }, [setCanvasSize])

  // 更新 PlaybackState 的 BPM
  useEffect(() => {
    playbackState.setBpm(storePlayback.bpm)
  }, [storePlayback.bpm])

  // 暂停时停止所有音符
  useEffect(() => {
    if (!storePlayback.isPlaying) {
      // 清除所有瀑布流触发的活动按键
      const activeKeys = playbackState.getActiveKeys()
      for (const [midi, activeKey] of activeKeys) {
        if (activeKey.source === 'waterfall') {
          playbackState.removeActiveKey(midi, 'waterfall')
          stopNote(midi)
        }
      }
      stopAllNotes()
    }
  }, [storePlayback.isPlaying, stopNote, stopAllNotes])

  // ===== 播放动画循环 =====
  useAnimationFrame(
    (timestamp, deltaTime) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp
      }

      // 计算基于 BPM 的播放速率
      const playbackRate =
        storePlayback.bpm / Math.max(1, storePlayback.originalBpm)
      const newTime = playbackState.currentTime + deltaTime * playbackRate

      // 检查是否播放结束
      if (midiData && newTime >= midiData.duration) {
        storePause()
        playbackState.setCurrentTime(midiData.duration)
        playbackState.clearActiveKeys()
        stopAllNotes()
      } else {
        // 更新高频状态（不触发 React 重渲染）
        playbackState.setCurrentTime(newTime)

        // 更新活动按键（触发音频播放）
        updateActiveKeys(newTime)
      }
    },
    storePlayback.isPlaying && !countdown.isCountingDown,
    PRIORITY.PLAYBACK,
  )

  // 更新活动按键（瀑布流触发的）
  const updateActiveKeys = useCallback(
    (currentTime: number) => {
      if (!midiData?.noteIndex) return

      // 使用索引查询当前播放的音符 O(log n) 而不是 O(n)
      const playingNotes = midiData.noteIndex.getNotesAtTime(currentTime)

      const currentActiveKeys = playbackState.getActiveKeys()
      const isMuted = audio.isMuted

      // 移除过期的按键
      for (const [midi, activeKey] of currentActiveKeys) {
        if (activeKey.source === 'waterfall') {
          const stillPlaying = playingNotes.some((n) => n.midi === midi)
          if (!stillPlaying) {
            playbackState.removeActiveKey(midi, 'waterfall')
            if (!isMuted) {
              stopNote(midi)
            }
          }
        }
      }

      // 添加新的按键
      for (const note of playingNotes) {
        const existing = playbackState.getActiveKeys().get(note.midi)
        if (!existing || existing.source !== 'waterfall') {
          playbackState.addActiveKey({
            midi: note.midi,
            velocity: note.velocity,
            source: 'waterfall',
            color: note.color,
          })
          if (!isMuted) {
            playNote(note.midi, note.velocity)
          }
        }
      }
    },
    [midiData, audio.isMuted, playNote, stopNote],
  )

  // ===== 节拍器 =====
  useEffect(() => {
    if (!metronome.enabled || !storePlayback.isPlaying) {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
        metronomeIntervalRef.current = undefined
      }
      return
    }

    const beatInterval = (60 / storePlayback.bpm) * 1000

    // 立即播放第一拍
    playClick(true)

    let beatCount = 1
    metronomeIntervalRef.current = window.setInterval(() => {
      const isAccent = beatCount % 4 === 0
      playClick(isAccent)
      beatCount++
    }, beatInterval)

    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
      }
    }
  }, [metronome.enabled, storePlayback.isPlaying, storePlayback.bpm, playClick])

  // ===== 倒数功能 =====
  const playWithCountdown = useCallback(() => {
    if (storePlayback.isPlaying || countdown.isCountingDown) return

    if (!countdown.enabled) {
      storePlay()
      return
    }

    startCountdown()

    const beatInterval = (60 / storePlayback.bpm) * 1000

    playClick(true)

    let beatsRemaining = 3

    const tick = () => {
      if (beatsRemaining > 0) {
        setCountdownBeat(beatsRemaining)
        playClick(false)
        beatsRemaining--
        countdownTimeoutRef.current = window.setTimeout(tick, beatInterval)
      } else {
        stopCountdown()
        storePlay()
      }
    }

    countdownTimeoutRef.current = window.setTimeout(tick, beatInterval)
  }, [
    storePlayback.isPlaying,
    storePlayback.bpm,
    countdown.enabled,
    countdown.isCountingDown,
    storePlay,
    startCountdown,
    setCountdownBeat,
    stopCountdown,
    playClick,
  ])

  const cancelCountdown = useCallback(() => {
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current)
      countdownTimeoutRef.current = undefined
    }
    stopCountdown()
  }, [stopCountdown])

  // 清理
  useEffect(() => {
    return () => {
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current)
      }
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current)
      }
    }
  }, [])

  // 处理停止
  const handleStop = useCallback(() => {
    cancelCountdown()
    storePause()
    seek(0)
    playbackState.setCurrentTime(0)
    playbackState.clearActiveKeys()
    stopAllNotes()
  }, [cancelCountdown, storePause, seek, stopAllNotes])

  // 计算瀑布流高度
  const waterfallHeight = timeWindow * PIXELS_PER_SECOND

  // 全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen().catch(console.error)
    }
  }, [])

  return {
    // Refs
    containerRef,
    pianoLayoutRef,

    // State
    midiData,
    playback: storePlayback,
    audio,
    metronomeVolume,
    countdown,
    metronome,
    canvasSize,
    timeWindow,
    waterfallHeight,
    showHelp,

    // Actions
    play: playWithCountdown,
    pause: storePause,
    seek,
    setBpm,
    toggleMute,
    setMidiVolume: setVolume,
    setMetronomeVolume: setStoreMetronomeVolume,
    toggleCountdown,
    toggleMetronome,
    toggleHelp,
    handleStop,
    loadDefaultMidi,
    handleFileSelect: parseMidiFile,
    isLoading,
    isFullscreen,
    toggleFullscreen,

    // Layout
    PIXELS_PER_SECOND,
  }
}
