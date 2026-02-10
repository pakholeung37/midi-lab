import { useState, useEffect } from 'react'
import { playbackState } from '../core/playback-state'
import { recognizeChord, type ChordResult } from '../utils/chord-recognition'

export function useChordRecognition(): {
  chord: ChordResult | null
  activeNotes: number[]
} {
  const [chord, setChord] = useState<ChordResult | null>(null)
  const [activeNotes, setActiveNotes] = useState<number[]>([])

  useEffect(() => {
    let prevNotesKey = ''

    const updateChord = () => {
      const inputKeys = playbackState.getInputKeys()
      const notes = Array.from(inputKeys.keys())

      // 使用字符串比较避免重复计算
      const notesKey = notes.sort((a, b) => a - b).join(',')
      if (notesKey === prevNotesKey) return
      prevNotesKey = notesKey

      setActiveNotes(notes)

      if (notes.length < 2) {
        setChord(null)
        return
      }

      const result = recognizeChord(notes)
      setChord(result)
    }

    // 初始化
    updateChord()

    // 订阅状态变化
    const unsubscribe = playbackState.subscribe(updateChord)
    return unsubscribe
  }, [])

  return { chord, activeNotes }
}
