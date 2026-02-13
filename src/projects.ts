export type ProjectNavItem = {
  id: string
  title: string
  path: '/piano-waterfall' | '/gamepad-controller' | '/ear-training-intervals'
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

export const EAR_TRAINING_INTERVALS_PROJECT: ProjectNavItem = {
  id: 'ear-training-intervals',
  title: 'Ear Training - Intervals',
  path: '/ear-training-intervals',
}

export const PROJECT_NAV_ITEMS: ProjectNavItem[] = [
  PIANO_WATERFALL_PROJECT,
  GAMEPAD_CONTROLLER_PROJECT,
  EAR_TRAINING_INTERVALS_PROJECT,
]
