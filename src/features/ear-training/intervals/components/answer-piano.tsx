import { useEffect, useMemo, useRef } from 'react'
import {
  calculatePianoLayout,
  getNoteName,
} from '../../../../pages/piano-waterfall/utils/piano-layout'

const FULL_KEYBOARD_WIDTH = 1248

interface AnswerPianoProps {
  rootMidi: number
  selectedMidi: number | null
  expectedMidi: number | null
  disabled: boolean
  onAnswer: (midi: number) => void
}

function isCNote(midi: number): boolean {
  return midi % 12 === 0
}

export function AnswerPiano({
  rootMidi,
  selectedMidi,
  expectedMidi,
  disabled,
  onAnswer,
}: AnswerPianoProps) {
  const layout = useMemo(() => calculatePianoLayout(FULL_KEYBOARD_WIDTH), [])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const maxKeyHeight = useMemo(() => {
    let maxHeight = 0
    for (const key of layout.keys) {
      if (key.height > maxHeight) {
        maxHeight = key.height
      }
    }
    return maxHeight
  }, [layout.keys])

  const whiteKeys = layout.keys.filter((key) => !key.isBlack)
  const blackKeys = layout.keys.filter((key) => key.isBlack)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const rootKey = layout.keys.find((key) => key.midi === rootMidi)
    if (!rootKey) return

    const desiredLeft =
      rootKey.x + rootKey.width / 2 - container.clientWidth / 2
    const maxScrollLeft = Math.max(
      0,
      container.scrollWidth - container.clientWidth,
    )
    const nextScrollLeft = Math.max(0, Math.min(desiredLeft, maxScrollLeft))

    container.scrollTo({
      left: nextScrollLeft,
      behavior: 'smooth',
    })
  }, [layout.keys, rootMidi])

  return (
    <section className="px-4 py-2">
      <div ref={scrollContainerRef} className="overflow-x-auto pb-2">
        <div
          className="relative mx-auto rounded-xl border border-slate-700 bg-slate-900"
          style={{
            width: FULL_KEYBOARD_WIDTH,
            height: maxKeyHeight + 24,
          }}
        >
          {whiteKeys.map((key) => {
            const isRoot = key.midi === rootMidi
            const isSelected = selectedMidi === key.midi
            const isExpected = expectedMidi === key.midi
            const isWrongSelection =
              isSelected && expectedMidi !== null && !isExpected

            return (
              <button
                key={key.midi}
                type="button"
                disabled={disabled}
                onClick={() => onAnswer(key.midi)}
                className="absolute top-0 border border-slate-700 text-[10px] text-slate-500 transition"
                style={{
                  left: key.x,
                  width: key.width,
                  height: key.height,
                  backgroundColor: isExpected
                    ? '#06b6d4'
                    : isWrongSelection
                      ? '#fb7185'
                      : isSelected
                        ? '#67e8f9'
                        : isRoot
                          ? '#4ade80'
                          : '#f8fafc',
                }}
                title={getNoteName(key.midi)}
              >
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2">
                  {isCNote(key.midi)
                    ? getNoteName(key.midi).replace('#', '')
                    : ''}
                </span>
                {isRoot && (
                  <span className="absolute bottom-0 left-1/2 h-0 w-0 -translate-x-1/2 translate-y-[12px] border-x-[8px] border-t-[12px] border-x-transparent border-t-emerald-400" />
                )}
              </button>
            )
          })}

          {blackKeys.map((key) => {
            const isRoot = key.midi === rootMidi
            const isSelected = selectedMidi === key.midi
            const isExpected = expectedMidi === key.midi
            const isWrongSelection =
              isSelected && expectedMidi !== null && !isExpected

            return (
              <button
                key={key.midi}
                type="button"
                disabled={disabled}
                onClick={() => onAnswer(key.midi)}
                className="absolute top-0 z-10 rounded-b-sm border border-slate-900"
                style={{
                  left: key.x,
                  width: key.width,
                  height: key.height,
                  backgroundColor: isExpected
                    ? '#0891b2'
                    : isWrongSelection
                      ? '#e11d48'
                      : isSelected
                        ? '#22d3ee'
                        : isRoot
                          ? '#15803d'
                          : '#0f172a',
                }}
                title={getNoteName(key.midi)}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
