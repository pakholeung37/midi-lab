// 乐理工具：调性相关计算

// 音名到半音数的映射（C = 0）
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
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
}

// 大调音阶的半音间隔模式（从主音开始）
// 全全半全全全半 = 0, 2, 4, 5, 7, 9, 11
const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11]

// 自然小调音阶的半音间隔模式
// 全半全全半全全 = 0, 2, 3, 5, 7, 8, 10
const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10]

/**
 * 获取调式的调内音（pitch class set）
 * @param key 调名，如 "C", "G", "Bb", "F#"
 * @param scale "major" 或 "minor"
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
 * @param scale "major" 或 "minor"
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
