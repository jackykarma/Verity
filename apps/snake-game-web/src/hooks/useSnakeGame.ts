import { useCallback, useEffect, useRef, useState } from 'react'
import { SnakeGameEngine } from '../game/SnakeGameEngine.ts'
import { TICK_INTERVAL_MS } from '../game/constants.ts'
import type { Direction, GameState } from '../game/types.ts'

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  W: 'UP',
  s: 'DOWN',
  S: 'DOWN',
  a: 'LEFT',
  A: 'LEFT',
  d: 'RIGHT',
  D: 'RIGHT',
}

export function useSnakeGame(gridSize: number = 20) {
  const engineRef = useRef<SnakeGameEngine | null>(null)
  if (!engineRef.current) {
    engineRef.current = new SnakeGameEngine(gridSize)
  }

  const [state, setState] = useState<GameState>(() =>
    engineRef.current!.getState(),
  )

  const syncState = useCallback(() => {
    setState(engineRef.current!.getState())
  }, [])

  const reset = useCallback(() => {
    engineRef.current!.reset()
    syncState()
  }, [syncState])

  const togglePause = useCallback(() => {
    engineRef.current!.togglePause()
    syncState()
  }, [syncState])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault()
        togglePause()
        return
      }
      const dir = KEY_TO_DIRECTION[e.key]
      if (dir) {
        e.preventDefault()
        engineRef.current!.setDirection(dir)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePause])

  useEffect(() => {
    const id = window.setInterval(() => {
      engineRef.current!.tick()
      syncState()
    }, TICK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [syncState])

  return { state, reset, togglePause }
}
