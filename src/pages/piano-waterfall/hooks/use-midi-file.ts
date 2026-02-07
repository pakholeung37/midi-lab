import { useCallback, useState } from 'react'
import * as ToneMidi from '@tonejs/midi'
import type { MidiFileData, TrackInfo, WaterfallNote } from '../types'
import { getTrackColor } from '../utils/note-colors'
import { NoteTimeIndex } from '../core/note-index'

export interface UseMidiFileReturn {
  midiData: MidiFileData | null
  isLoading: boolean
  error: string | null
  parseMidiFile: (file: File) => Promise<void>
  clearMidiData: () => void
}

export function useMidiFile(): UseMidiFileReturn {
  const [midiData, setMidiData] = useState<MidiFileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseMidiFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // 读取文件为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // 解析 MIDI 文件
      const midi = new ToneMidi.Midi(arrayBuffer)

      // 转换为瀑布流音符
      const notes: WaterfallNote[] = []
      const tracks: TrackInfo[] = []

      midi.tracks.forEach((track, trackIndex) => {
        const trackColor = getTrackColor(trackIndex)
        const trackNotes = track.notes

        if (trackNotes.length > 0) {
          // 添加音轨信息
          tracks.push({
            index: trackIndex,
            name: track.name || `Track ${trackIndex + 1}`,
            color: trackColor,
            noteCount: trackNotes.length,
          })

          // 添加音符
          trackNotes.forEach((note, noteIndex) => {
            notes.push({
              id: `${trackIndex}-${noteIndex}`,
              midi: note.midi,
              time: note.time,
              duration: note.duration,
              velocity: note.velocity,
              trackIndex,
              color: trackColor,
            })
          })
        }
      })

      // 按时间排序
      notes.sort((a, b) => a.time - b.time)

      // 计算总时长
      const duration =
        notes.length > 0
          ? Math.max(...notes.map((n) => n.time + n.duration))
          : 0

      // 提取原始 BPM (从第一个包含 tempo 事件的 track)
      let originalBpm = 120 // 默认 MIDI 标准速度
      const tempoEvent = midi.header.tempos?.[0]
      if (tempoEvent?.bpm) {
        originalBpm = Math.round(tempoEvent.bpm)
      }

      // 构建音符时间索引
      const noteIndex = new NoteTimeIndex(notes)

      setMidiData({
        notes,
        tracks,
        duration,
        name: file.name.replace(/\.midi?$/i, ''),
        originalBpm,
        noteIndex,
      })
    } catch (err) {
      console.error('Failed to parse MIDI file:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse MIDI file')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearMidiData = useCallback(() => {
    setMidiData(null)
    setError(null)
  }, [])

  return {
    midiData,
    isLoading,
    error,
    parseMidiFile,
    clearMidiData,
  }
}
