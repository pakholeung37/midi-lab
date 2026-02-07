import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { Index } from './pages/index/index'
import { MainLayout } from './layouts/main-layout'
import { GamepadController } from './pages/gamepad-controller/gamepad-controller'
import { PianoWaterfallPage } from './pages/piano-waterfall/piano-waterfall-page'

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
  component: Index,
})

export const gamepadControllerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gamepad-controller',
  component: GamepadController,
  staticData: {
    title: 'Gamepad Controller',
  },
})

export const pianoWaterfallRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/piano-waterfall',
  component: PianoWaterfallPage,
  staticData: {
    title: 'Piano Waterfall',
    noLayout: true, // 这个页面不使用 MainLayout 的布局
  },
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  gamepadControllerRoute,
  pianoWaterfallRoute,
])

export const router = createRouter({ routeTree })
