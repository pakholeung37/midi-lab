import { useCallback, useEffect, useRef, useState } from 'react'

interface Point {
  x: number
  y: number
}

interface CurveEditorProps {
  width?: number
  height?: number
  value?: [Point, Point, Point, Point]
  onChange?: (points: [Point, Point, Point, Point]) => void
  defaultValue?: (x: number) => number
}

export function CurveEditor({
  width = 200,
  height = 200,
  value: initialValue,
  onChange,
}: CurveEditorProps) {
  const [value, setValue] = useState<[Point, Point, Point, Point]>(
    initialValue ?? [
      { x: 0, y: height }, // 起点
      { x: width * 0.25, y: height * 0.75 }, // 控制点1
      { x: width * 0.75, y: height * 0.25 }, // 控制点2
      { x: width, y: 0 }, // 终点
    ],
  )
  const [activePoint, setActivePoint] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const handleMouseDown = (index: number) => () => {
    setActivePoint(index)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (activePoint === null || !svgRef.current) return

      const rect = svgRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(width, e.clientX - rect.left))
      const y = Math.max(0, Math.min(height, e.clientY - rect.top))

      // 只允许移动控制点（索引1和2）
      if (activePoint === 1 || activePoint === 2) {
        setValue((prev) => {
          const newValue = [...prev] as [Point, Point, Point, Point]
          newValue[activePoint] = { x, y }
          return newValue
        })
      }
    },
    [activePoint, width, height],
  )

  const handleMouseUp = useCallback(() => {
    if (activePoint !== null && onChange) {
      onChange(value)
    }
    setActivePoint(null)
  }, [activePoint, onChange, value])

  const handleReset = useCallback(() => {
    const defaultValue: [Point, Point, Point, Point] = [
      { x: 0, y: height },
      { x: width * 0.25, y: height * 0.75 },
      { x: width * 0.75, y: height * 0.25 },
      { x: width, y: 0 },
    ]
    setValue(defaultValue)
    if (onChange) {
      onChange(defaultValue)
    }
  }, [width, height, onChange])

  useEffect(() => {
    if (activePoint !== null) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [activePoint, handleMouseMove, handleMouseUp])

  // 生成贝塞尔曲线路径
  const path = `M ${value[0].x},${value[0].y} C ${value[1].x},${value[1].y} ${value[2].x},${value[2].y} ${value[3].x},${value[3].y}`

  return (
    <div className="flex flex-col items-center space-y-4">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border rounded bg-white"
        style={{ touchAction: 'none' }}
      >
        {/* 网格线 */}
        <g className="text-gray-200">
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <line
                x1={0}
                y1={(i * height) / 10}
                x2={width}
                y2={(i * height) / 10}
                stroke="currentColor"
                strokeWidth="0.5"
              />
              <line
                x1={(i * width) / 10}
                y1={0}
                x2={(i * width) / 10}
                y2={height}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </g>
          ))}
        </g>

        {/* 贝塞尔曲线 */}
        <path d={path} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2" />

        {/* 控制线 */}
        <line
          x1={value[0].x}
          y1={value[0].y}
          x2={value[1].x}
          y2={value[1].y}
          stroke="rgb(209, 213, 219)"
          strokeWidth="1"
          strokeDasharray="4"
        />
        <line
          x1={value[2].x}
          y1={value[2].y}
          x2={value[3].x}
          y2={value[3].y}
          stroke="rgb(209, 213, 219)"
          strokeWidth="1"
          strokeDasharray="4"
        />

        {/* 控制点 */}
        {value.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={
              index === 0 || index === 3
                ? 'rgb(239, 68, 68)'
                : 'rgb(59, 130, 246)'
            }
            cursor={index === 1 || index === 2 ? 'move' : 'default'}
            onMouseDown={handleMouseDown(index)}
          />
        ))}
      </svg>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleReset}
          className="px-2 py-1 text-sm text-white bg-gray-500 rounded hover:bg-gray-600"
        >
          Reset
        </button>
        <div className="text-sm text-gray-500">
          Drag blue points to adjust curve
        </div>
      </div>
    </div>
  )
}

// 计算映射值的函数
export const calcBezier = (
  x: number,
  height: number,
  value: [Point, Point, Point, Point],
): number => {
  // 使用贝塞尔曲线公式计算映射值
  const t = x
  const p0 = value[0]
  const p1 = value[1]
  const p2 = value[2]
  const p3 = value[3]

  const y =
    Math.pow(1 - t, 3) * p0.y +
    3 * Math.pow(1 - t, 2) * t * p1.y +
    3 * (1 - t) * Math.pow(t, 2) * p2.y +
    Math.pow(t, 3) * p3.y

  return 1 - y / height
}
