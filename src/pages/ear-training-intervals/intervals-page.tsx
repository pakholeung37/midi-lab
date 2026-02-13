import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_QUESTION_COUNT } from '../../features/ear-training/intervals/constants'
import { useIntervalAudio } from '../../features/ear-training/intervals/audio'
import { useIntervalSession } from '../../features/ear-training/intervals/use-interval-session'
import { useWebMidiNoteInput } from '../../features/ear-training/intervals/webmidi-input'
import { formatPercent } from '../../features/ear-training/intervals/utils'
import { AnswerPiano } from '../../features/ear-training/intervals/components/answer-piano'
import { PresetList } from '../../features/ear-training/intervals/components/preset-list'
import { QuizHeader } from '../../features/ear-training/intervals/components/quiz-header'
import { ResultFeedback } from '../../features/ear-training/intervals/components/result-feedback'
import { SessionControls } from '../../features/ear-training/intervals/components/session-controls'
import { StaffPrompt } from '../../features/ear-training/intervals/components/staff-prompt'
import type { IntervalPresetId } from '../../features/ear-training/intervals/types'

export function IntervalsEarTrainingPage() {
  const {
    session,
    statsState,
    startSession,
    submitAnswer,
    nextQuestion,
    finishToList,
    restartCompletedSession,
    successRate,
  } = useIntervalSession(DEFAULT_QUESTION_COUNT)
  const { isPlaying, playQuestion, stop } = useIntervalAudio()

  const [midiError, setMidiError] = useState<string | null>(null)
  const lastAutoPlayedQuestionIdRef = useRef<string | null>(null)

  const activeQuestion = useMemo(() => {
    if (session.phase !== 'active') return null
    return session.currentQuestion
  }, [session])

  const answerLocked = session.phase === 'active' && Boolean(session.lastResult)

  const handleStartSession = useCallback(
    (presetId: IntervalPresetId) => {
      setMidiError(null)
      startSession(presetId)
    },
    [startSession],
  )

  const handleAnswer = useCallback(
    (midi: number) => {
      if (session.phase !== 'active' || session.lastResult) {
        return
      }
      // Pressing the first note should not be treated as a wrong answer.
      if (midi === session.currentQuestion.rootMidi) {
        return
      }
      submitAnswer(midi)
    },
    [session, submitAnswer],
  )

  const handleReplay = useCallback(() => {
    if (!activeQuestion) return
    void playQuestion(activeQuestion)
  }, [activeQuestion, playQuestion])

  const handleMidiAnswer = useCallback(
    (rawMidi: number) => {
      handleAnswer(rawMidi)
    },
    [handleAnswer],
  )

  useWebMidiNoteInput({
    enabled: session.phase === 'active' && !session.lastResult,
    onNote: handleMidiAnswer,
    onError: setMidiError,
  })

  useEffect(() => {
    if (!activeQuestion) {
      lastAutoPlayedQuestionIdRef.current = null
      stop()
      return
    }

    if (lastAutoPlayedQuestionIdRef.current === activeQuestion.id) {
      return
    }
    lastAutoPlayedQuestionIdRef.current = activeQuestion.id

    void playQuestion(activeQuestion)
  }, [activeQuestion, playQuestion, stop])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      if (session.phase !== 'active') {
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        handleReplay()
        return
      }

      if (event.code === 'Enter' && session.lastResult) {
        event.preventDefault()
        nextQuestion()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleReplay, nextQuestion, session])

  if (session.phase === 'idle') {
    return (
      <main className="min-h-screen bg-slate-950">
        <PresetList
          questionCount={DEFAULT_QUESTION_COUNT}
          statsByPreset={statsState.presets}
          onStart={handleStartSession}
        />
      </main>
    )
  }

  if (session.phase === 'completed') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <section className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900/70 p-6 text-center text-slate-100">
          <h1 className="text-2xl font-semibold">Session complete</h1>
          <p className="mt-2 text-slate-400">{session.preset.title}</p>
          <p className="mt-4 text-4xl font-semibold text-cyan-300">
            {formatPercent(successRate)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {session.correctCount}/{session.questionCount} correct
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={restartCompletedSession}
              className="rounded-lg border border-cyan-700 bg-cyan-600/20 px-4 py-2 text-sm text-cyan-200 transition hover:bg-cyan-600/30"
            >
              Practice again
            </button>
            <button
              type="button"
              onClick={finishToList}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              Back to presets
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-slate-100">
      <QuizHeader
        questionNumber={session.questionIndex + 1}
        questionCount={session.questionCount}
        successRate={successRate}
        onFinish={finishToList}
      />

      <StaffPrompt
        rootMidi={session.currentQuestion.rootMidi}
        mode={session.currentQuestion.mode}
      />

      <AnswerPiano
        rootMidi={session.currentQuestion.rootMidi}
        selectedMidi={session.lastResult?.answerMidi ?? null}
        expectedMidi={session.lastResult?.expectedMidi ?? null}
        disabled={answerLocked}
        onAnswer={handleAnswer}
      />

      <ResultFeedback result={session.lastResult} />

      {midiError && (
        <p className="px-4 text-center text-xs text-amber-300">{midiError}</p>
      )}

      <SessionControls
        canNext={Boolean(session.lastResult)}
        isPlaying={isPlaying}
        onReplay={handleReplay}
        onNext={nextQuestion}
        onFinish={finishToList}
      />
    </main>
  )
}
