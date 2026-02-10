import type { ActiveKey } from './types'

// 乐器键位布局
export interface InstrumentKey {
  midi: number
  x: number
  width: number
  height: number
  isBlack?: boolean
  noteName?: string
}

// 乐器布局 - 不同乐器实现此接口
export interface InstrumentLayout {
  // 所有键位
  keys: InstrumentKey[]
  // 乐器面板高度（键盘、鼓垫等）
  instrumentHeight: number
  // 总宽度
  totalWidth: number

  // 绘制乐器面板
  drawInstrument: (
    ctx: CanvasRenderingContext2D,
    activeKeys: ReadonlyMap<number, ActiveKey>,
    width: number,
    height: number,
  ) => void

  // 绘制参考线（如八度线）
  drawReferenceLines?: (
    ctx: CanvasRenderingContext2D,
    waterfallHeight: number,
    width: number,
  ) => void
}

// 乐器布局计算函数签名
export type CalculateLayout = (width: number) => InstrumentLayout
