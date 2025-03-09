import {
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { Index } from './pages/index/index'
import { MainLayout } from './layouts/main-layout'
import { GamepadController } from './pages/gamepad-controller/gamepad-controller'

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

const routeTree = rootRoute.addChildren([indexRoute, gamepadControllerRoute])

export const router = createRouter({ routeTree })
