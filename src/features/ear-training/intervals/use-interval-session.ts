import { useCallback, useMemo, useState } from 'react'
import { DEFAULT_QUESTION_COUNT, getPresetById } from './constants'
import { generateIntervalQuestion } from './generator'
import { scoreIntervalAnswer } from './scoring'
import { loadIntervalsState, recordPresetAttempt } from './storage'
import type {
  IntervalAttemptResult,
  IntervalPreset,
  IntervalPresetId,
  IntervalQuestion,
  IntervalsPersistenceState,
} from './types'

type IdleSession = {
  phase: 'idle'
}

type ActiveSession = {
  phase: 'active'
  preset: IntervalPreset
  questionCount: number
  questionIndex: number
  currentQuestion: IntervalQuestion
  correctCount: number
  lastResult: IntervalAttemptResult | null
}

type CompletedSession = {
  phase: 'completed'
  preset: IntervalPreset
  questionCount: number
  correctCount: number
}

export type IntervalSessionState =
  | IdleSession
  | ActiveSession
  | CompletedSession

function createQuestion(preset: IntervalPreset): IntervalQuestion {
  return generateIntervalQuestion(preset)
}

export function useIntervalSession(questionCount = DEFAULT_QUESTION_COUNT): {
  session: IntervalSessionState
  statsState: IntervalsPersistenceState
  startSession: (presetId: IntervalPresetId) => void
  submitAnswer: (answerMidi: number) => void
  nextQuestion: () => void
  finishToList: () => void
  restartCompletedSession: () => void
  answeredCount: number
  successRate: number
} {
  const [session, setSession] = useState<IntervalSessionState>({
    phase: 'idle',
  })
  const [statsState, setStatsState] =
    useState<IntervalsPersistenceState>(loadIntervalsState)

  const startSession = useCallback(
    (presetId: IntervalPresetId) => {
      const preset = getPresetById(presetId)
      setSession({
        phase: 'active',
        preset,
        questionCount,
        questionIndex: 0,
        currentQuestion: createQuestion(preset),
        correctCount: 0,
        lastResult: null,
      })
    },
    [questionCount],
  )

  const submitAnswer = useCallback(
    (answerMidi: number) => {
      if (session.phase !== 'active' || session.lastResult) {
        return
      }

      const result = scoreIntervalAnswer(session.currentQuestion, answerMidi)
      const nextCorrectCount = session.correctCount + (result.isCorrect ? 1 : 0)

      setSession({
        ...session,
        correctCount: nextCorrectCount,
        lastResult: result,
      })

      const nextStatsState = recordPresetAttempt(
        session.preset.id,
        result.isCorrect,
        result.answeredAt,
      )
      setStatsState(nextStatsState)
    },
    [session],
  )

  const nextQuestion = useCallback(() => {
    if (session.phase !== 'active' || !session.lastResult) {
      return
    }

    if (session.questionIndex + 1 >= session.questionCount) {
      setSession({
        phase: 'completed',
        preset: session.preset,
        questionCount: session.questionCount,
        correctCount: session.correctCount,
      })
      return
    }

    setSession({
      ...session,
      questionIndex: session.questionIndex + 1,
      currentQuestion: createQuestion(session.preset),
      lastResult: null,
    })
  }, [session])

  const finishToList = useCallback(() => {
    setSession({ phase: 'idle' })
  }, [])

  const restartCompletedSession = useCallback(() => {
    if (session.phase !== 'completed') return
    startSession(session.preset.id)
  }, [session, startSession])

  const answeredCount = useMemo(() => {
    if (session.phase === 'active') {
      return session.questionIndex + (session.lastResult ? 1 : 0)
    }
    if (session.phase === 'completed') {
      return session.questionCount
    }
    return 0
  }, [session])

  const successRate = useMemo(() => {
    if (session.phase === 'active') {
      if (answeredCount === 0) return 0
      return session.correctCount / answeredCount
    }
    if (session.phase === 'completed') {
      return session.questionCount === 0
        ? 0
        : session.correctCount / session.questionCount
    }
    return 0
  }, [session, answeredCount])

  return {
    session,
    statsState,
    startSession,
    submitAnswer,
    nextQuestion,
    finishToList,
    restartCompletedSession,
    answeredCount,
    successRate,
  }
}
