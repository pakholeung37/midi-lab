// 乐理工具：调性相关计算
import type { InferredTonality, KeySignature, WaterfallNote } from '../types'

// 音名到半音数的映射（C = 0）
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'B#': 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  'E#': 5,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
  Cb: 11,
}

// ToneJS MIDI 解析遵循 MIDI key signature 规范：
// minor 模式下 key 字段是“同调号大调”而非小调主音。
// 例如 A minor 会被解析为 key = "C", scale = "minor"。
const RELATIVE_MAJOR_KEY_TO_MINOR_TONIC: Record<string, string> = {
  Cb: 'Ab',
  Gb: 'Eb',
  Db: 'Bb',
  Ab: 'F',
  Eb: 'C',
  Bb: 'G',
  F: 'D',
  C: 'A',
  G: 'E',
  D: 'B',
  A: 'F#',
  E: 'C#',
  B: 'G#',
  'F#': 'D#',
  'C#': 'A#',
}

export function normalizeToneJsKeySignature(
  key: string,
  scale: 'major' | 'minor',
): { key: string; scale: 'major' | 'minor' } {
  const normalizedKey = key.trim()
  if (scale === 'major') {
    return { key: normalizedKey, scale }
  }

  return {
    key: RELATIVE_MAJOR_KEY_TO_MINOR_TONIC[normalizedKey] ?? normalizedKey,
    scale,
  }
}

// 大调音阶的半音间隔模式（从主音开始）
// 全全半全全全半 = 0, 2, 4, 5, 7, 9, 11
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]

// 自然小调音阶的半音间隔模式
// 全半全全半全全 = 0, 2, 3, 5, 7, 8, 10
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]
const SEMITONE_TO_NOTE = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

interface TonalityCandidate {
  root: number
  scale: 'major' | 'minor'
  fit: number
  score: number
}

function scoreCandidate(
  root: number,
  scale: 'major' | 'minor',
  pitchClassWeights: number[],
  totalWeight: number,
  bassPitchClassWeights: number[],
  bassTotalWeight: number,
  tailPitchClassWeights: number[],
  tailTotalWeight: number,
): TonalityCandidate {
  const intervals =
    scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS
  const scalePitchClasses = intervals.map((interval) => (root + interval) % 12)
  const third = (root + (scale === 'major' ? 4 : 3)) % 12
  const fifth = (root + 7) % 12

  let inScaleWeight = 0
  for (const pitchClass of scalePitchClasses) {
    inScaleWeight += pitchClassWeights[pitchClass]
  }

  const fit = inScaleWeight / totalWeight
  const rootShare = pitchClassWeights[root] / totalWeight
  const triadShare =
    (pitchClassWeights[root] +
      pitchClassWeights[third] +
      pitchClassWeights[fifth]) /
    totalWeight
  const bassRootShare =
    bassTotalWeight > 0
      ? bassPitchClassWeights[root] / bassTotalWeight
      : rootShare
  const tailRootShare =
    tailTotalWeight > 0
      ? tailPitchClassWeights[root] / tailTotalWeight
      : rootShare

  // 综合调内覆盖、主音重心、低音重心与结尾落点。
  const score =
    fit * 0.55 +
    rootShare * 0.15 +
    triadShare * 0.08 +
    bassRootShare * 0.12 +
    tailRootShare * 0.1

  return { root, scale, fit, score }
}

/**
 * 根据音符分布推断整首曲子的主调（用于补充/纠正 MIDI header 的 key signature）
 */
export function inferTonality(notes: WaterfallNote[]): InferredTonality | null {
  if (notes.length === 0) return null

  let maxEndTime = 0
  for (const note of notes) {
    const end = note.time + note.duration
    if (end > maxEndTime) {
      maxEndTime = end
    }
  }

  const tailWindow = Math.max(4, maxEndTime * 0.08)
  const tailStartTime = Math.max(0, maxEndTime - tailWindow)

  const pitchClassWeights = Array<number>(12).fill(0)
  const bassPitchClassWeights = Array<number>(12).fill(0)
  const tailPitchClassWeights = Array<number>(12).fill(0)
  let totalWeight = 0
  let bassTotalWeight = 0
  let tailTotalWeight = 0

  for (const note of notes) {
    const pitchClass = ((note.midi % 12) + 12) % 12
    const duration = Math.max(0.05, note.duration)
    const velocity = clamp(note.velocity, 0, 1)
    const durationFactor = 0.75 + Math.min(0.85, duration * 0.45)
    const velocityFactor = 0.85 + velocity * 0.3
    const weight = duration * durationFactor * velocityFactor

    pitchClassWeights[pitchClass] += weight
    totalWeight += weight

    if (note.midi < 60) {
      bassPitchClassWeights[pitchClass] += weight
      bassTotalWeight += weight
    }

    const noteStart = note.time
    const noteEnd = note.time + note.duration
    const overlap = Math.min(noteEnd, maxEndTime) - Math.max(noteStart, tailStartTime)
    if (overlap > 0) {
      const tailWeight = overlap * durationFactor * velocityFactor
      tailPitchClassWeights[pitchClass] += tailWeight
      tailTotalWeight += tailWeight
    }
  }

  if (totalWeight <= 0) return null

  const candidates: TonalityCandidate[] = []
  for (let root = 0; root < 12; root++) {
    candidates.push(
      scoreCandidate(
        root,
        'major',
        pitchClassWeights,
        totalWeight,
        bassPitchClassWeights,
        bassTotalWeight,
        tailPitchClassWeights,
        tailTotalWeight,
      ),
    )
    candidates.push(
      scoreCandidate(
        root,
        'minor',
        pitchClassWeights,
        totalWeight,
        bassPitchClassWeights,
        bassTotalWeight,
        tailPitchClassWeights,
        tailTotalWeight,
      ),
    )
  }

  candidates.sort((a, b) => b.score - a.score || b.fit - a.fit)
  const best = candidates[0]
  if (!best) return null

  const second = candidates[1]
  const scoreGap = second ? Math.max(0, best.score - second.score) : best.score
  const fitGap = second ? Math.max(0, best.fit - second.fit) : best.fit
  const confidence = clamp(0.45 + scoreGap * 5 + fitGap * 2, 0, 0.99)

  return {
    key: SEMITONE_TO_NOTE[best.root],
    scale: best.scale,
    confidence,
  }
}

/**
 * 是否存在转调（调号发生变化）
 */
export function hasKeyModulation(keySignatures: KeySignature[]): boolean {
  if (keySignatures.length <= 1) return false

  const sorted = [...keySignatures].sort((a, b) => a.time - b.time)
  let prev = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]
    if (!current) continue
    if (current.key === prev?.key && current.scale === prev?.scale) {
      continue
    }
    return true
  }

  return false
}

/**
 * 获取调式的调内音（pitch class set）
 * @param key 调名，如 "C", "G", "Bb", "F#"
 * @param scale "major" or "minor"
 * @returns 调内音的 pitch class 集合（0-11）
 */
export function getScalePitchClasses(
  key: string,
  scale: 'major' | 'minor',
): Set<number> {
  const root = NOTE_TO_SEMITONE[key]
  if (root === undefined) {
    // 未知调名，返回空集合（所有音都不标记为调外音）
    return new Set()
  }

  const intervals =
    scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS

  const pitchClasses = new Set<number>()
  for (const interval of intervals) {
    pitchClasses.add((root + interval) % 12)
  }

  return pitchClasses
}

/**
 * 判断 MIDI 音符是否为调外音
 * @param midi MIDI 音高 (0-127)
 * @param scalePitchClasses 调内音的 pitch class 集合
 * @returns true 如果是调外音
 */
export function isOutOfKey(
  midi: number,
  scalePitchClasses: Set<number>,
): boolean {
  if (scalePitchClasses.size === 0) {
    // 没有调性信息，不标记任何音为调外音
    return false
  }
  const pitchClass = midi % 12
  return !scalePitchClasses.has(pitchClass)
}

/**
 * 格式化调号显示
 * @param key 调名
 * @param scale "major" or "minor"
 * @returns 格式化的调号字符串，如 "C Major", "A minor"
 */
export function formatKeySignature(
  key: string,
  scale: 'major' | 'minor',
): string {
  const scaleLabel = scale === 'major' ? 'Major' : 'minor'
  return `${key} ${scaleLabel}`
}

/**
 * 格式化拍号显示
 * @param numerator 分子
 * @param denominator 分母
 * @returns 格式化的拍号字符串，如 "4/4", "3/4"
 */
export function formatTimeSignature(
  numerator: number,
  denominator: number,
): string {
  return `${numerator}/${denominator}`
}
