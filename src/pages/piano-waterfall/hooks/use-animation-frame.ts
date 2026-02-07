// 动画帧订阅 Hook
// 用于组件订阅统一的动画循环

import { useEffect, useRef } from 'react'
import { animationLoop, PRIORITY } from '../core/animation-loop'

export { PRIORITY }

/**
 * 订阅动画帧
 * @param callback 每帧调用的回调函数
 * @param enabled 是否启用
 * @param priority 优先级（数字越小优先级越高）
 */
export function useAnimationFrame(
  callback: (timestamp: number, deltaTime: number) => void,
  enabled: boolean,
  priority: number = PRIORITY.RENDER,
): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    const unsubscribe = animationLoop.subscribe(
      (timestamp, deltaTime) => callbackRef.current(timestamp, deltaTime),
      priority,
    )

    return unsubscribe
  }, [enabled, priority])
}

/**
 * 订阅播放更新（高优先级）
 */
export function usePlaybackFrame(
  callback: (timestamp: number, deltaTime: number) => void,
  enabled: boolean,
): void {
  useAnimationFrame(callback, enabled, PRIORITY.PLAYBACK)
}

/**
 * 订阅音频处理（中优先级）
 */
export function useAudioFrame(
  callback: (timestamp: number, deltaTime: number) => void,
  enabled: boolean,
): void {
  useAnimationFrame(callback, enabled, PRIORITY.AUDIO)
}

/**
 * 订阅渲染更新（低优先级）
 */
export function useRenderFrame(
  callback: (timestamp: number, deltaTime: number) => void,
  enabled: boolean,
): void {
  useAnimationFrame(callback, enabled, PRIORITY.RENDER)
}
