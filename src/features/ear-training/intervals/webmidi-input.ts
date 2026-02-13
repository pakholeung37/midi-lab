import { useEffect } from 'react'

interface UseWebMidiNoteInputOptions {
  enabled: boolean
  onNote: (midi: number) => void
  onError?: (message: string) => void
}

export function useWebMidiNoteInput({
  enabled,
  onNote,
  onError,
}: UseWebMidiNoteInputOptions): void {
  useEffect(() => {
    if (!enabled) return

    if (!navigator.requestMIDIAccess) {
      onError?.('Web MIDI API is not supported in this browser')
      return
    }

    let midiAccess: MIDIAccess | null = null
    const detachCallbacks: Array<() => void> = []

    const handleMessage = (event: MIDIMessageEvent) => {
      const data = event.data
      if (!data || data.length < 3) return

      const status = data[0]
      const note = data[1]
      const velocity = data[2]
      const command = status & 0xf0
      if (command !== 0x90 || velocity <= 0) {
        return
      }

      onNote(note)
    }

    const setupInputs = (access: MIDIAccess) => {
      for (const input of access.inputs.values()) {
        const listener = handleMessage as EventListener
        input.addEventListener('midimessage', listener)
        detachCallbacks.push(() => {
          input.removeEventListener('midimessage', listener)
        })
      }
    }

    const init = async () => {
      try {
        midiAccess = await navigator.requestMIDIAccess({ sysex: false })
        setupInputs(midiAccess)

        midiAccess.onstatechange = () => {
          while (detachCallbacks.length > 0) {
            detachCallbacks.pop()?.()
          }
          setupInputs(midiAccess as MIDIAccess)
        }
      } catch (err) {
        onError?.(
          err instanceof Error ? err.message : 'Failed to start Web MIDI input',
        )
      }
    }

    void init()

    return () => {
      while (detachCallbacks.length > 0) {
        detachCallbacks.pop()?.()
      }

      if (midiAccess) {
        midiAccess.onstatechange = null
      }
    }
  }, [enabled, onError, onNote])
}
