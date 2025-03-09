import { useEffect, useState } from 'react'
import { useMidi } from '../../core/midi'

export function GamepadController() {
  const [gamepads, setGamepads] = useState<(Gamepad | null)[]>([])
  const [selectedGamepad, setSelectedGamepad] = useState<number>(0)
  const selectedOutput = useMidi((s) => s.selectedOutput)

  useEffect(() => {
    const updateGamepads = () => {
      const gamepads = navigator.getGamepads()
      setGamepads(gamepads)
      // Send MIDI messages if output is selected and gamepad is connected
      if (selectedOutput && gamepads[selectedGamepad]) {
        const gamepad = gamepads[selectedGamepad]
        // Left joystick X axis (ranges from -1 to 1)
        // const xAxis = gamepad.axes[0]
        // Left joystick Y axis (ranges from -1 to 1)
        const yAxis = gamepad.axes[1]

        // Convert Y axis to CC11 (Expression) range 0-127
        const cc11Value = Math.round(((-yAxis + 1) / 2) * 127)
        selectedOutput.send([0xb0, 11, cc11Value])

        // Convert X axis to pitch bend range 0-16383 (14-bit)
        // const pitchBendValue = Math.round(((xAxis + 1) / 2) * 16383)
        // const msb = (pitchBendValue >> 7) & 0x7f // Most significant 7 bits
        // const lsb = pitchBendValue & 0x7f // Least significant 7 bits
        // selectedOutput.send([0xe0, lsb, msb])
        // Left trigger (ranges from -1 to 1)
        const leftTrigger = gamepad.buttons[6].value
        // Convert left trigger to CC1 (Modulation) range 0-127
        const cc1Value = Math.round(leftTrigger * 127)
        selectedOutput.send([0xb0, 1, cc1Value])
      }
    }

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
  }, [selectedGamepad, selectedOutput])

  const activeGamepad = gamepads[selectedGamepad]

  return (
    <div className="p-4">
      <div className="mb-8">
        <select
          aria-placeholder="Please select gamepad"
          className="border rounded p-2 w-full"
          value={selectedGamepad}
          onChange={(e) => setSelectedGamepad(Number(e.target.value))}
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

      {activeGamepad ? (
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
                      button.pressed ? 'bg-green-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {index}
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
              <div className="aspect-square relative bg-gray-100 rounded-full">
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
              <div className="aspect-square relative bg-gray-100 rounded-full">
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
      ) : (
        <div className="text-center text-gray-500 text-xl">
          No gamepad detected. Please connect a gamepad and press any button.
        </div>
      )}
    </div>
  )
}
