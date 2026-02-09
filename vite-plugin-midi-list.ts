import type { Plugin } from 'vite'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const VIRTUAL_MODULE_ID = 'virtual:midi-list'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

export interface MidiFileInfo {
  name: string
  path: string
}

export function midiListPlugin(): Plugin {
  return {
    name: 'vite-plugin-midi-list',
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        const publicDir = resolve(process.cwd(), 'public')
        const files = readdirSync(publicDir)
        const midiFiles: MidiFileInfo[] = files
          .filter((f) => /\.midi?$/i.test(f))
          .map((f) => ({
            name: f.replace(/\.midi?$/i, '').replace(/[-_]/g, ' '),
            path: `/${f}`,
          }))
        return `export const midiFiles = ${JSON.stringify(midiFiles, null, 2)}`
      }
    },
    handleHotUpdate({ file, server }) {
      if (/\.midi?$/i.test(file)) {
        const module = server.moduleGraph.getModuleById(
          RESOLVED_VIRTUAL_MODULE_ID,
        )
        if (module) {
          server.moduleGraph.invalidateModule(module)
          server.ws.send({ type: 'full-reload' })
        }
      }
    },
  }
}
