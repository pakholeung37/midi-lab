// 瀑布流颜色主题配置
// 每个主题的颜色都经过精心挑选，确保相邻音轨有足够的对比度

export interface WaterfallTheme {
  id: string
  name: string
  colors: readonly string[]
}

// 霓虹主题（默认）- 高对比度霓虹色，相邻色差明显
const neonTheme: WaterfallTheme = {
  id: 'neon',
  name: '霓虹',
  colors: [
    '#FF0055', // 品红
    '#00FF88', // 青绿
    '#FFAA00', // 橙黄
    '#00AAFF', // 天蓝
    '#FF00FF', // 洋红
    '#00FFCC', // 青
    '#FF6600', // 橙
    '#AA00FF', // 紫
    '#FFFF00', // 黄
    '#00FF00', // 绿
  ],
}

// 海洋主题 - 蓝绿色系，冷暖交替
const oceanTheme: WaterfallTheme = {
  id: 'ocean',
  name: '海洋',
  colors: [
    '#00E5FF', // 亮青
    '#2962FF', // 靛蓝
    '#00BFA5', // 青绿
    '#304FFE', // 深靛蓝
    '#18FFFF', // 浅青
    '#0091EA', // 蓝
    '#1DE9B6', // 薄荷
    '#448AFF', // 蓝紫
    '#00B8D4', // 青
    '#536DFE', // 靛蓝紫
  ],
}

// 森林主题 - 绿色系，明暗交替
const forestTheme: WaterfallTheme = {
  id: 'forest',
  name: '森林',
  colors: [
    '#00E676', // 亮绿
    '#AEEA00', // 柠檬黄
    '#00C853', // 翠绿
    '#76FF03', // 黄绿
    '#1DE9B6', // 薄荷
    '#64DD17', // 草绿
    '#00BFA5', // 青绿
    '#B2FF59', // 亮黄绿
    '#69F0AE', // 浅绿
    '#CCFF90', // 淡绿黄
  ],
}

// 火焰主题 - 红橙黄，温度渐变交替
const fireTheme: WaterfallTheme = {
  id: 'fire',
  name: '火焰',
  colors: [
    '#FF1744', // 红
    '#FFEA00', // 黄
    '#FF6D00', // 橙
    '#FFAB00', // 琥珀
    '#FF3D00', // 红橙
    '#FFD600', // 亮黄
    '#DD2C00', // 深红
    '#FFC400', // 金黄
    '#FF5722', // 深橙
    '#FFFF00', // 纯黄
  ],
}

// 紫霞主题 - 紫粉色系，饱和度交替
const purpleTheme: WaterfallTheme = {
  id: 'purple',
  name: '紫霞',
  colors: [
    '#D500F9', // 亮紫
    '#FF4081', // 粉红
    '#7C4DFF', // 蓝紫
    '#F50057', // 玫红
    '#AA00FF', // 紫
    '#FF80AB', // 浅粉
    '#651FFF', // 深紫
    '#E040FB', // 浅紫
    '#536DFE', // 蓝紫
    '#FF1744', // 红
  ],
}

// 糖果主题 - 高饱和多彩，最大对比
const candyTheme: WaterfallTheme = {
  id: 'candy',
  name: '糖果',
  colors: [
    '#FF1493', // 深粉
    '#00FF7F', // 春绿
    '#FF4500', // 橙红
    '#00CED1', // 暗青
    '#FFD700', // 金
    '#9400D3', // 暗紫
    '#00FF00', // 绿
    '#FF69B4', // 热粉
    '#1E90FF', // 道奇蓝
    '#FF6347', // 番茄红
  ],
}

// 极光主题 - 梦幻渐变色
const auroraTheme: WaterfallTheme = {
  id: 'aurora',
  name: '极光',
  colors: [
    '#00FF87', // 春绿
    '#FF00E4', // 洋红
    '#00E5FF', // 青
    '#FF6B00', // 橙
    '#B700FF', // 紫
    '#00FFD1', // 青绿
    '#FF0066', // 品红
    '#00AAFF', // 天蓝
    '#AAFF00', // 黄绿
    '#FF00AA', // 玫红
  ],
}

// 彩虹主题 - 完整光谱，最大区分
const rainbowTheme: WaterfallTheme = {
  id: 'rainbow',
  name: '彩虹',
  colors: [
    '#FF0000', // 红
    '#00FF00', // 绿
    '#0066FF', // 蓝
    '#FFFF00', // 黄
    '#FF00FF', // 洋红
    '#00FFFF', // 青
    '#FF6600', // 橙
    '#9900FF', // 紫
    '#00FF66', // 青绿
    '#FF0099', // 品红
  ],
}

export const THEMES: WaterfallTheme[] = [
  neonTheme,
  oceanTheme,
  forestTheme,
  fireTheme,
  purpleTheme,
  candyTheme,
  auroraTheme,
  rainbowTheme,
]

export const DEFAULT_THEME_ID = 'neon'

export function getThemeById(id: string): WaterfallTheme {
  return THEMES.find((t) => t.id === id) ?? neonTheme
}

export function getThemeColor(
  theme: WaterfallTheme,
  trackIndex: number,
): string {
  return theme.colors[trackIndex % theme.colors.length]
}
