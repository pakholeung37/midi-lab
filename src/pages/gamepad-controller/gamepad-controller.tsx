import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMidi } from '../../core/midi'
import { CurveEditor, calcBezier } from '../../components/curve-editor'
import { useCurveStore } from './use-curve-store'

export function GamepadController() {
  const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([])
  const [selectedGamepad, setSelectedGamepad] = useState<number>(0)
  const selectedOutput = useMidi((s) => s.selectedOutput)
  const [showTester, setShowTester] = useState(false)

  const {
    expressionPoints,
    pitchBendPoints,
    modulationPoints,
    setExpressionPoints,
    setPitchBendPoints,
    setModulationPoints,
  } = useCurveStore()

  const updateGamepads = useCallback(() => {
    const gamepads = navigator.getGamepads()
    setGamepads(gamepads)
    if (selectedOutput && gamepads[selectedGamepad]) {
      const gamepad = gamepads[selectedGamepad]

      // 左摇杆 Y 轴映射到表情控制器
      const leftYAxis = gamepad.axes[1]
      const normalizedLeftY = (-leftYAxis + 1) / 2
      const cc11Value = Math.round(
        calcBezier(normalizedLeftY, 200, expressionPoints) * 127,
      )
      selectedOutput.send([0xb0, 11, cc11Value])

      // 右摇杆 Y 轴映射到弯音轮
      const rightYAxis = gamepad.axes[3]
      const normalizedRightY = (rightYAxis + 1) / 2
      const pitchBendValue = Math.round(
        calcBezier(normalizedRightY, 200, pitchBendPoints) * 16383,
      )
      const msb = (pitchBendValue >> 7) & 0x7f
      const lsb = pitchBendValue & 0x7f
      selectedOutput.send([0xe0, lsb, msb])

      // 左扳机映射到调制轮
      const leftTrigger = gamepad.buttons[6].value
      const cc1Value = Math.round(
        calcBezier(leftTrigger, 200, modulationPoints) * 127,
      )
      selectedOutput.send([0xb0, 1, cc1Value])
    }
  }, [
    selectedGamepad,
    selectedOutput,
    expressionPoints,
    pitchBendPoints,
    modulationPoints,
  ])

  useEffect(() => {
    window.addEventListener('gamepadconnected', updateGamepads)
    window.addEventListener('gamepaddisconnected', updateGamepads)

    // Initial check
    updateGamepads()

    // Update gamepad state every frame
    let animationFrameId: number
    const updateState = () => {
      updateGamepads()
      animationFrameId = requestAnimationFrame(updateState)
    }
    animationFrameId = requestAnimationFrame(updateState)

    return () => {
      window.removeEventListener('gamepadconnected', updateGamepads)
      window.removeEventListener('gamepaddisconnected', updateGamepads)
      cancelAnimationFrame(animationFrameId)
    }
  }, [updateGamepads])

  const activeGamepad = gamepads[selectedGamepad]

  const handleGamepadSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedGamepad(Number(e.target.value))
    },
    [],
  )

  const toggleTester = useCallback(() => {
    setShowTester((prev) => !prev)
  }, [])

  const curveEditors = useMemo(
    () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="space-y-2">
          <h3 className="font-semibold">Expression Controller Mapping Curve</h3>
          <CurveEditor
            width={200}
            height={200}
            value={expressionPoints}
            onChange={setExpressionPoints}
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Pitch Bend Mapping Curve</h3>
          <CurveEditor
            width={200}
            height={200}
            value={pitchBendPoints}
            onChange={setPitchBendPoints}
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Modulation Wheel Mapping Curve</h3>
          <CurveEditor
            width={200}
            height={200}
            value={modulationPoints}
            onChange={setModulationPoints}
          />
        </div>
      </div>
    ),
    [
      expressionPoints,
      pitchBendPoints,
      modulationPoints,
      setExpressionPoints,
      setPitchBendPoints,
      setModulationPoints,
    ],
  )

  const renderGamepadTester = useMemo(() => {
    if (!activeGamepad || !showTester) return null

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          {/* Buttons */}
          <div className="border rounded p-4">
            <h2 className="text-xl font-bold mb-4">Buttons</h2>
            <div className="grid grid-cols-4 gap-4">
              {activeGamepad.buttons.map((button, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded text-center ${
                    button.value > 0 ? 'bg-green-500 text-white' : 'bg-gray-100'
                  }`}
                >
                  <div>{index}</div>
                  <div className="text-sm">
                    {Math.round(button.value * 127)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Axes */}
          <div className="border rounded p-4">
            <h2 className="text-xl font-bold mb-4">Axes</h2>
            <div className="space-y-4">
              {activeGamepad.axes.map((axis, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span>Axis {index}</span>
                    <span>{axis.toFixed(4)}</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${((axis + 1) / 2) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Sticks */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Sticks</h2>
          <div className="grid grid-cols-2 gap-8">
            {/* Left Stick */}
            <div className="aspect-square relative bg-gray-100 rounded-full w-32 h-32 mx-auto">
              <div
                className="absolute w-6 h-6 bg-blue-500 rounded-full"
                style={{
                  left: `${((activeGamepad.axes[0] + 1) / 2) * 100}%`,
                  top: `${((activeGamepad.axes[1] + 1) / 2) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
            {/* Right Stick */}
            <div className="aspect-square relative bg-gray-100 rounded-full w-32 h-32 mx-auto">
              <div
                className="absolute w-6 h-6 bg-blue-500 rounded-full"
                style={{
                  left: `${((activeGamepad.axes[2] + 1) / 2) * 100}%`,
                  top: `${((activeGamepad.axes[3] + 1) / 2) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          </div>
        </div>
        {/* Gamepad Info */}
        <div className="border rounded p-4">
          <h2 className="text-xl font-bold mb-4">Gamepad Info</h2>
          <div className="space-y-2">
            <p>
              <strong>ID:</strong> {activeGamepad.id}
            </p>
            <p>
              <strong>Index:</strong> {activeGamepad.index}
            </p>
            <p>
              <strong>Connected:</strong>{' '}
              {activeGamepad.connected ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Mapping:</strong> {activeGamepad.mapping}
            </p>
            <p>
              <strong>Timestamp:</strong> {activeGamepad.timestamp}
            </p>
          </div>
        </div>
      </div>
    )
  }, [activeGamepad, showTester])

  return (
    <div className="p-4">
      <div className="mb-8">
        <select
          aria-placeholder="Please select gamepad"
          className="border rounded p-2 w-full"
          value={selectedGamepad}
          onChange={handleGamepadSelect}
        >
          {gamepads.map(
            (gamepad, index) =>
              gamepad && (
                <option key={index} value={index}>
                  {gamepad.id}
                </option>
              ),
          )}
        </select>
      </div>

      {curveEditors}

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">How to Use</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold">Expression Control</h3>
            <p className="text-gray-600">
              Use Right Trigger (RT) to control expression
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Pitch Bend</h3>
            <p className="text-gray-600">
              Use Left Stick horizontal movement to control pitch bend
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Modulation</h3>
            <p className="text-gray-600">
              Use Left Trigger (LT) to control modulation wheel
            </p>
          </div>

          <div className="text-sm text-gray-500">
            * Each control can be customized using the curve editors above to
            adjust sensitivity and response
          </div>
        </div>
      </div>
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={toggleTester}
      >
        {showTester ? 'Hide Tester' : 'Show Tester'}
      </button>
      {renderGamepadTester}

      {!activeGamepad && (
        <div className="text-center text-gray-500 text-xl">
          No gamepad detected. Please connect a gamepad and press any button.
        </div>
      )}
    </div>
  )
}
