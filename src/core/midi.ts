import { create } from 'zustand'

export const useMidi = create<{
  midiOutputs: MIDIOutput[]
  selectedOutput: MIDIOutput | undefined
  setMidiOutputs: (outputs: MIDIOutput[]) => void
  setSelectedOutput: (outputId: string) => void
}>((set, get) => ({
  midiOutputs: [] as MIDIOutput[],
  selectedOutput: undefined,
  setMidiOutputs: (outputs: MIDIOutput[]) => set({ midiOutputs: outputs }),
  setSelectedOutput: (outputId: string) =>
    set({
      selectedOutput: get().midiOutputs.find((midi) => midi.id === outputId),
    }),
}))
