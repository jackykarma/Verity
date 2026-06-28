import { describe, expect, it } from 'vitest'
import {
  BOOMERANG_HIT_SCORE,
  DASH_JUMP_VELOCITY,
  FIRE_HIT_SCORE,
  FIXED_DT,
  JUMP_VELOCITY,
  KIRBY_SIZE,
  KIRBY_FULL_SCALE,
  SPIT_HIT_SCORE,
  STOMP_SCORE,
} from '../constants.ts'
import { GOAL, STARS } from '../levelData.ts'
import {
  getFireHitbox,
  getInhaleHitbox,
  growKirbyFull,
  PlatformerGameEngine,
} from '../PlatformerGameEngine.ts'
import { EMPTY_INPUT } from '../types.ts'

function stepRight(engine: PlatformerGameEngine, frames = 30) {
  for (let i = 0; i < frames; i++) {
    engine.setInput({ ...EMPTY_INPUT, right: true })
    engine.update(FIXED_DT)
  }
}

describe('PlatformerGameEngine', () => {
  it('starts with kirby on ground and playing status', () => {
    const engine = new PlatformerGameEngine()
    const state = engine.getState()
    expect(state.status).toBe('PLAYING')
    expect(state.score).toBe(0)
    expect(state.kirby.grounded).toBe(true)
    expect(state.mouthState).toBe('normal')
  })

  it('moves kirby right when input right', () => {
    const engine = new PlatformerGameEngine()
    const startX = engine.getState().kirby.x
    stepRight(engine, 20)
    expect(engine.getState().kirby.x).toBeGreaterThan(startX)
    expect(engine.getState().kirby.facing).toBe('right')
  })

  it('jumps when jump pressed on ground', () => {
    const engine = new PlatformerGameEngine()
    engine.setInput({ ...EMPTY_INPUT, jumpPressed: true })
    engine.update(FIXED_DT)
    expect(engine.getState().kirby.vy).toBe(JUMP_VELOCITY + 1800 * FIXED_DT)
  })

  it('dash jumps higher when moving horizontally', () => {
    const engine = new PlatformerGameEngine()
    engine.setInput({ ...EMPTY_INPUT, right: true, jumpPressed: true })
    engine.update(FIXED_DT)
    const state = engine.getState()
    expect(state.kirby.vy).toBe(DASH_JUMP_VELOCITY + 1800 * FIXED_DT)
    expect(state.kirby.vx).toBeGreaterThan(220)
    expect(state.kirby.isDashJumping).toBe(true)
  })

  it('does not jump in air without ground', () => {
    const engine = PlatformerGameEngine.fromState({
      ...new PlatformerGameEngine().getState(),
      kirby: {
        ...new PlatformerGameEngine().getState().kirby,
        y: 200,
        grounded: false,
        vy: -100,
      },
    })
    const vyBefore = engine.getState().kirby.vy
    engine.setInput({ ...EMPTY_INPUT, jumpPressed: true })
    engine.update(FIXED_DT)
    expect(engine.getState().kirby.vy).toBeGreaterThan(vyBefore)
  })

  it('collects star and increases score', () => {
    const star = STARS[0]!
    const base = new PlatformerGameEngine().getState()
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...base.kirby,
        x: star.x,
        y: star.y,
        vx: 0,
        vy: 0,
      },
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('COLLECT')
    expect(engine.getState().score).toBe(1)
    expect(engine.getState().collectedStarIds).toContain(star.id)
  })

  it('wins when touching goal', () => {
    const base = new PlatformerGameEngine().getState()
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...base.kirby,
        x: GOAL.x,
        y: GOAL.y,
        vx: 0,
        vy: 0,
      },
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('WON')
    expect(engine.getState().status).toBe('WON')
  })

  it('game over when falling below death line', () => {
    const base = new PlatformerGameEngine().getState()
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...base.kirby,
        y: 600,
        vy: 200,
      },
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('GAME_OVER')
    expect(engine.getState().status).toBe('GAME_OVER')
  })

  it('pauses and resumes', () => {
    const engine = new PlatformerGameEngine()
    engine.togglePause()
    expect(engine.getState().status).toBe('PAUSED')
    const before = engine.getState().kirby.x
    engine.setInput({ ...EMPTY_INPUT, right: true })
    engine.update(FIXED_DT)
    expect(engine.getState().kirby.x).toBe(before)
    engine.togglePause()
    expect(engine.getState().status).toBe('PLAYING')
  })

  it('resets game state', () => {
    const engine = new PlatformerGameEngine()
    stepRight(engine, 10)
    engine.reset()
    const state = engine.getState()
    expect(state.score).toBe(0)
    expect(state.status).toBe('PLAYING')
    expect(state.collectedStarIds).toHaveLength(0)
    expect(state.mouthState).toBe('normal')
  })

  it('updates camera to follow kirby', () => {
    const base = new PlatformerGameEngine().getState()
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: { ...base.kirby, x: 520, vx: 220 },
      enemies: base.enemies.map((e) => ({ ...e, alive: false })),
    })
    engine.setInput({ ...EMPTY_INPUT, right: true })
    for (let i = 0; i < 30; i++) {
      engine.update(FIXED_DT)
    }
    const state = engine.getState()
    expect(state.cameraX).toBeGreaterThan(0)
    expect(state.cameraX).toBeLessThanOrEqual(state.levelWidth - state.viewportWidth)
  })

  it('keeps kirby on platform after landing', () => {
    const engine = new PlatformerGameEngine()
    for (let i = 0; i < 120; i++) {
      engine.setInput({ ...EMPTY_INPUT })
      engine.update(FIXED_DT)
    }
    expect(engine.getState().kirby.grounded).toBe(true)
    expect(engine.getState().kirby.y).toBeLessThan(500)
  })

  it('stomps enemy when falling onto it', () => {
    const base = new PlatformerGameEngine().getState()
    const enemy = base.enemies[0]!
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...base.kirby,
        x: enemy.x,
        y: enemy.y - base.kirby.height + 8,
        vy: 200,
        grounded: false,
      },
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('STOMP')
    expect(engine.getState().score).toBe(STOMP_SCORE)
    expect(engine.getState().enemies[0]!.alive).toBe(false)
  })

  it('game over when hitting enemy from the side at normal size', () => {
    const base = new PlatformerGameEngine().getState()
    const enemy = base.enemies[0]!
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...base.kirby,
        x: enemy.x,
        y: enemy.y,
        vy: 0,
        vx: 100,
      },
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('GAME_OVER')
    expect(engine.getState().status).toBe('GAME_OVER')
  })

  it('has ground gaps in level', () => {
    const state = new PlatformerGameEngine().getState()
    expect(state.pits.length).toBeGreaterThan(0)
    const groundSegments = state.platforms.filter((p) => p.y >= 440)
    expect(groundSegments.length).toBeGreaterThan(1)
  })

  it('enters inhaling state when attack held', () => {
    const engine = new PlatformerGameEngine()
    engine.setInput({ ...EMPTY_INPUT, inhaleHeld: true })
    engine.update(FIXED_DT)
    expect(engine.getState().mouthState).toBe('inhaling')
  })

  it('swallows enemy when inhaling close enough', () => {
    const base = new PlatformerGameEngine().getState()
    const enemy = base.enemies[0]!
    const kirby = { ...base.kirby, facing: 'right' as const }
    const hitbox = getInhaleHitbox(kirby)
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...kirby,
        x: hitbox.x + hitbox.width - 20,
        y: enemy.y,
      },
      enemies: base.enemies.map((e, i) =>
        i === 0 ? { ...e, x: hitbox.x + hitbox.width - 8, y: enemy.y, alive: true } : { ...e, alive: false },
      ),
    })
    engine.setInput({ ...EMPTY_INPUT, inhaleHeld: true })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('SWALLOW')
    const state = engine.getState()
    expect(state.mouthState).toBe('full')
    expect(state.kirby.width).toBe(KIRBY_SIZE * KIRBY_FULL_SCALE)
    expect(state.enemies[0]!.alive).toBe(false)
  })

  it('game over when inhaling but hit enemy from behind', () => {
    const base = new PlatformerGameEngine().getState()
    const enemy = base.enemies[0]!
    const kirby = { ...base.kirby, facing: 'right' as const }
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...kirby,
        x: enemy.x + enemy.width - 8,
        y: enemy.y,
      },
      enemies: base.enemies.map((e, i) =>
        i === 0 ? { ...e, alive: true } : { ...e, alive: false },
      ),
    })
    engine.setInput({ ...EMPTY_INPUT, inhaleHeld: true })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('GAME_OVER')
    expect(engine.getState().status).toBe('GAME_OVER')
  })

  it('game over when touching enemy while holding fire', () => {
    const base = new PlatformerGameEngine().getState()
    const enemy = base.enemies[0]!
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...base.kirby,
        x: enemy.x,
        y: enemy.y,
        vy: 0,
        vx: 100,
      },
      enemies: base.enemies.map((e, i) =>
        i === 0 ? { ...e, alive: true } : { ...e, alive: false },
      ),
    })
    engine.setInput({ ...EMPTY_INPUT, fireHeld: true })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('GAME_OVER')
    expect(engine.getState().status).toBe('GAME_OVER')
    expect(engine.getState().enemies[0]!.alive).toBe(true)
  })

  it('game over when fallen into pit even while jumping up', () => {
    const base = new PlatformerGameEngine().getState()
    const pit = base.pits[0]!
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: {
        ...base.kirby,
        x: pit.x + pit.width / 2,
        y: pit.y + 20,
        vy: -400,
      },
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('GAME_OVER')
    expect(engine.getState().status).toBe('GAME_OVER')
  })

  it('allows move and jump while full', () => {
    const base = new PlatformerGameEngine().getState()
    const kirby = { ...base.kirby, facing: 'right' as const }
    growKirbyFull(kirby)
    const moveEngine = PlatformerGameEngine.fromState({
      ...base,
      kirby,
      mouthState: 'full',
      swallowedEnemyId: 'e1',
    })
    moveEngine.setInput({ ...EMPTY_INPUT, right: true })
    moveEngine.update(FIXED_DT)
    expect(moveEngine.getState().kirby.vx).toBeGreaterThan(0)

    const jumpEngine = PlatformerGameEngine.fromState({
      ...base,
      kirby: { ...kirby, grounded: true, vy: 0, vx: 0 },
      mouthState: 'full',
      swallowedEnemyId: 'e1',
    })
    jumpEngine.setInput({ ...EMPTY_INPUT, jumpPressed: true })
    jumpEngine.update(FIXED_DT)
    expect(jumpEngine.getState().kirby.vy).toBeLessThan(0)
  })

  it('creates spit projectile when attacking while full', () => {
    const base = new PlatformerGameEngine().getState()
    const kirby = { ...base.kirby, facing: 'right' as const }
    growKirbyFull(kirby)
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby,
      mouthState: 'full',
      swallowedEnemyId: 'e1',
    })
    engine.setInput({ ...EMPTY_INPUT, inhalePressed: true })
    engine.update(FIXED_DT)
    expect(engine.getState().mouthState).toBe('normal')
    expect(engine.getState().kirby.width).toBe(KIRBY_SIZE)
    expect(engine.getState().spit).not.toBeNull()
  })

  it('spit projectile defeats enemy on contact', () => {
    const base = new PlatformerGameEngine().getState()
    const enemy = base.enemies[1]!
    const engine = PlatformerGameEngine.fromState({
      ...base,
      mouthState: 'normal',
      spit: {
        x: enemy.x,
        y: enemy.y,
        width: 28,
        height: 28,
        vx: 440,
        vy: 0,
      },
      enemies: base.enemies.map((e, i) => ({ ...e, alive: i === 1 })),
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('SPIT_HIT')
    expect(engine.getState().score).toBe(SPIT_HIT_SCORE)
    expect(engine.getState().enemies[1]!.alive).toBe(false)
    expect(engine.getState().spit).toBeNull()
  })

  it('defeats enemy with fire breath', () => {
    const base = new PlatformerGameEngine().getState()
    const kirby = { ...base.kirby, facing: 'right' as const }
    const enemy = base.enemies[0]!
    const fireHitbox = getFireHitbox(kirby)
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: { ...kirby, x: enemy.x - fireHitbox.width - kirby.width + 16, y: enemy.y },
      enemies: base.enemies.map((e, i) =>
        i === 0 ? { ...e, x: fireHitbox.x + 24, y: fireHitbox.y + 4, alive: true } : { ...e, alive: false },
      ),
    })
    engine.setInput({ ...EMPTY_INPUT, fireHeld: true })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('FIRE_HIT')
    expect(engine.getState().score).toBe(FIRE_HIT_SCORE)
    expect(engine.getState().fireActive).toBe(true)
    expect(engine.getState().enemies[0]!.alive).toBe(false)
  })

  it('throws boomerang on L press', () => {
    const engine = new PlatformerGameEngine()
    engine.setInput({ ...EMPTY_INPUT, boomerangPressed: true })
    engine.update(FIXED_DT)
    expect(engine.getState().boomerang).not.toBeNull()
  })

  it('boomerang defeats enemy on contact', () => {
    const base = new PlatformerGameEngine().getState()
    const enemy = base.enemies[1]!
    const engine = PlatformerGameEngine.fromState({
      ...base,
      boomerang: {
        x: enemy.x,
        y: enemy.y,
        width: 22,
        height: 22,
        vx: 340,
        vy: 0,
        phase: 'out',
        traveled: 0,
        spin: 0,
      },
      enemies: base.enemies.map((e, i) => ({ ...e, alive: i === 1 })),
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('BOOMERANG_HIT')
    expect(engine.getState().score).toBe(BOOMERANG_HIT_SCORE)
    expect(engine.getState().enemies[1]!.alive).toBe(false)
  })

  it('shrinks instead of dying when full kirby touches enemy', () => {
    const base = new PlatformerGameEngine().getState()
    const kirby = { ...base.kirby, facing: 'right' as const }
    growKirbyFull(kirby)
    const enemy = base.enemies[1]!
    const engine = PlatformerGameEngine.fromState({
      ...base,
      kirby: { ...kirby, x: enemy.x, y: enemy.y },
      mouthState: 'full',
      swallowedEnemyId: 'e1',
      enemies: base.enemies.map((e, i) =>
        i === 1 ? { ...e, alive: true } : { ...e, alive: false },
      ),
    })
    const { event } = engine.update(FIXED_DT)
    expect(event).toBe('SHRINK')
    expect(engine.getState().mouthState).toBe('normal')
    expect(engine.getState().kirby.width).toBe(KIRBY_SIZE)
    expect(engine.getState().status).toBe('PLAYING')
    expect(engine.getState().enemies[1]!.alive).toBe(true)
  })
})
