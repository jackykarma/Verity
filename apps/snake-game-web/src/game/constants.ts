export const DEFAULT_GRID_SIZE = 20
export const TICK_INTERVAL_MS = 130
export const INITIAL_SNAKE_LENGTH = 3

export const DIRECTION_DELTA: Record<
  import('./types.ts').Direction,
  { dx: number; dy: number }
> = {
  UP: { dx: 0, dy: -1 },
  DOWN: { dx: 0, dy: 1 },
  LEFT: { dx: -1, dy: 0 },
  RIGHT: { dx: 1, dy: 0 },
}

export const OPPOSITE_DIRECTION: Record<
  import('./types.ts').Direction,
  import('./types.ts').Direction
> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}
