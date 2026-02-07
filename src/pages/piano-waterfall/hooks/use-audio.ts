import { useCallback, useRef, useEffect } from 'react'

interface AudioContextRef {
  ctx: AudioContext | null
  oscillators: Map<number, OscillatorNode>
  gainNodes: Map<number, GainNode>
}

export interface UseAudioReturn {
  playNote: (midi: number, velocity: number) => void
  stopNote: (midi: number) => void
  stopAllNotes: () => void
  playClick: (isAccent?: boolean) => void
  setMidiVolume: (volume: number) => void
  setMetronomeVolume: (volume: number) => void
}

const MIDI_TO_FREQ: number[] = []
for (let i = 0; i < 128; i++) {
  MIDI_TO_FREQ[i] = 440 * 2 ** ((i - 69) / 12)
}

export function useAudio(): UseAudioReturn {
  const audioRef = useRef<AudioContextRef>({
    ctx: null,
    oscillators: new Map(),
    gainNodes: new Map(),
  })
  const midiVolumeRef = useRef<number>(0.5)
  const metronomeVolumeRef = useRef<number>(0.5)

  // 初始化音频上下文（用户交互后）
  const ensureContext = useCallback(() => {
    if (!audioRef.current.ctx) {
      audioRef.current.ctx = new (
        window.AudioContext ||
        // @ts-ignore
        window.webkitAudioContext
      )()
    }
    if (audioRef.current.ctx.state === 'suspended') {
      audioRef.current.ctx.resume()
    }
    return audioRef.current.ctx
  }, [])

  const playNote = useCallback(
    (midi: number, velocity: number) => {
      const ctx = ensureContext()
      if (!ctx) return

      // 停止相同音符（避免重叠）
      const existingOsc = audioRef.current.oscillators.get(midi)
      if (existingOsc) {
        try {
          existingOsc.stop()
        } catch {
          // ignore
        }
        audioRef.current.oscillators.delete(midi)
        audioRef.current.gainNodes.delete(midi)
      }

      const freq = MIDI_TO_FREQ[midi] || 440

      // 创建振荡器
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // 创建增益节点（包络）
      const gain = ctx.createGain()
      const normalizedVelocity = (velocity || 0.7) * midiVolumeRef.current

      // ADSR 包络
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(
        normalizedVelocity * 0.8,
        ctx.currentTime + 0.02,
      ) // Attack
      gain.gain.exponentialRampToValueAtTime(
        normalizedVelocity * 0.6,
        ctx.currentTime + 0.1,
      ) // Decay

      // 连接
      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()

      // 保存引用
      audioRef.current.oscillators.set(midi, osc)
      audioRef.current.gainNodes.set(midi, gain)
    },
    [ensureContext],
  )

  const stopNote = useCallback((midi: number) => {
    const ctx = audioRef.current.ctx
    if (!ctx) return

    const osc = audioRef.current.oscillators.get(midi)
    const gain = audioRef.current.gainNodes.get(midi)

    if (osc && gain) {
      // Release 阶段
      const currentGain = gain.gain.value
      gain.gain.cancelScheduledValues(ctx.currentTime)
      gain.gain.setValueAtTime(currentGain, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

      // 停止振荡器
      setTimeout(() => {
        try {
          osc.stop()
        } catch {
          // ignore
        }
      }, 160)

      audioRef.current.oscillators.delete(midi)
      audioRef.current.gainNodes.delete(midi)
    }
  }, [])

  const setMidiVolume = useCallback((volume: number) => {
    midiVolumeRef.current = Math.max(0, Math.min(1, volume))
  }, [])

  const setMetronomeVolume = useCallback((volume: number) => {
    metronomeVolumeRef.current = Math.max(0, Math.min(1, volume))
  }, [])

  const stopAllNotes = useCallback(() => {
    const ctx = audioRef.current.ctx
    if (!ctx) return

    for (const [midi, osc] of audioRef.current.oscillators) {
      const gain = audioRef.current.gainNodes.get(midi)
      if (gain) {
        const currentGain = gain.gain.value
        gain.gain.cancelScheduledValues(ctx.currentTime)
        gain.gain.setValueAtTime(currentGain, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
      }
      setTimeout(() => {
        try {
          osc.stop()
        } catch {
          // ignore
        }
      }, 60)
    }
    audioRef.current.oscillators.clear()
    audioRef.current.gainNodes.clear()
  }, [])

  // 播放节拍器点击音
  const playClick = useCallback(
    (isAccent = false) => {
      const ctx = ensureContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // 重音用更高的频率
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, ctx.currentTime)
      osc.type = 'sine'

      const volume = metronomeVolumeRef.current * (isAccent ? 0.6 : 0.4)
      gain.gain.setValueAtTime(volume, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    },
    [ensureContext],
  )

  // 清理
  useEffect(() => {
    return () => {
      const ctx = audioRef.current.ctx
      if (ctx) {
        // 停止所有振荡器
        for (const [, osc] of audioRef.current.oscillators) {
          try {
            osc.stop()
          } catch {
            // ignore
          }
        }
        audioRef.current.oscillators.clear()
        audioRef.current.gainNodes.clear()
        ctx.close().catch(console.error)
      }
    }
  }, [])

  return {
    playNote,
    stopNote,
    stopAllNotes,
    playClick,
    setMidiVolume,
    setMetronomeVolume,
  }
}
