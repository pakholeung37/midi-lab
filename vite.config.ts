import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { midiListPlugin } from './vite-plugin-midi-list'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), midiListPlugin()],
})
