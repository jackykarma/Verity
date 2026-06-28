import {
  DEFAULT_GRID_SIZE,
  DIRECTION_DELTA,
  INITIAL_SNAKE_LENGTH,
  OPPOSITE_DIRECTION,
} from './constants.ts'
import type {
  Direction,
  GameState,
  Position,
  TickResult,
} from './types.ts'

function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y
}

function isOnSnake(pos: Position, snake: Position[]): boolean {
  return snake.some((segment) => positionsEqual(segment, pos))
}

function createInitialSnake(gridSize: number): Position[] {
  const center = Math.floor(gridSize / 2)
  const snake: Position[] = []
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: center - i, y: center })
  }
  return snake
}

function spawnFood(gridSize: number, snake: Position[]): Position {
  const occupied = new Set(snake.map((s) => `${s.x},${s.y}`))
  const free: Position[] = []
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y })
      }
    }
  }
  if (free.length === 0) {
    return { x: -1, y: -1 }
  }
  const index = Math.floor(Math.random() * free.length)
  return free[index]!
}

function createInitialState(gridSize: number): GameState {
  const snake = createInitialSnake(gridSize)
  return {
    snake,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: spawnFood(gridSize, snake),
    score: 0,
    status: 'PLAYING',
    gridSize,
  }
}

export class SnakeGameEngine {
  private state: GameState

  constructor(gridSize: number = DEFAULT_GRID_SIZE) {
    this.state = createInitialState(gridSize)
  }

  /** 供单元测试注入确定性初始状态 */
  static fromState(state: GameState): SnakeGameEngine {
    const engine = new SnakeGameEngine(state.gridSize)
    engine.state = {
      ...state,
      snake: state.snake.map((s) => ({ ...s })),
      food: { ...state.food },
    }
    return engine
  }

  getState(): GameState {
    return {
      ...this.state,
      snake: this.state.snake.map((s) => ({ ...s })),
      food: { ...this.state.food },
    }
  }

  reset(): void {
    this.state = createInitialState(this.state.gridSize)
  }

  setDirection(dir: Direction): void {
    if (this.state.status !== 'PLAYING') {
      return
    }
    const effective = this.state.direction
    if (dir === OPPOSITE_DIRECTION[effective]) {
      return
    }
    this.state = { ...this.state, nextDirection: dir }
  }

  togglePause(): void {
    if (this.state.status === 'GAME_OVER') {
      return
    }
    this.state = {
      ...this.state,
      status: this.state.status === 'PAUSED' ? 'PLAYING' : 'PAUSED',
    }
  }

  tick(): TickResult {
    if (this.state.status !== 'PLAYING') {
      return { state: this.getState(), event: 'NONE' }
    }

    const direction = this.state.nextDirection
    const head = this.state.snake[0]!
    const delta = DIRECTION_DELTA[direction]
    const newHead: Position = {
      x: head.x + delta.dx,
      y: head.y + delta.dy,
    }

    const { gridSize } = this.state
    const hitWall =
      newHead.x < 0 ||
      newHead.x >= gridSize ||
      newHead.y < 0 ||
      newHead.y >= gridSize

    const bodyToCheck = this.state.snake.slice(0, -1)
    const hitSelf = isOnSnake(newHead, bodyToCheck)

    if (hitWall || hitSelf) {
      this.state = { ...this.state, direction, status: 'GAME_OVER' }
      return { state: this.getState(), event: 'GAME_OVER' }
    }

    const ateFood = positionsEqual(newHead, this.state.food)
    let newSnake: Position[]

    if (ateFood) {
      newSnake = [newHead, ...this.state.snake]
      const newFood = spawnFood(gridSize, newSnake)
      if (newFood.x < 0) {
        this.state = {
          ...this.state,
          snake: newSnake,
          direction,
          nextDirection: direction,
          score: this.state.score + 1,
          status: 'GAME_OVER',
        }
        return { state: this.getState(), event: 'GAME_OVER' }
      }
      this.state = {
        ...this.state,
        snake: newSnake,
        direction,
        nextDirection: direction,
        food: newFood,
        score: this.state.score + 1,
      }
      return { state: this.getState(), event: 'ATE_FOOD' }
    }

    newSnake = [newHead, ...this.state.snake.slice(0, -1)]
    this.state = {
      ...this.state,
      snake: newSnake,
      direction,
      nextDirection: direction,
    }
    return { state: this.getState(), event: 'NONE' }
  }
}

export { createInitialState, spawnFood, isOnSnake, positionsEqual }
