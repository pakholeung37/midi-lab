import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const defaultPoints = (
  width: number,
  height: number,
): [Point, Point, Point, Point] => [
  { x: 0, y: height },
  { x: width * 0.25, y: height * 0.75 },
  { x: width * 0.75, y: height * 0.25 },
  { x: width, y: 0 },
]

export interface CurveState {
  expressionPoints: [Point, Point, Point, Point]
  setExpressionPoints: (points: [Point, Point, Point, Point]) => void
  pitchBendPoints: [Point, Point, Point, Point]
  setPitchBendPoints: (points: [Point, Point, Point, Point]) => void
  modulationPoints: [Point, Point, Point, Point]
  setModulationPoints: (points: [Point, Point, Point, Point]) => void
}
export const useCurveStore = create<CurveState>()(
  persist(
    (set) => ({
      expressionPoints: defaultPoints(200, 200),
      setExpressionPoints: (points) => set({ expressionPoints: points }),
      pitchBendPoints: defaultPoints(200, 200),
      setPitchBendPoints: (points) => set({ pitchBendPoints: points }),
      modulationPoints: defaultPoints(200, 200),
      setModulationPoints: (points) => set({ modulationPoints: points }),
    }),
    {
      name: 'gamepad-curves',
    },
  ),
)

export interface Point {
  x: number
  y: number
}
export interface CurveState {
  expressionPoints: [Point, Point, Point, Point]
  setExpressionPoints: (points: [Point, Point, Point, Point]) => void
  pitchBendPoints: [Point, Point, Point, Point]
  setPitchBendPoints: (points: [Point, Point, Point, Point]) => void
  modulationPoints: [Point, Point, Point, Point]
  setModulationPoints: (points: [Point, Point, Point, Point]) => void
}
