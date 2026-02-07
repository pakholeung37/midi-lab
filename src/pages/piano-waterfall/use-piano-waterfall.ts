import { useEffect, useCallback, useRef, useState } from 'react'
import { useWaterfallStore } from './hooks/use-waterfall-store'
import { useMidiFile } from './hooks/use-midi-file'
import { useMidiInput } from './hooks/use-midi-input'
import { useAudio } from './hooks/use-audio'
import { calculatePianoLayout } from './utils/piano-layout'
import type { PianoKeyLayout } from './utils/piano-layout'

// 像素/秒 的速度
const PIXELS_PER_SECOND = 150

// 默认 MIDI 文件路径
const DEFAULT_MIDI_FILE = '/One_Summers_Day_Spirited_Away__Joe_Hisaishi.mid'

export function usePianoWaterfall() {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const lastTimeRef = useRef<number>(0)
  const [pianoLayout, setPianoLayout] = useState<{
    keys: PianoKeyLayout[]
    scale: number
  }>({ keys: [], scale: 1 })

  // Zustand store
  const {
    playback,
    audio,
    metronomeVolume,
    activeKeys,
    countdown,
    metronome,
    midiData: storeMidiData,
    timeWindow,
    lookAheadTime,
    canvasSize,
    setMidiData,
    play,
    pause,
    setCurrentTime,
    seek,
    setBpm,
    toggleMute,
    setVolume,
    setMetronomeVolume: setMetronomeVolumeStore,
    toggleCountdown,
    startCountdown,
    setCountdownBeat,
    stopCountdown,
    toggleMetronome,
    addActiveKey,
    removeActiveKey,
    clearActiveKeys,
    setCanvasSize,
    showHelp,
    toggleHelp,
  } = useWaterfallStore()

  // 倒数计时器引用
  const countdownTimerRef = useRef<number | undefined>(undefined)
  // 节拍器计时器引用
  const metronomeTimerRef = useRef<number | undefined>(undefined)
  // 上一次节拍时间
  const lastBeatTimeRef = useRef<number>(0)

  // MIDI 输入监听
  const {
    error: midiInputError,
    startListening: startMidiListening,
    stopListening: stopMidiListening,
  } = useMidiInput()

  // MIDI 文件处理
  const { midiData, isLoading, error, parseMidiFile } = useMidiFile()

  // 音频处理
  const {
    playNote,
    stopNote,
    stopAllNotes,
    playClick,
    setMidiVolume,
    setMetronomeVolume,
  } = useAudio()

  // 当解析完成时更新 store
  useEffect(() => {
    if (midiData !== storeMidiData) {
      setMidiData(midiData)
    }
  }, [midiData, storeMidiData, setMidiData])

  // 当 MIDI 数据加载时，更新原始 BPM
  useEffect(() => {
    if (
      midiData?.originalBpm &&
      midiData.originalBpm !== playback.originalBpm
    ) {
      const { setBpm } = useWaterfallStore.getState()
      setBpm(midiData.originalBpm)
    }
  }, [midiData, playback.originalBpm])

  // 同步 MIDI 音量
  useEffect(() => {
    setMidiVolume(audio.volume)
  }, [audio.volume, setMidiVolume])

  // 同步节拍器音量
  useEffect(() => {
    setMetronomeVolume(metronomeVolume)
  }, [metronomeVolume, setMetronomeVolume])

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (file: File) => {
      await parseMidiFile(file)
    },
    [parseMidiFile],
  )

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

  // 带倒数的播放
  const playWithCountdown = useCallback(() => {
    // 如果已经在播放或倒数中，直接返回
    if (playback.isPlaying || countdown.isCountingDown) return

    // 如果未启用倒数，直接播放
    if (!countdown.enabled) {
      play()
      return
    }

    // 开始倒数
    startCountdown()

    // 计算每拍间隔（毫秒）
    const beatInterval = (60 / playback.bpm) * 1000

    // 播放第一个节拍音（重音）
    playClick(true)

    let beatsRemaining = 3 // 还剩 3 拍

    const tick = () => {
      if (beatsRemaining > 0) {
        setCountdownBeat(beatsRemaining)
        playClick(false)
        beatsRemaining--
        countdownTimerRef.current = window.setTimeout(tick, beatInterval)
      } else {
        // 倒数结束，开始播放
        stopCountdown()
        play()
      }
    }

    countdownTimerRef.current = window.setTimeout(tick, beatInterval)
  }, [
    playback.isPlaying,
    playback.bpm,
    countdown.enabled,
    countdown.isCountingDown,
    play,
    startCountdown,
    setCountdownBeat,
    stopCountdown,
    playClick,
  ])

  // 取消倒数
  const cancelCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current)
      countdownTimerRef.current = undefined
    }
    stopCountdown()
  }, [stopCountdown])

  // 清理倒数计时器
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current)
      }
    }
  }, [])

  // 计算钢琴布局
  useEffect(() => {
    const updateLayout = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const layout = calculatePianoLayout(width)
        setPianoLayout(layout)
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

  // 自动启动 MIDI 输入监听
  useEffect(() => {
    startMidiListening()
    return () => {
      stopMidiListening()
    }
  }, [startMidiListening, stopMidiListening])

  // 自动加载默认 MIDI 文件
  useEffect(() => {
    loadDefaultMidi()
  }, [])

  // 更新活动按键 (瀑布流触发的)
  const updateActiveKeys = useCallback(
    (currentTime: number) => {
      if (!midiData) return

      // 找到当前应该播放的音符
      const playingNotes = midiData.notes.filter(
        (note) =>
          currentTime >= note.time && currentTime <= note.time + note.duration,
      )

      // 清除过期的瀑布流按键
      const currentActives = useWaterfallStore.getState().activeKeys
      const audioState = useWaterfallStore.getState().audio
      for (const [midi, activeKey] of currentActives) {
        if (activeKey.source === 'waterfall') {
          const stillPlaying = playingNotes.some((n) => n.midi === midi)
          if (!stillPlaying) {
            removeActiveKey(midi, 'waterfall')
            // 停止音频
            if (!audioState.isMuted) {
              stopNote(midi)
            }
          }
        }
      }

      // 添加新的瀑布流按键
      for (const note of playingNotes) {
        const existing = useWaterfallStore.getState().activeKeys.get(note.midi)
        if (!existing || existing.source !== 'waterfall') {
          addActiveKey({
            midi: note.midi,
            velocity: note.velocity,
            source: 'waterfall',
            color: note.color,
          })
          // 播放音频
          if (!audioState.isMuted) {
            playNote(note.midi, note.velocity)
          }
        }
      }
    },
    [midiData, addActiveKey, removeActiveKey, playNote, stopNote],
  )

  // 播放动画循环
  useEffect(() => {
    if (!playback.isPlaying || !midiData) {
      lastTimeRef.current = 0
      // 暂停时停止所有音符
      stopAllNotes()
      return
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp
      }

      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      // 使用 store 获取最新状态，避免闭包问题
      const { playback: currentPlayback } = useWaterfallStore.getState()
      // 计算基于 BPM 的播放速率
      const playbackRate =
        currentPlayback.bpm / Math.max(1, currentPlayback.originalBpm)
      const newTime = currentPlayback.currentTime + deltaTime * playbackRate

      // 检查是否播放结束
      if (newTime >= midiData.duration) {
        pause()
        setCurrentTime(midiData.duration)
        clearActiveKeys()
      } else {
        setCurrentTime(newTime)
        updateActiveKeys(newTime)
      }

      if (useWaterfallStore.getState().playback.isPlaying) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      lastTimeRef.current = 0
    }
  }, [
    playback.isPlaying,
    midiData,
    pause,
    setCurrentTime,
    clearActiveKeys,
    updateActiveKeys,
    stopAllNotes,
  ])

  // 节拍器效果
  useEffect(() => {
    // 清理函数
    const cleanup = () => {
      if (metronomeTimerRef.current) {
        clearInterval(metronomeTimerRef.current)
        metronomeTimerRef.current = undefined
      }
    }

    // 如果未启用节拍器或未在播放，清理并退出
    if (!metronome.enabled || !playback.isPlaying) {
      cleanup()
      lastBeatTimeRef.current = 0
      return cleanup
    }

    // 计算每拍间隔（毫秒）
    const beatInterval = (60 / playback.bpm) * 1000

    // 立即播放第一拍
    playClick(true)
    lastBeatTimeRef.current = Date.now()

    // 设置定时器
    let beatCount = 1
    metronomeTimerRef.current = window.setInterval(() => {
      // 每 4 拍重音
      const isAccent = beatCount % 4 === 0
      playClick(isAccent)
      beatCount++
    }, beatInterval)

    return cleanup
  }, [metronome.enabled, playback.isPlaying, playback.bpm, playClick])

  // 处理停止
  const handleStop = useCallback(() => {
    cancelCountdown()
    pause()
    seek(0)
    clearActiveKeys()
  }, [cancelCountdown, pause, seek, clearActiveKeys])

  // 计算瀑布流高度 (时间窗口对应的像素高度)
  const waterfallHeight = timeWindow * PIXELS_PER_SECOND

  // 计算全屏状态
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
    containerRef,
    pianoLayout,
    midiData,
    playback,
    activeKeys,
    countdown,
    metronome,
    timeWindow,
    lookAheadTime,
    canvasSize,
    isLoading,
    error: error || midiInputError,
    showHelp,
    handleFileSelect,
    handleStop,
    toggleHelp,
    loadDefaultMidi,
    play: playWithCountdown,
    pause,
    seek,
    setBpm,
    waterfallHeight,
    isMuted: audio.isMuted,
    midiVolume: audio.volume,
    metronomeVolume,
    toggleMute,
    setMidiVolume: setVolume,
    setMetronomeVolume: setMetronomeVolumeStore,
    toggleCountdown,
    toggleMetronome,
    isFullscreen,
    toggleFullscreen,
  }
}
