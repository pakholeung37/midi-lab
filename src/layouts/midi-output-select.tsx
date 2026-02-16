import { useEffect, useState } from 'react'
import { useMidi } from '../core/midi'

export function MIDIOutputSelect() {
  const { midiOutputs, setMidiOutputs, selectedOutput, setSelectedOutput } =
    useMidi()
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    const requestMIDIAccess = navigator.requestMIDIAccess?.bind(navigator)
    if (!requestMIDIAccess) {
      setIsSupported(false)
      setMidiOutputs([])
      setSelectedOutput('')
      return
    }

    let mounted = true
    let midiAccess: MIDIAccess | null = null

    requestMIDIAccess({ sysex: false })
      .then((access) => {
        if (!mounted) return
        midiAccess = access

        const syncOutputs = () => {
          const outputs = Array.from(access.outputs.values())
          setMidiOutputs(outputs)

          // Keep selection in sync with device list.
          const currentSelected = useMidi.getState().selectedOutput
          if (
            !currentSelected ||
            !outputs.some((o) => o.id === currentSelected.id)
          ) {
            setSelectedOutput(outputs[0]?.id ?? '')
          }
        }

        syncOutputs()
        access.onstatechange = syncOutputs
      })
      .catch((err) => {
        console.error('Failed to get MIDI access:', err)
        if (!mounted) return
        setMidiOutputs([])
        setSelectedOutput('')
      })

    return () => {
      mounted = false
      if (midiAccess) {
        midiAccess.onstatechange = null
      }
    }
  }, [setMidiOutputs, setSelectedOutput])

  const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOutput(e.target.value)
  }

  return (
    <select
      className="border rounded p-2 text-xs"
      value={selectedOutput?.id ?? ''}
      onChange={handleOutputChange}
      disabled={!isSupported}
    >
      {!isSupported ? (
        <option value="">Web MIDI not supported</option>
      ) : midiOutputs.length === 0 ? (
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
