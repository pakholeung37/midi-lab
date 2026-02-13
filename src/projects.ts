export type ProjectNavItem = {
  id: string
  title: string
  path: '/piano-waterfall' | '/gamepad-controller'
}

export const PIANO_WATERFALL_PROJECT: ProjectNavItem = {
  id: 'piano-waterfall',
  title: 'Piano Waterfall',
  path: '/piano-waterfall',
}

export const GAMEPAD_CONTROLLER_PROJECT: ProjectNavItem = {
  id: 'gamepad-controller',
  title: 'Gamepad Controller',
  path: '/gamepad-controller',
}

export const PROJECT_NAV_ITEMS: ProjectNavItem[] = [
  PIANO_WATERFALL_PROJECT,
  GAMEPAD_CONTROLLER_PROJECT,
]
