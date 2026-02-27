import { useCallback, useRef, useEffect } from 'react'
import { SplendidGrandPiano } from 'smplr'

type PianoStopFn = (time?: number) => void

interface AudioContextRef {
  ctx: AudioContext | null
  piano: SplendidGrandPiano | null
  pianoLoadPromise: Promise<void> | null
  pianoReady: boolean
  pianoNotes: Map<number, PianoStopFn>
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

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function toPianoVolume(volume: number): number {
  return Math.round(clamp(volume, 0, 1) * 127)
}

function toPianoVelocity(velocity: number): number {
  const normalized = clamp(velocity || 0.7, 0, 1)
  return Math.max(1, Math.round(normalized * 127))
}

export function useAudio(): UseAudioReturn {
  const audioRef = useRef<AudioContextRef>({
    ctx: null,
    piano: null,
    pianoLoadPromise: null,
    pianoReady: false,
    pianoNotes: new Map(),
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

  const initPiano = useCallback(() => {
    const ctx = ensureContext()
    if (!ctx) return
    if (audioRef.current.piano || audioRef.current.pianoLoadPromise) return

    try {
      const piano = new SplendidGrandPiano(ctx, {
        volume: toPianoVolume(midiVolumeRef.current),
      })
      audioRef.current.piano = piano
      audioRef.current.pianoLoadPromise = piano.load
        .then(() => {
          audioRef.current.pianoReady = true
          piano.output.setVolume(toPianoVolume(midiVolumeRef.current))
        })
        .catch((err) => {
          console.error(
            'Failed to load smplr piano, fallback to oscillator:',
            err,
          )
          audioRef.current.piano = null
          audioRef.current.pianoReady = false
        })
        .finally(() => {
          audioRef.current.pianoLoadPromise = null
        })
    } catch (err) {
      console.error(
        'Failed to initialize smplr piano, fallback to oscillator:',
        err,
      )
      audioRef.current.piano = null
      audioRef.current.pianoReady = false
    }
  }, [ensureContext])

  const playFallbackNote = useCallback(
    (ctx: AudioContext, midi: number, velocity: number) => {
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
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      const gain = ctx.createGain()
      const normalizedVelocity =
        clamp(velocity || 0.7, 0, 1) * clamp(midiVolumeRef.current, 0, 1)

      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(
        normalizedVelocity * 0.8,
        ctx.currentTime + 0.02,
      )
      gain.gain.exponentialRampToValueAtTime(
        normalizedVelocity * 0.6,
        ctx.currentTime + 0.1,
      )

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()

      audioRef.current.oscillators.set(midi, osc)
      audioRef.current.gainNodes.set(midi, gain)
    },
    [],
  )

  const playNote = useCallback(
    (midi: number, velocity: number) => {
      const ctx = ensureContext()
      if (!ctx) return

      // 优先使用 smplr 采样钢琴
      initPiano()
      const piano = audioRef.current.piano
      if (piano && audioRef.current.pianoReady) {
        const existingStop = audioRef.current.pianoNotes.get(midi)
        if (existingStop) {
          existingStop(ctx.currentTime)
        }
        const stop = piano.start({
          note: midi,
          velocity: toPianoVelocity(velocity),
        })
        audioRef.current.pianoNotes.set(midi, stop)
        return
      }

      // 回退到振荡器音源
      playFallbackNote(ctx, midi, velocity)
    },
    [ensureContext, initPiano, playFallbackNote],
  )

  const stopFallbackNote = useCallback((midi: number) => {
    const ctx = audioRef.current.ctx
    if (!ctx) return

    const osc = audioRef.current.oscillators.get(midi)
    const gain = audioRef.current.gainNodes.get(midi)
    if (!osc || !gain) return

    const currentGain = gain.gain.value
    gain.gain.cancelScheduledValues(ctx.currentTime)
    gain.gain.setValueAtTime(currentGain, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)

    setTimeout(() => {
      try {
        osc.stop()
      } catch {
        // ignore
      }
    }, 160)

    audioRef.current.oscillators.delete(midi)
    audioRef.current.gainNodes.delete(midi)
  }, [])

  const stopNote = useCallback(
    (midi: number) => {
      const ctx = audioRef.current.ctx
      if (!ctx) return

      const stop = audioRef.current.pianoNotes.get(midi)
      if (stop) {
        try {
          stop(ctx.currentTime)
        } catch {
          // ignore
        }
        audioRef.current.pianoNotes.delete(midi)
      }

      stopFallbackNote(midi)
    },
    [stopFallbackNote],
  )

  const setMidiVolume = useCallback((volume: number) => {
    const normalized = clamp(volume, 0, 1)
    midiVolumeRef.current = normalized
    if (audioRef.current.piano) {
      audioRef.current.piano.output.setVolume(toPianoVolume(normalized))
    }
  }, [])

  const setMetronomeVolume = useCallback((volume: number) => {
    metronomeVolumeRef.current = Math.max(0, Math.min(1, volume))
  }, [])

  const stopAllNotes = useCallback(() => {
    const ctx = audioRef.current.ctx
    if (!ctx) return

    if (audioRef.current.piano) {
      try {
        audioRef.current.piano.stop()
      } catch {
        // ignore
      }
      audioRef.current.pianoNotes.clear()
    }

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
        if (audioRef.current.piano) {
          try {
            audioRef.current.piano.stop()
            audioRef.current.piano.disconnect()
          } catch {
            // ignore
          }
          audioRef.current.piano = null
          audioRef.current.pianoReady = false
          audioRef.current.pianoLoadPromise = null
          audioRef.current.pianoNotes.clear()
        }

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
