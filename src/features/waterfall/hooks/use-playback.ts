// 播放控制 Hook（通用版）
// 负责协调动画循环、音频播放和状态更新
// 不包含任何乐器特有逻辑

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWaterfallStore } from './use-waterfall-store'
import { playbackState } from '../core/playback-state'
import { useMidiFile } from './use-midi-file'
import { useMidiInput } from './use-midi-input'
import { useAudio } from './use-audio'
import { useAnimationFrame, PRIORITY } from './use-animation-frame'
import type { TimeSignature, WaterfallNote } from '../types'

const PIXELS_PER_SECOND = 150

export function usePlayback() {
  const lastTimeRef = useRef<number>(0)
  const activeWaterfallNotesRef = useRef<Map<number, string>>(new Map())

  // 倒数计时器引用
  const countdownTimeoutRef = useRef<number | undefined>(undefined)

  // 初始加载标记
  const initialLoadDoneRef = useRef(false)

  // Store 状态（只读 UI 状态）
  const {
    midiData,
    playback: storePlayback,
    audio,
    metronomeVolume,
    countdown,
    metronome,
    timeWindow,
    selectedMidiPath,
    setMidiData,
    setSelectedMidiPath,
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
    showHelp,
    toggleHelp,
    themeId,
    setThemeId,
    loop,
    toggleLoop,
    setLoopRange,
  } = useWaterfallStore()

  // Hooks
  const {
    midiData: parsedMidiData,
    parseMidiFile,
    recolorNotes,
    isLoading,
  } = useMidiFile()
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
      // 重置播放状态
      storePause()
      playbackState.setCurrentTime(0)
      playbackState.clearActiveKeys()
      activeWaterfallNotesRef.current.clear()
      stopAllNotes()

      setMidiData(parsedMidiData)
    }
  }, [parsedMidiData, midiData, setMidiData, storePause, stopAllNotes])

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

  // 加载 MIDI 文件（通过路径）
  const loadMidiFromPath = useCallback(
    async (path: string) => {
      try {
        const response = await fetch(path)
        if (!response.ok) throw new Error('Failed to load MIDI')
        const blob = await response.blob()
        const filename = path.split('/').pop() || 'midi.mid'
        const file = new File([blob], filename, { type: 'audio/midi' })
        await parseMidiFile(file, themeId)
        setSelectedMidiPath(path)
      } catch (err) {
        console.error('Failed to load MIDI:', err)
      }
    },
    [parseMidiFile, setSelectedMidiPath, themeId],
  )

  // 自动加载持久化的 MIDI 文件
  useEffect(() => {
    if (initialLoadDoneRef.current) return
    if (selectedMidiPath && !midiData) {
      initialLoadDoneRef.current = true
      loadMidiFromPath(selectedMidiPath)
    }
  }, [selectedMidiPath, midiData, loadMidiFromPath])

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
      activeWaterfallNotesRef.current.clear()
      stopAllNotes()
    }
  }, [storePlayback.isPlaying, stopNote, stopAllNotes])

  // 计算小节时间范围（用于循环）- 提前定义以便在播放循环中使用
  const getLoopTimeRange = useCallback(() => {
    if (!loop.enabled || !midiData?.timeSignatures?.length) {
      return null
    }
    const bpm = midiData.originalBpm || 120
    const ts = midiData.timeSignatures[0]
    const beatsPerMeasure = ts.numerator
    const beatDuration = 60 / bpm
    const measureDuration = beatDuration * beatsPerMeasure

    const startTime = (loop.startMeasure - 1) * measureDuration
    const endTime = Math.min(
      loop.endMeasure * measureDuration,
      midiData.duration,
    )

    return { startTime, endTime }
  }, [loop, midiData])

  // ===== 播放动画循环 =====
  useAnimationFrame(
    (timestamp, deltaTime) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp
      }

      // 计算基于 BPM 的播放速率
      const playbackRate =
        storePlayback.bpm / Math.max(1, storePlayback.originalBpm)
      const prevTime = playbackState.currentTime
      let newTime = prevTime + deltaTime * playbackRate

      // 检查循环范围
      const loopRange = getLoopTimeRange()
      if (loopRange && newTime >= loopRange.endTime) {
        // 循环回到开始
        newTime = loopRange.startTime
        playbackState.clearActiveKeys()
        activeWaterfallNotesRef.current.clear()
        stopAllNotes()
      }

      // 检查是否播放结束
      if (midiData && newTime >= midiData.duration) {
        storePause()
        playbackState.setCurrentTime(midiData.duration)
        playbackState.clearActiveKeys()
        activeWaterfallNotesRef.current.clear()
        stopAllNotes()
      } else {
        // 更新高频状态（不触发 React 重渲染）
        playbackState.setCurrentTime(newTime)

        // 更新活动按键（触发音频播放）
        updateActiveKeys(newTime)

        // 节拍器：检测是否跨越了节拍点
        if (metronome.enabled && midiData?.timeSignatures) {
          checkMetronomeBeat(prevTime, newTime, midiData.timeSignatures)
        }
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
      const isMuted = audio.isMuted
      const currentWaterfallNotes = activeWaterfallNotesRef.current
      const nextNotesByMidi = new Map<number, WaterfallNote>()

      for (const note of playingNotes) {
        const existing = nextNotesByMidi.get(note.midi)
        if (
          !existing ||
          note.time > existing.time ||
          (note.time === existing.time && note.id > existing.id)
        ) {
          nextNotesByMidi.set(note.midi, note)
        }
      }

      // 同音高时按音符 id 跟踪，确保无缝衔接时也能触发下一音符
      for (const [midi, currentNoteId] of currentWaterfallNotes) {
        const nextNote = nextNotesByMidi.get(midi)

        if (!nextNote) {
          currentWaterfallNotes.delete(midi)
          playbackState.removeActiveKey(midi, 'waterfall')
          if (!isMuted) {
            stopNote(midi)
          }
          continue
        }

        if (nextNote.id !== currentNoteId) {
          currentWaterfallNotes.set(midi, nextNote.id)
          playbackState.addActiveKey({
            midi: nextNote.midi,
            velocity: nextNote.velocity,
            source: 'waterfall',
            color: nextNote.color,
          })
          if (!isMuted) {
            playNote(nextNote.midi, nextNote.velocity)
          }
        }
      }

      for (const [midi, note] of nextNotesByMidi) {
        if (currentWaterfallNotes.has(midi)) {
          continue
        }

        currentWaterfallNotes.set(midi, note.id)
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
    },
    [midiData, audio.isMuted, playNote, stopNote],
  )

  // 节拍器：检测跨越节拍点并播放 click
  const checkMetronomeBeat = useCallback(
    (
      prevTime: number,
      currentTime: number,
      timeSignatures: TimeSignature[],
    ) => {
      // 使用原始 BPM 计算节拍（与节拍网格一致）
      const bpm = midiData?.originalBpm || 120
      const beatDuration = 60 / bpm

      // 获取当前拍号
      let ts = timeSignatures[0]
      for (let i = timeSignatures.length - 1; i >= 0; i--) {
        if (timeSignatures[i].time <= currentTime) {
          ts = timeSignatures[i]
          break
        }
      }
      const beatsPerMeasure = ts?.numerator || 4

      // 计算上一帧和当前帧的节拍索引
      const prevBeatIndex = Math.floor(prevTime / beatDuration)
      const currentBeatIndex = Math.floor(currentTime / beatDuration)

      // 如果跨越了节拍点
      if (currentBeatIndex > prevBeatIndex && currentBeatIndex >= 0) {
        // 计算小节内的拍数 (0-based)
        const beatInMeasure = currentBeatIndex % beatsPerMeasure
        // 第一拍是强拍
        const isAccent = beatInMeasure === 0
        playClick(isAccent)
      }
    },
    [midiData?.originalBpm, playClick],
  )

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
    }
  }, [])

  // 处理停止
  const handleStop = useCallback(() => {
    cancelCountdown()
    storePause()
    seek(0)
    playbackState.setCurrentTime(0)
    playbackState.clearActiveKeys()
    activeWaterfallNotesRef.current.clear()
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

  // 主题变化时重新着色
  const handleThemeChange = useCallback(
    (newThemeId: string) => {
      setThemeId(newThemeId)
      recolorNotes(newThemeId)
    },
    [setThemeId, recolorNotes],
  )

  // 计算小节时间范围（用于循环）
  const getMeasureTimeRange = useCallback(
    (startMeasure: number, endMeasure: number) => {
      if (!midiData?.timeSignatures || midiData.timeSignatures.length === 0) {
        return null
      }
      const bpm = midiData.originalBpm || 120
      const ts = midiData.timeSignatures[0]
      const beatsPerMeasure = ts.numerator
      const beatDuration = 60 / bpm
      const measureDuration = beatDuration * beatsPerMeasure

      const startTime = (startMeasure - 1) * measureDuration
      const endTime = endMeasure * measureDuration

      return { startTime, endTime: Math.min(endTime, midiData.duration) }
    },
    [midiData],
  )

  // 获取总小节数
  const getTotalMeasures = useCallback(() => {
    if (!midiData?.timeSignatures || midiData.timeSignatures.length === 0) {
      return 1
    }
    const bpm = midiData.originalBpm || 120
    const ts = midiData.timeSignatures[0]
    const beatsPerMeasure = ts.numerator
    const beatDuration = 60 / bpm
    const measureDuration = beatDuration * beatsPerMeasure

    return Math.ceil(midiData.duration / measureDuration)
  }, [midiData])

  // 获取小节时长
  const getMeasureDuration = useCallback(() => {
    if (!midiData?.timeSignatures || midiData.timeSignatures.length === 0) {
      return 2 // 默认 2 秒
    }
    const bpm = midiData.originalBpm || 120
    const ts = midiData.timeSignatures[0]
    const beatsPerMeasure = ts.numerator
    const beatDuration = 60 / bpm
    return beatDuration * beatsPerMeasure
  }, [midiData])

  // 按小节步进
  const seekByMeasure = useCallback(
    (direction: 1 | -1) => {
      const measureDuration = getMeasureDuration()
      const currentTime = playbackState.currentTime
      const currentMeasure = Math.floor(currentTime / measureDuration)

      let targetMeasure: number
      if (direction === -1) {
        // 后退：先回到当前小节开头
        const currentMeasureStart = currentMeasure * measureDuration
        // 如果已经在小节开头附近（0.3秒内），则回到上一个小节
        const threshold = 0.3
        if (currentTime - currentMeasureStart < threshold) {
          targetMeasure = currentMeasure - 1
        } else {
          targetMeasure = currentMeasure
        }
      } else {
        // 前进：直接到下一个小节
        targetMeasure = currentMeasure + 1
      }

      const targetTime = Math.max(0, targetMeasure * measureDuration)

      if (midiData) {
        playbackState.setCurrentTime(Math.min(targetTime, midiData.duration))
      } else {
        playbackState.setCurrentTime(targetTime)
      }

      // 清除当前音符状态
      playbackState.clearActiveKeys()
      activeWaterfallNotesRef.current.clear()
      stopAllNotes()
    },
    [getMeasureDuration, midiData, stopAllNotes],
  )

  return {
    // State
    midiData,
    playback: storePlayback,
    audio,
    metronomeVolume,
    countdown,
    metronome,
    timeWindow,
    waterfallHeight,
    showHelp,
    themeId,
    loop,
    selectedMidiPath,

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
    loadMidiFromPath,
    handleFileSelect: async (file: File) => {
      await parseMidiFile(file, themeId)
      setSelectedMidiPath(null) // 清除持久化路径，因为是本地上传
    },
    isLoading,
    isFullscreen,
    toggleFullscreen,
    handleThemeChange,
    toggleLoop,
    setLoopRange,
    getMeasureTimeRange,
    getTotalMeasures,
    seekByMeasure,

    // Layout
    PIXELS_PER_SECOND,
  }
}
