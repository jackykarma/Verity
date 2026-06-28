import { describe, expect, it } from 'vitest'
import { SnakeGameEngine } from '../SnakeGameEngine.ts'
import type { GameState } from '../types.ts'

const baseState = (): GameState => ({
  snake: [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 },
  ],
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  food: { x: 6, y: 5 },
  score: 0,
  status: 'PLAYING',
  gridSize: 10,
})

describe('SnakeGameEngine', () => {
  it('starts with snake centered and moving right', () => {
    const engine = new SnakeGameEngine(20)
    const state = engine.getState()
    expect(state.status).toBe('PLAYING')
    expect(state.score).toBe(0)
    expect(state.snake.length).toBe(3)
    expect(state.direction).toBe('RIGHT')
  })

  it('moves snake forward on tick', () => {
    const engine = new SnakeGameEngine(20)
    const before = engine.getState().snake[0]!
    const { state } = engine.tick()
    expect(state.snake[0]!.x).toBe(before.x + 1)
    expect(state.snake[0]!.y).toBe(before.y)
  })

  it('ignores opposite direction', () => {
    const engine = new SnakeGameEngine(20)
    engine.setDirection('LEFT')
    engine.tick()
    const state = engine.getState()
    expect(state.direction).toBe('RIGHT')
  })

  it('changes direction when valid', () => {
    const engine = new SnakeGameEngine(20)
    engine.setDirection('UP')
    engine.tick()
    expect(engine.getState().direction).toBe('UP')
  })

  it('ends game when hitting wall', () => {
    const engine = SnakeGameEngine.fromState({
      ...baseState(),
      snake: [{ x: 0, y: 5 }],
      food: { x: 8, y: 8 },
      direction: 'LEFT',
      nextDirection: 'LEFT',
    })
    const { event } = engine.tick()
    expect(event).toBe('GAME_OVER')
    expect(engine.getState().status).toBe('GAME_OVER')
  })

  it('ends game when hitting itself', () => {
    const engine = SnakeGameEngine.fromState({
      ...baseState(),
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
        { x: 5, y: 4 },
        { x: 6, y: 4 },
        { x: 6, y: 5 },
      ],
      direction: 'UP',
      nextDirection: 'UP',
      food: { x: 0, y: 0 },
    })
    const { event } = engine.tick()
    expect(event).toBe('GAME_OVER')
  })

  it('increases score and grows when eating food', () => {
    const engine = SnakeGameEngine.fromState(baseState())
    const { event } = engine.tick()
    expect(event).toBe('ATE_FOOD')
    expect(engine.getState().score).toBe(1)
    expect(engine.getState().snake.length).toBe(4)
  })

  it('does not place food on snake body', () => {
    const engine = new SnakeGameEngine(20)
    const state = engine.getState()
    const onSnake = state.snake.some(
      (s) => s.x === state.food.x && s.y === state.food.y,
    )
    expect(onSnake).toBe(false)
  })

  it('pauses and resumes', () => {
    const engine = new SnakeGameEngine(20)
    engine.togglePause()
    expect(engine.getState().status).toBe('PAUSED')
    const before = engine.getState().snake[0]!
    engine.tick()
    expect(engine.getState().snake[0]).toEqual(before)
    engine.togglePause()
    expect(engine.getState().status).toBe('PLAYING')
  })

  it('resets game state', () => {
    const engine = SnakeGameEngine.fromState({
      ...baseState(),
      score: 5,
    })
    engine.reset()
    const state = engine.getState()
    expect(state.score).toBe(0)
    expect(state.status).toBe('PLAYING')
    expect(state.snake.length).toBe(3)
  })
})
