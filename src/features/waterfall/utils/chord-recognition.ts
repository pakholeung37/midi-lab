// 和弦识别算法

export interface ChordResult {
  root: string
  type: string
  bass?: string
  display: string
}

// 音名映射（使用常见用法选择升降号）
const NOTE_NAMES = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

// 和弦模板（按优先级排序：更复杂的和弦优先匹配）
const CHORD_TEMPLATES: [number[], string][] = [
  // 扩展和弦
  [[0, 4, 7, 9, 10], '13'],
  [[0, 2, 4, 7, 11], 'maj9'],
  [[0, 2, 3, 7, 10], 'm9'],
  [[0, 2, 4, 7, 10], '9'],
  // 六和弦
  [[0, 2, 4, 7, 9], '6/9'],
  [[0, 4, 7, 9], '6'],
  [[0, 3, 7, 9], 'm6'],
  // 加音和弦
  [[0, 2, 4, 7], 'add9'],
  [[0, 2, 3, 7], 'madd9'],
  // 变化和弦
  [[0, 3, 4, 7, 10], '7#9'],
  [[0, 1, 4, 7, 10], '7b9'],
  [[0, 4, 8, 10], '7#5'],
  [[0, 4, 6, 10], '7b5'],
  // 七和弦
  [[0, 4, 7, 11], 'maj7'],
  [[0, 3, 7, 10], 'm7'],
  [[0, 4, 7, 10], '7'],
  [[0, 3, 6, 9], 'dim7'],
  [[0, 3, 6, 10], 'm7b5'],
  [[0, 3, 7, 11], 'mMaj7'],
  [[0, 5, 7, 10], '7sus4'],
  // 挂留和弦
  [[0, 5, 7], 'sus4'],
  [[0, 2, 7], 'sus2'],
  // 三和弦
  [[0, 4, 7], ''],
  [[0, 3, 7], 'm'],
  [[0, 3, 6], 'dim'],
  [[0, 4, 8], 'aug'],
  // 强力和弦
  [[0, 7], '5'],
]

function getNoteName(pitchClass: number): string {
  return NOTE_NAMES[pitchClass % 12]
}

function getPitchClasses(midiNotes: number[]): number[] {
  const classes = new Set<number>()
  for (const note of midiNotes) {
    classes.add(note % 12)
  }
  return Array.from(classes).sort((a, b) => a - b)
}

function matchChord(
  pitchClasses: number[],
  root: number,
): [number[], string] | null {
  // 计算相对于根音的音程
  const intervals = new Set<number>()
  for (const pc of pitchClasses) {
    intervals.add((pc - root + 12) % 12)
  }

  // 遍历模板尝试匹配（完全包含模板音程）
  for (const [template, type] of CHORD_TEMPLATES) {
    if (template.every((interval) => intervals.has(interval))) {
      return [template, type]
    }
  }

  return null
}

export function recognizeChord(midiNotes: number[]): ChordResult | null {
  if (midiNotes.length < 2) return null

  const sortedNotes = [...midiNotes].sort((a, b) => a - b)
  const bassNote = sortedNotes[0]
  const bassPitchClass = bassNote % 12

  const pitchClasses = getPitchClasses(midiNotes)
  if (pitchClasses.length < 2) return null

  // 存储所有匹配结果
  const matches: { root: number; template: number[]; type: string }[] = []

  // 遍历每个 pitch class 作为潜在根音
  for (const root of pitchClasses) {
    const result = matchChord(pitchClasses, root)
    if (result) {
      matches.push({ root, template: result[0], type: result[1] })
    }
  }

  if (matches.length === 0) return null

  // 优先选择根音在 bass 位置的匹配（原位）
  let bestMatch = matches.find((m) => m.root === bassPitchClass)
  if (!bestMatch) {
    // 如果没有原位匹配，选择第一个（模板优先级最高的）
    bestMatch = matches[0]
  }

  const rootName = getNoteName(bestMatch.root)
  const isInversion = bestMatch.root !== bassPitchClass
  const bassName = isInversion ? getNoteName(bassPitchClass) : undefined

  // 构建显示字符串
  let display = rootName + bestMatch.type
  if (bassName) {
    display += `/${bassName}`
  }

  return {
    root: rootName,
    type: bestMatch.type,
    bass: bassName,
    display,
  }
}
