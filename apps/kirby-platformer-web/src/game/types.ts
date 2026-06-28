export type GameStatus = 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'WON'

export type GameEvent =
  | 'NONE'
  | 'COLLECT'
  | 'STOMP'
  | 'SWALLOW'
  | 'SPIT_HIT'
  | 'FIRE_HIT'
  | 'BOOMERANG_HIT'
  | 'SHRINK'
  | 'GAME_OVER'
  | 'WON'

export type KirbyMouthState = 'normal' | 'inhaling' | 'full'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Entity extends Rect {
  vx: number
  vy: number
  grounded: boolean
  facing: 'left' | 'right'
  isDashJumping: boolean
}

export interface Collectible extends Rect {
  id: string
}

export interface Enemy extends Rect {
  id: string
  vx: number
  patrolMin: number
  patrolMax: number
  alive: boolean
}

export interface SpitProjectile extends Rect {
  vx: number
  vy: number
}

export interface Boomerang extends Rect {
  vx: number
  vy: number
  phase: 'out' | 'return'
  traveled: number
  spin: number
}

export interface InputState {
  left: boolean
  right: boolean
  jump: boolean
  jumpPressed: boolean
  dash: boolean
  inhaleHeld: boolean
  inhalePressed: boolean
  fireHeld: boolean
  boomerangPressed: boolean
}

export interface GameState {
  kirby: Entity
  mouthState: KirbyMouthState
  swallowedEnemyId: string | null
  spit: SpitProjectile | null
  boomerang: Boomerang | null
  fireActive: boolean
  platforms: Rect[]
  stars: Collectible[]
  enemies: Enemy[]
  pits: Rect[]
  goal: Rect
  score: number
  status: GameStatus
  cameraX: number
  collectedStarIds: string[]
  defeatedEnemyIds: string[]
  levelWidth: number
  levelHeight: number
  viewportWidth: number
  viewportHeight: number
}

export interface UpdateResult {
  state: GameState
  event: GameEvent
}

export const EMPTY_INPUT: InputState = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  dash: false,
  inhaleHeld: false,
  inhalePressed: false,
  fireHeld: false,
  boomerangPressed: false,
}
