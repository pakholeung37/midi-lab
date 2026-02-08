// 节拍网格计算工具

import type { TimeSignature } from '../types'

// 节拍信息
export interface BeatInfo {
  time: number // 节拍时间（秒）
  beat: number // 当前小节内的第几拍（1-based）
  measure: number // 第几小节（1-based）
  strength: 'strong' | 'medium' | 'weak' // 强弱
}

// 获取拍子的强弱
function getBeatStrength(
  beat: number,
  numerator: number,
  denominator: number,
): 'strong' | 'medium' | 'weak' {
  // 第一拍总是强拍
  if (beat === 1) return 'strong'

  // 根据拍号判断次强拍
  if (numerator === 4 && denominator === 4) {
    // 4/4: 第3拍是次强拍
    if (beat === 3) return 'medium'
  } else if (numerator === 6 && denominator === 8) {
    // 6/8: 第4拍是次强拍（复合拍子）
    if (beat === 4) return 'medium'
  } else if (numerator === 2 && denominator === 2) {
    // 2/2: 无次强拍
  } else if (numerator % 3 === 0 && denominator === 8) {
    // 复合拍子（如 9/8, 12/8）：每3拍一个强拍
    if ((beat - 1) % 3 === 0) return 'medium'
  }

  return 'weak'
}

/**
 * 计算指定时间范围内的所有节拍
 * @param startTime 开始时间（秒）
 * @param endTime 结束时间（秒）
 * @param bpm 当前 BPM
 * @param timeSignatures 拍号列表
 * @returns 节拍信息数组
 */
export function getBeatsInRange(
  startTime: number,
  endTime: number,
  bpm: number,
  timeSignatures: TimeSignature[],
): BeatInfo[] {
  if (timeSignatures.length === 0 || bpm <= 0) return []

  const beats: BeatInfo[] = []

  // 每拍的时长（秒）
  const beatDuration = 60 / bpm

  // 获取当前时间点的拍号
  const getTimeSignatureAt = (time: number): TimeSignature => {
    for (let i = timeSignatures.length - 1; i >= 0; i--) {
      if (timeSignatures[i].time <= time) {
        return timeSignatures[i]
      }
    }
    return timeSignatures[0]
  }

  // 从乐曲开始计算到 startTime 之前的小节和拍数
  // 简化处理：假设从 0 开始，拍号不变（后续可扩展支持拍号变化）
  const ts = getTimeSignatureAt(startTime)
  const beatsPerMeasure = ts.numerator

  // 每小节的时长
  const measureDuration = beatDuration * beatsPerMeasure

  // 找到 startTime 之前最近的小节开始时间
  const measureIndex = Math.floor(startTime / measureDuration)
  let currentMeasureStart = measureIndex * measureDuration
  let currentMeasure = measureIndex + 1

  // 从该小节开始，计算所有在范围内的节拍
  while (currentMeasureStart < endTime) {
    for (let beatIndex = 0; beatIndex < beatsPerMeasure; beatIndex++) {
      const beatTime = currentMeasureStart + beatIndex * beatDuration
      const beat = beatIndex + 1

      // 只添加在范围内的节拍
      if (beatTime >= startTime && beatTime <= endTime) {
        beats.push({
          time: beatTime,
          beat,
          measure: currentMeasure,
          strength: getBeatStrength(beat, ts.numerator, ts.denominator),
        })
      }
    }

    currentMeasureStart += measureDuration
    currentMeasure++
  }

  return beats
}
