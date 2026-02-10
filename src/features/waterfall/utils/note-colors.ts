// 霓虹色配置 - 按音轨区分
export const TRACK_COLORS = [
  '#FF006E', // 亮粉
  '#FB5607', // 橙色
  '#FFBE0B', // 黄色
  '#8338EC', // 紫色
  '#3A86FF', // 蓝色
  '#06FFA5', // 青色
  '#FF5733', // 珊瑚红
  '#C70039', // 深红
  '#900C3F', // 酒红
  '#581845', // 深紫
] as const

// 获取音轨颜色
export function getTrackColor(trackIndex: number): string {
  return TRACK_COLORS[trackIndex % TRACK_COLORS.length]
}

// 按键高亮颜色
export const KEY_HIGHLIGHT_COLORS = {
  waterfall: 'rgba(255, 255, 255, 0.9)',
  input: 'rgba(6, 255, 165, 0.9)', // 青色高亮
}

// 发光效果颜色
export function getGlowColor(baseColor: string): string {
  return baseColor.replace(')', ', 0.6)').replace('rgb', 'rgba')
}
