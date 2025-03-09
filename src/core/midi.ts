import { create } from 'zustand'

export const useMidi = create<{
  midiOutputs: WebMidi.MIDIOutput[]
  selectedOutput: WebMidi.MIDIOutput | undefined
  setMidiOutputs: (outputs: WebMidi.MIDIOutput[]) => void
  setSelectedOutput: (outputId: string) => void
}>((set, get) => ({
  midiOutputs: [] as WebMidi.MIDIOutput[],
  selectedOutput: undefined,
  setMidiOutputs: (outputs: WebMidi.MIDIOutput[]) =>
    set({ midiOutputs: outputs }),
  setSelectedOutput: (outputId: string) =>
    set({
      selectedOutput: get().midiOutputs.find((midi) => midi.id === outputId),
    }),
}))
