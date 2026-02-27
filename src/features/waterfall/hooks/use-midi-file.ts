import { useCallback, useState } from 'react'
import * as ToneMidi from '@tonejs/midi'
import type {
  MidiFileData,
  TrackInfo,
  WaterfallNote,
  TimeSignature,
  KeySignature,
} from '../types'
import { NoteTimeIndex } from '../core/note-index'
import { getThemeById, getThemeColor } from '../utils/themes'
import { mapVelocityNonLinear } from '../utils/velocity-visual'

export interface UseMidiFileReturn {
  midiData: MidiFileData | null
  isLoading: boolean
  error: string | null
  parseMidiFile: (file: File, themeId?: string) => Promise<void>
  recolorNotes: (themeId: string) => void
  clearMidiData: () => void
}

export function useMidiFile(): UseMidiFileReturn {
  const [midiData, setMidiData] = useState<MidiFileData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parseMidiFile = useCallback(async (file: File, themeId = 'neon') => {
    setIsLoading(true)
    setError(null)

    try {
      // 读取文件为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      // 解析 MIDI 文件
      const midi = new ToneMidi.Midi(arrayBuffer)

      // 获取主题
      const theme = getThemeById(themeId)

      // 转换为瀑布流音符
      const notes: WaterfallNote[] = []
      const tracks: TrackInfo[] = []

      midi.tracks.forEach((track, trackIndex) => {
        const trackColor = getThemeColor(theme, trackIndex)
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
              visualVelocity: mapVelocityNonLinear(note.velocity),
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

      // 提取拍号
      const timeSignatures: TimeSignature[] =
        midi.header.timeSignatures?.map((ts) => ({
          time: midi.header.ticksToSeconds(ts.ticks),
          numerator: ts.timeSignature[0],
          denominator: ts.timeSignature[1],
          measures: ts.measures,
        })) ?? []

      // 如果没有拍号，默认 4/4
      if (timeSignatures.length === 0) {
        timeSignatures.push({
          time: 0,
          numerator: 4,
          denominator: 4,
        })
      }

      // 提取调号
      const keySignatures: KeySignature[] =
        midi.header.keySignatures?.map((ks) => ({
          time: midi.header.ticksToSeconds(ks.ticks),
          key: ks.key,
          scale: ks.scale as 'major' | 'minor',
        })) ?? []

      // 构建音符时间索引
      const noteIndex = new NoteTimeIndex(notes)

      setMidiData({
        notes,
        tracks,
        duration,
        name: file.name.replace(/\.midi?$/i, ''),
        originalBpm,
        timeSignatures,
        keySignatures,
        noteIndex,
      })
    } catch (err) {
      console.error('Failed to parse MIDI file:', err)
      setError(err instanceof Error ? err.message : 'Failed to parse MIDI file')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 重新着色音符（主题变化时调用）
  const recolorNotes = useCallback(
    (themeId: string) => {
      if (!midiData) return

      const theme = getThemeById(themeId)
      const newNotes = midiData.notes.map((note) => ({
        ...note,
        color: getThemeColor(theme, note.trackIndex),
      }))
      const newTracks = midiData.tracks.map((track) => ({
        ...track,
        color: getThemeColor(theme, track.index),
      }))

      // 重建索引
      const noteIndex = new NoteTimeIndex(newNotes)

      setMidiData({
        ...midiData,
        notes: newNotes,
        tracks: newTracks,
        noteIndex,
      })
    },
    [midiData],
  )

  const clearMidiData = useCallback(() => {
    setMidiData(null)
    setError(null)
  }, [])

  return {
    midiData,
    isLoading,
    error,
    parseMidiFile,
    recolorNotes,
    clearMidiData,
  }
}
