import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudio } from '../../waterfall/hooks/use-audio'
import type { IntervalQuestion } from './types'

export function useIntervalAudio(): {
  isPlaying: boolean
  playQuestion: (question: IntervalQuestion) => Promise<void>
  replayLastQuestion: () => Promise<void>
  stop: () => void
} {
  const { playNote, stopNote, stopAllNotes, setMidiVolume } = useAudio()

  const finishTimerRef = useRef<number | null>(null)
  const noteTimersRef = useRef<number[]>([])
  const lastQuestionRef = useRef<IntervalQuestion | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const clearTimers = useCallback(() => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current)
      finishTimerRef.current = null
    }

    for (const timerId of noteTimersRef.current) {
      window.clearTimeout(timerId)
    }
    noteTimersRef.current = []
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    stopAllNotes()
    setIsPlaying(false)
  }, [clearTimers, stopAllNotes])

  const scheduleTimeout = useCallback((fn: () => void, delayMs: number) => {
    const timerId = window.setTimeout(fn, delayMs)
    noteTimersRef.current.push(timerId)
  }, [])

  const playQuestion = useCallback(
    async (question: IntervalQuestion) => {
      stop()

      // Match waterfall loudness defaults.
      setMidiVolume(0.5)

      if (question.mode === 'harmonic') {
        playNote(question.rootMidi, 0.8)
        playNote(question.targetMidi, 0.8)

        scheduleTimeout(() => {
          stopNote(question.rootMidi)
          stopNote(question.targetMidi)
        }, 950)

        finishTimerRef.current = window.setTimeout(() => {
          setIsPlaying(false)
        }, 1100)
      } else {
        const secondDelay = 650
        const noteDuration = 450

        playNote(question.rootMidi, 0.78)
        scheduleTimeout(() => stopNote(question.rootMidi), noteDuration)

        scheduleTimeout(() => {
          playNote(question.targetMidi, 0.85)
        }, secondDelay)
        scheduleTimeout(
          () => stopNote(question.targetMidi),
          secondDelay + noteDuration,
        )

        finishTimerRef.current = window.setTimeout(() => {
          setIsPlaying(false)
        }, 1300)
      }

      lastQuestionRef.current = question
      setIsPlaying(true)
    },
    [playNote, scheduleTimeout, setMidiVolume, stop, stopNote],
  )

  const replayLastQuestion = useCallback(async () => {
    const lastQuestion = lastQuestionRef.current
    if (!lastQuestion) return
    await playQuestion(lastQuestion)
  }, [playQuestion])

  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  return {
    isPlaying,
    playQuestion,
    replayLastQuestion,
    stop,
  }
}
