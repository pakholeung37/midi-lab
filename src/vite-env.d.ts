/// <reference types="vite/client" />

declare module 'virtual:midi-list' {
  export interface MidiFileInfo {
    name: string
    path: string
  }
  export const midiFiles: MidiFileInfo[]
}
