// 音符时间索引 - 替代 O(n) 全量扫描
// 提供 O(1) ~ O(log n) 的音符查询性能

import type { WaterfallNote } from '../types'

interface NoteIndexOptions {
  /** 时间桶大小（秒），默认 0.5 */
  bucketSize: number
  /** 假设的最大音符持续时间（秒），用于二分查找回退，默认 10 */
  maxNoteDuration: number
}

export class NoteTimeIndex {
  private buckets: Map<number, WaterfallNote[]> = new Map()
  private bucketSize: number
  private sortedNotes: WaterfallNote[] = []
  private maxNoteDuration: number

  constructor(notes: WaterfallNote[], options: Partial<NoteIndexOptions> = {}) {
    this.bucketSize = options.bucketSize ?? 0.5
    this.maxNoteDuration = options.maxNoteDuration ?? 10
    this.buildIndex(notes)
  }

  private buildIndex(notes: WaterfallNote[]) {
    // 按开始时间排序（用于二分查找）
    this.sortedNotes = [...notes].sort((a, b) => a.time - b.time)

    // 构建时间桶（用于范围查询）
    for (const note of this.sortedNotes) {
      const startBucket = Math.floor(note.time / this.bucketSize)
      const endBucket = Math.floor(
        (note.time + note.duration) / this.bucketSize,
      )

      // 音符可能跨越多个桶，将其放入所有相关的桶中
      for (let bucket = startBucket; bucket <= endBucket; bucket++) {
        if (!this.buckets.has(bucket)) {
          this.buckets.set(bucket, [])
        }
        this.buckets.get(bucket)!.push(note)
      }
    }
  }

  /**
   * 获取指定时间范围内的所有音符
   * 时间复杂度：O(k)，k 为桶的数量
   */
  getNotesInRange(startTime: number, endTime: number): WaterfallNote[] {
    const startBucket = Math.floor(startTime / this.bucketSize)
    const endBucket = Math.floor(endTime / this.bucketSize)

    const result = new Set<WaterfallNote>()

    for (let bucket = startBucket; bucket <= endBucket; bucket++) {
      const bucketNotes = this.buckets.get(bucket)
      if (bucketNotes) {
        for (const note of bucketNotes) {
          // 精确过滤（桶只是粗略范围）
          if (note.time + note.duration >= startTime && note.time <= endTime) {
            result.add(note)
          }
        }
      }
    }

    return Array.from(result)
  }

  /**
   * 获取当前时间正在播放的所有音符
   * 时间复杂度：O(log n + k)，k 为同时播放的音符数
   */
  getNotesAtTime(currentTime: number): WaterfallNote[] {
    // 使用二分查找找到可能的起始位置
    const startIndex = this.binarySearchStart(currentTime)

    const result: WaterfallNote[] = []

    // 从搜索起点向后扫描
    for (let i = startIndex; i < this.sortedNotes.length; i++) {
      const note = this.sortedNotes[i]

      // 如果音符开始时间已经超过当前时间，后面的都不需要检查了
      if (note.time > currentTime) break

      // 检查是否正在播放（结束时间为右开区间，避免边界重叠）
      if (currentTime < note.time + note.duration) {
        result.push(note)
      }
    }

    return result
  }

  /**
   * 二分查找：找到第一个可能包含 currentTime 的音符索引
   * 需要考虑音符持续时间，所以要往前回退一定范围
   */
  private binarySearchStart(currentTime: number): number {
    let left = 0
    let right = this.sortedNotes.length - 1

    // 标准的二分查找，找到第一个 time + duration >= currentTime 的位置
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      const note = this.sortedNotes[mid]

      if (note.time + note.duration < currentTime) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    // 往前回退，确保不遗漏跨越当前时间的长音符
    // 假设没有超过 maxNoteDuration 的音符
    const lookBackLimit = currentTime - this.maxNoteDuration
    while (left > 0 && this.sortedNotes[left].time > lookBackLimit) {
      left--
    }

    return left
  }

  /** 获取按时间排序的所有音符（用于调试或导出） */
  getSortedNotes(): readonly WaterfallNote[] {
    return this.sortedNotes
  }
}
