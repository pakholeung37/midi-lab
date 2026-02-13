import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { MainLayout } from './layouts/main-layout'
import { GamepadController } from './pages/gamepad-controller/gamepad-controller'
import { IntervalsEarTrainingPage } from './pages/ear-training-intervals/intervals-page'
import { PianoWaterfallPage } from './pages/piano-waterfall/piano-waterfall-page'
import {
  EAR_TRAINING_INTERVALS_PROJECT,
  GAMEPAD_CONTROLLER_PROJECT,
  PIANO_WATERFALL_PROJECT,
} from './projects'

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootRoute = createRootRoute({
  component: MainLayout,
})

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PianoWaterfallPage,
  staticData: {
    title: PIANO_WATERFALL_PROJECT.title,
  },
})

export const gamepadControllerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: GAMEPAD_CONTROLLER_PROJECT.path,
  component: GamepadController,
  staticData: {
    title: GAMEPAD_CONTROLLER_PROJECT.title,
  },
})

export const pianoWaterfallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: PIANO_WATERFALL_PROJECT.path,
  component: PianoWaterfallPage,
  staticData: {
    title: PIANO_WATERFALL_PROJECT.title,
  },
})

export const earTrainingIntervalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: EAR_TRAINING_INTERVALS_PROJECT.path,
  component: IntervalsEarTrainingPage,
  staticData: {
    title: EAR_TRAINING_INTERVALS_PROJECT.title,
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  gamepadControllerRoute,
  pianoWaterfallRoute,
  earTrainingIntervalsRoute,
])

export const router = createRouter({ routeTree })
