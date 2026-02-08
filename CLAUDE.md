# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current Focus

当前正在开发 **piano-waterfall** 页面 (`src/pages/piano-waterfall/`)，一个 MIDI 钢琴瀑布流可视化播放器。

## Commands

- `pnpm run dev` - Start development server (Vite)
- `pnpm run build` - Type check and build for production
- `pnpm run typecheck` - Run TypeScript type checking only
- `pnpm run lint` - Run Biome linter/formatter checks

## Architecture

This is a React 19 + Vite 7 web application for Web MIDI experiments.

**Routing**: Uses `@tanstack/react-router` with routes defined in `src/router.ts`. Each page is a component in `src/pages/`. Routes are registered with the typed router via `createRoute()`.

**State Management**: Zustand stores in `src/core/`. The `useMidi` store (`src/core/midi.ts`) manages MIDI output device selection and state.

**Layouts**: `src/layouts/main-layout/` wraps all pages via the root route.

**Styling**: Tailwind CSS 4 with `@tailwindcss/vite` plugin.

## Code Style

Biome enforces:
- 2-space indentation
- Single quotes
- No semicolons (except where required)
- Line width 80 characters
