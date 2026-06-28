import { useCallback, useEffect, useRef, useState } from 'react'
import { FIXED_DT } from '../game/constants.ts'
import { PlatformerGameEngine } from '../game/PlatformerGameEngine.ts'
import type { GameState, InputState } from '../game/types.ts'

const LEFT_CODES = new Set(['ArrowLeft', 'KeyA'])
const RIGHT_CODES = new Set(['ArrowRight', 'KeyD'])
const JUMP_CODES = new Set(['Space', 'ArrowUp', 'KeyW'])
const INHALE_CODES = new Set(['KeyJ'])
const FIRE_CODES = new Set(['KeyK'])
const BOOMERANG_CODES = new Set(['KeyL'])
const GAME_CODES = new Set([
  ...LEFT_CODES,
  ...RIGHT_CODES,
  ...JUMP_CODES,
  ...INHALE_CODES,
  ...FIRE_CODES,
  ...BOOMERANG_CODES,
  ...['ShiftLeft', 'ShiftRight'],
  'KeyP',
])

function hasAnyCode(keys: Set<string>, codes: Set<string>): boolean {
  for (const code of codes) {
    if (keys.has(code)) {
      return true
    }
  }
  return false
}

function buildInputFromKeys(keys: Set<string>): InputState {
  return {
    left: hasAnyCode(keys, LEFT_CODES),
    right: hasAnyCode(keys, RIGHT_CODES),
    jump: hasAnyCode(keys, JUMP_CODES),
    jumpPressed: false,
    dash: keys.has('ShiftLeft') || keys.has('ShiftRight'),
    inhaleHeld: hasAnyCode(keys, INHALE_CODES),
    inhalePressed: false,
    fireHeld: hasAnyCode(keys, FIRE_CODES),
    boomerangPressed: false,
  }
}

export function usePlatformerGame() {
  const engineRef = useRef<PlatformerGameEngine | null>(null)
  if (!engineRef.current) {
    engineRef.current = new PlatformerGameEngine()
  }

  const [state, setState] = useState<GameState>(() =>
    engineRef.current!.getState(),
  )

  const keysRef = useRef<Set<string>>(new Set())
  const jumpQueuedRef = useRef(false)
  const inhaleQueuedRef = useRef(false)
  const boomerangQueuedRef = useRef(false)
  const lastTimeRef = useRef<number | null>(null)
  const accumulatorRef = useRef(0)

  const syncState = useCallback(() => {
    setState(engineRef.current!.getState())
  }, [])

  const reset = useCallback(() => {
    engineRef.current!.reset()
    keysRef.current.clear()
    jumpQueuedRef.current = false
    inhaleQueuedRef.current = false
    boomerangQueuedRef.current = false
    syncState()
  }, [syncState])

  const togglePause = useCallback(() => {
    engineRef.current!.togglePause()
    syncState()
  }, [syncState])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        e.preventDefault()
        togglePause()
        return
      }

      if (GAME_CODES.has(e.code)) {
        e.preventDefault()
      }

      if (JUMP_CODES.has(e.code) && !keysRef.current.has(e.code)) {
        jumpQueuedRef.current = true
      }

      if (INHALE_CODES.has(e.code) && !keysRef.current.has(e.code)) {
        inhaleQueuedRef.current = true
      }

      if (BOOMERANG_CODES.has(e.code) && !keysRef.current.has(e.code)) {
        boomerangQueuedRef.current = true
      }

      keysRef.current.add(e.code)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    const onBlur = () => {
      keysRef.current.clear()
      jumpQueuedRef.current = false
      inhaleQueuedRef.current = false
      boomerangQueuedRef.current = false
    }

    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
      window.removeEventListener('blur', onBlur)
    }
  }, [togglePause])

  useEffect(() => {
    let frameId = 0

    const loop = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time
      }

      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = time
      accumulatorRef.current += delta

      const input = buildInputFromKeys(keysRef.current)
      input.jumpPressed = jumpQueuedRef.current
      jumpQueuedRef.current = false
      input.inhalePressed = inhaleQueuedRef.current
      inhaleQueuedRef.current = false
      input.boomerangPressed = boomerangQueuedRef.current
      boomerangQueuedRef.current = false
      engineRef.current!.setInput(input)

      while (accumulatorRef.current >= FIXED_DT) {
        engineRef.current!.update(FIXED_DT)
        accumulatorRef.current -= FIXED_DT
      }

      syncState()
      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [syncState])

  return { state, reset, togglePause }
}
