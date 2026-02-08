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

  // 分离的活动按键状态：瀑布流和输入独立管理
  // 这样音频逻辑不受影响，显示时 input 颜色优先
  private waterfallKeys = new Map<number, ActiveKey>()
  private inputKeys = new Map<number, ActiveKey>()

  // 合并后的缓存（避免每次调用都重新合并）
  private mergedKeys = new Map<number, ActiveKey>()
  private mergedKeysDirty = true

  // 订阅监听器（用于 Canvas 等需要知道何时重绘的场景）
  private listeners = new Set<StateListener>()

  // 批量更新标志（避免频繁的监听器触发）
  private updateScheduled = false

  /** 获取活动按键的快照（只读，input 颜色优先） */
  getActiveKeys(): ReadonlyMap<number, ActiveKey> {
    if (this.mergedKeysDirty) {
      this.mergedKeys.clear()
      // 先添加瀑布流按键
      for (const [midi, key] of this.waterfallKeys) {
        this.mergedKeys.set(midi, key)
      }
      // 再添加输入按键（覆盖瀑布流，实现颜色优先）
      for (const [midi, key] of this.inputKeys) {
        this.mergedKeys.set(midi, key)
      }
      this.mergedKeysDirty = false
    }
    return this.mergedKeys
  }

  /** 检查某个 MIDI 键是否处于活动状态 */
  isKeyActive(midi: number): boolean {
    return this.waterfallKeys.has(midi) || this.inputKeys.has(midi)
  }

  /** 检查瀑布流是否已添加某个键（用于音频控制） */
  hasWaterfallKey(midi: number): boolean {
    return this.waterfallKeys.has(midi)
  }

  /** 添加活动按键 */
  addActiveKey(key: ActiveKey): void {
    if (key.source === 'waterfall') {
      this.waterfallKeys.set(key.midi, key)
    } else {
      this.inputKeys.set(key.midi, key)
    }
    this.mergedKeysDirty = true
    this.notifyUpdate()
  }

  /** 移除活动按键 */
  removeActiveKey(midi: number, source?: 'waterfall' | 'input'): void {
    if (!source) {
      // 不指定来源，删除两边
      this.waterfallKeys.delete(midi)
      this.inputKeys.delete(midi)
    } else if (source === 'waterfall') {
      this.waterfallKeys.delete(midi)
    } else {
      this.inputKeys.delete(midi)
    }
    this.mergedKeysDirty = true
    this.notifyUpdate()
  }

  /** 清除所有活动按键 */
  clearActiveKeys(): void {
    this.waterfallKeys.clear()
    this.inputKeys.clear()
    this.mergedKeysDirty = true
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
    this.bpm = Math.max(0, Math.min(240, bpm))
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
      activeKeys: new Map(this.getActiveKeys()),
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
