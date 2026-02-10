// 统一动画循环管理器 - 单例模式
// 替代原本分散在三个组件中的独立 rAF 循环

type FrameCallback = (timestamp: number, deltaTime: number) => void

interface AnimationLoop {
  /** 订阅帧更新，返回取消订阅函数 */
  subscribe: (callback: FrameCallback, priority?: number) => () => void
  /** 启动循环 */
  start: () => void
  /** 停止循环 */
  stop: () => void
  /** 是否正在运行 */
  isRunning: () => boolean
}

// 优先级常量 - 数字越小优先级越高
export const PRIORITY = {
  /** 播放时间更新 - 最先执行 */
  PLAYBACK: 0,
  /** 音频事件处理 */
  AUDIO: 10,
  /** Canvas 渲染 - 最后执行 */
  RENDER: 20,
} as const

class AnimationLoopImpl implements AnimationLoop {
  private callbacks: Map<FrameCallback, number> = new Map()
  private sortedCallbacks: FrameCallback[] = []
  private frameId: number | null = null
  private lastTime = 0
  private running = false

  subscribe(callback: FrameCallback, priority = 100): () => void {
    this.callbacks.set(callback, priority)
    this.rebuildSortedList()

    // 如果循环未启动，自动启动
    if (!this.running) {
      this.start()
    }

    return () => {
      this.callbacks.delete(callback)
      this.rebuildSortedList()

      // 如果没有订阅者，自动停止
      if (this.callbacks.size === 0) {
        this.stop()
      }
    }
  }

  private rebuildSortedList() {
    this.sortedCallbacks = [...this.callbacks.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([cb]) => cb)
  }

  start() {
    if (this.running) return
    this.running = true
    this.lastTime = performance.now()
    this.tick(this.lastTime)
  }

  stop() {
    this.running = false
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }

  private tick = (timestamp: number) => {
    if (!this.running) return

    const deltaTime = (timestamp - this.lastTime) / 1000
    this.lastTime = timestamp

    // 按优先级顺序执行回调
    for (const callback of this.sortedCallbacks) {
      callback(timestamp, deltaTime)
    }

    this.frameId = requestAnimationFrame(this.tick)
  }

  isRunning() {
    return this.running
  }
}

// 导出单例实例
export const animationLoop: AnimationLoop = new AnimationLoopImpl()
