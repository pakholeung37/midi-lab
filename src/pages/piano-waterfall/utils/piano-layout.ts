// 88键钢琴布局计算
// 钢琴 MIDI 范围: 21 (A0) - 108 (C8)

export const PIANO_CONFIG = {
  FIRST_KEY: 21, // A0
  LAST_KEY: 108, // C8
  TOTAL_KEYS: 88,
  WHITE_KEY_WIDTH: 24, // 基准白键宽度
  WHITE_KEY_HEIGHT: 120, // 白键高度
  BLACK_KEY_WIDTH: 14, // 黑键宽度
  BLACK_KEY_HEIGHT: 75, // 黑键高度
  MARGIN_BOTTOM: 0, // 底部边距
} as const

// 黑键在八度中的位置 (0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B)
const BLACK_KEYS_IN_OCTAVE = [1, 3, 6, 8, 10]

// 判断是否为黑键
export function isBlackKey(midi: number): boolean {
  const noteInOctave = midi % 12
  return BLACK_KEYS_IN_OCTAVE.includes(noteInOctave)
}

// 获取白键索引 (0-based, 只计算白键)
export function getWhiteKeyIndex(midi: number): number {
  let whiteCount = 0
  for (let i = PIANO_CONFIG.FIRST_KEY; i < midi; i++) {
    if (!isBlackKey(i)) {
      whiteCount++
    }
  }
  if (!isBlackKey(midi)) {
    return whiteCount
  }
  return -1 // 黑键返回 -1
}

// 钢琴键布局信息
export interface PianoKeyLayout {
  midi: number
  x: number // 相对于钢琴左侧的 X 坐标
  width: number
  height: number
  isBlack: boolean
  noteName: string
  whiteKeyIndex?: number // 白键在 88 键中的索引
}

// 音符名称
const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

export function getNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1
  const noteIndex = midi % 12
  return `${NOTE_NAMES[noteIndex]}${octave}`
}

// 计算所有钢琴键的布局
interface PianoLayoutOptions {
  horizontalScale?: number
}

export function calculatePianoLayout(
  totalWidth: number,
  options?: PianoLayoutOptions,
): {
  keys: PianoKeyLayout[]
  scale: number
  totalWhiteKeys: number
} {
  // 首先计算白键数量
  let whiteKeyCount = 0
  for (
    let midi = PIANO_CONFIG.FIRST_KEY;
    midi <= PIANO_CONFIG.LAST_KEY;
    midi++
  ) {
    if (!isBlackKey(midi)) {
      whiteKeyCount++
    }
  }

  // 根据可用宽度计算缩放比例
  const baseWhiteWidth = PIANO_CONFIG.WHITE_KEY_WIDTH
  const requiredWidth = whiteKeyCount * baseWhiteWidth
  const fitScale = totalWidth / requiredWidth
  const horizontalScale = Math.max(0.2, Math.min(3, options?.horizontalScale ?? 1))
  const scale = fitScale * horizontalScale

  const whiteKeyWidth = baseWhiteWidth * scale
  const blackKeyWidth = PIANO_CONFIG.BLACK_KEY_WIDTH * scale
  const whiteKeyHeight = PIANO_CONFIG.WHITE_KEY_HEIGHT * fitScale
  const blackKeyHeight = PIANO_CONFIG.BLACK_KEY_HEIGHT * fitScale

  const keys: PianoKeyLayout[] = []
  let currentX = 0

  for (
    let midi = PIANO_CONFIG.FIRST_KEY;
    midi <= PIANO_CONFIG.LAST_KEY;
    midi++
  ) {
    const isBlack = isBlackKey(midi)

    if (isBlack) {
      // 黑键位置在白键之间
      keys.push({
        midi,
        x: currentX - blackKeyWidth / 2,
        width: blackKeyWidth,
        height: blackKeyHeight,
        isBlack: true,
        noteName: getNoteName(midi),
      })
    } else {
      // 白键
      keys.push({
        midi,
        x: currentX,
        width: whiteKeyWidth,
        height: whiteKeyHeight,
        isBlack: false,
        noteName: getNoteName(midi),
        whiteKeyIndex: keys.filter((k) => !k.isBlack).length,
      })
      currentX += whiteKeyWidth
    }
  }

  return { keys, scale, totalWhiteKeys: whiteKeyCount }
}

// 查找指定 MIDI 对应的键布局
export function findKeyLayout(
  keys: PianoKeyLayout[],
  midi: number,
): PianoKeyLayout | undefined {
  return keys.find((k) => k.midi === midi)
}
