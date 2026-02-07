// 高频播放状态 - 不触发 React 更新
// 使用可变对象 + 订阅模式，适用于 Canvas 渲染等高频场景

import type { ActiveKey } from '../types'

interface PlaybackSnapshot {
  currentTime: number
  activeKeys: ReadonlyMap<number, ActiveKey>
  isPlaying: boolean
  bpm: number
}

type StateListener = () => void

/**
 * 高频播放状态管理器
 *
 * 与 Zustand store 的区别：
 * - 不触发 React 重渲染
 * - 使用可变对象，直接修改属性
 * - Canvas 等高频场景直接读取，无需订阅 React 状态
 */
class PlaybackState {
  // 可变状态（直接修改，不触发更新）
  currentTime = 0
  isPlaying = false
  bpm = 120
  originalBpm = 120

  // 活动按键状态
  private activeKeys = new Map<number, ActiveKey>()

  // 订阅监听器（用于 Canvas 等需要知道何时重绘的场景）
  private listeners = new Set<StateListener>()

  // 批量更新标志（避免频繁的监听器触发）
  private updateScheduled = false

  /** 获取活动按键的快照（只读） */
  getActiveKeys(): ReadonlyMap<number, ActiveKey> {
    return this.activeKeys
  }

  /** 检查某个 MIDI 键是否处于活动状态 */
  isKeyActive(midi: number): boolean {
    return this.activeKeys.has(midi)
  }

  /** 添加活动按键 */
  addActiveKey(key: ActiveKey): void {
    this.activeKeys.set(key.midi, key)
    this.notifyUpdate()
  }

  /** 移除活动按键 */
  removeActiveKey(midi: number, source?: 'waterfall' | 'input'): void {
    if (!source) {
      // 不指定来源，直接删除
      this.activeKeys.delete(midi)
    } else {
      // 只删除指定来源的按键
      const existing = this.activeKeys.get(midi)
      if (existing && existing.source === source) {
        this.activeKeys.delete(midi)
      }
    }
    this.notifyUpdate()
  }

  /** 清除所有活动按键 */
  clearActiveKeys(): void {
    this.activeKeys.clear()
    this.notifyUpdate()
  }

  /** 更新当前时间 */
  setCurrentTime(time: number): void {
    this.currentTime = Math.max(0, time)
    this.notifyUpdate()
  }

  /** 设置播放状态 */
  setPlaying(playing: boolean): void {
    this.isPlaying = playing
    this.notifyUpdate()
  }

  /** 设置 BPM */
  setBpm(bpm: number): void {
    this.bpm = Math.max(40, Math.min(240, bpm))
    // BPM 变化不需要立即重绘，不触发 notify
  }

  /** 设置原始 BPM */
  setOriginalBpm(bpm: number): void {
    this.originalBpm = bpm
  }

  /** 获取当前状态的快照 */
  getSnapshot(): PlaybackSnapshot {
    return {
      currentTime: this.currentTime,
      activeKeys: new Map(this.activeKeys),
      isPlaying: this.isPlaying,
      bpm: this.bpm,
    }
  }

  /** 订阅状态变化（用于 Canvas 等需要知道何时重绘的场景） */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /** 通知所有监听器状态已更新（批量处理） */
  private notifyUpdate(): void {
    if (this.updateScheduled) return

    this.updateScheduled = true

    // 使用微任务批量处理更新
    queueMicrotask(() => {
      this.updateScheduled = false
      for (const listener of this.listeners) {
        listener()
      }
    })
  }
}

// 导出单例实例
export const playbackState = new PlaybackState()

// 类型导出
export type { PlaybackSnapshot, StateListener }
