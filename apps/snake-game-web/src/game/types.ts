export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export type GameStatus = 'PLAYING' | 'PAUSED' | 'GAME_OVER'

export interface Position {
  x: number
  y: number
}

export interface GameState {
  snake: Position[]
  direction: Direction
  nextDirection: Direction
  food: Position
  score: number
  status: GameStatus
  gridSize: number
}

export type GameEvent = 'NONE' | 'ATE_FOOD' | 'GAME_OVER'

export interface TickResult {
  state: GameState
  event: GameEvent
}
