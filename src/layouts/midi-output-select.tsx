import { useEffect } from 'react'
import { useMidi } from '../core/midi'

export function MIDIOutputSelect() {
  const { midiOutputs, setMidiOutputs, selectedOutput, setSelectedOutput } =
    useMidi()

  console.log('midiOutput', midiOutputs)
  console.log('selectedOutput', selectedOutput)
  useEffect(() => {
    // Request MIDI access
    navigator.requestMIDIAccess().then(
      (midiAccess) => {
        // Get all MIDI outputs
        const outputs = Array.from(midiAccess.outputs.values())
        setMidiOutputs(outputs)

        // Set first output as default if available
        if (outputs.length > 0) {
          setSelectedOutput(outputs[0].id)
        }

        // Listen for state changes
        midiAccess.onstatechange = () => {
          const outputs = Array.from(midiAccess.outputs.values())
          setMidiOutputs(outputs)
        }
      },
      (err) => console.error('Failed to get MIDI access:', err),
    )
  }, [setMidiOutputs, setSelectedOutput])

  const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutput(e.target.value)
  }

  return (
    <select
      className="border rounded p-2 text-xs"
      value={selectedOutput?.id}
      onChange={handleOutputChange}
    >
      {midiOutputs.length === 0 ? (
        <option value="">No MIDI outputs</option>
      ) : (
        <>
          <option value="">Select MIDI output</option>
          {midiOutputs.map((output) => (
            <option key={output.id} value={output.id}>
              {output.name}
            </option>
          ))}
        </>
      )}
    </select>
  )
}
