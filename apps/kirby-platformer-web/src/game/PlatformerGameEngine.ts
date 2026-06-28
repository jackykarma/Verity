import {
  BOOMERANG_HIT_SCORE,
  BOOMERANG_MAX_RANGE,
  BOOMERANG_RETURN_SPEED,
  BOOMERANG_SIZE,
  BOOMERANG_SPEED,
  DEATH_Y,
  DASH_JUMP_SPEED,
  DASH_JUMP_VELOCITY,
  FIRE_HEIGHT,
  FIRE_HIT_SCORE,
  FIRE_REACH,
  FRICTION,
  GRAVITY,
  INHALE_PULL,
  INHALE_REACH,
  INHALE_SWALLOW_DIST,
  JUMP_VELOCITY,
  KIRBY_FULL_SCALE,
  KIRBY_SIZE,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  MAX_SPEED,
  MOVE_ACCEL,
  SPIT_HIT_SCORE,
  SPIT_SIZE,
  SPIT_SPEED,
  STOMP_BOUNCE_VELOCITY,
  STOMP_SCORE,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
} from './constants.ts'
import {
  createInitialEnemies,
  createInitialKirby,
  GOAL,
  PITS,
  PLATFORMS,
  STARS,
} from './levelData.ts'
import type {
  Boomerang,
  Enemy,
  Entity,
  GameEvent,
  GameState,
  InputState,
  KirbyMouthState,
  Rect,
  SpitProjectile,
  UpdateResult,
} from './types.ts'
import { EMPTY_INPUT } from './types.ts'

function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function computeCameraX(kirbyX: number, kirbyWidth: number): number {
  const focusX = kirbyX + kirbyWidth / 2
  return clamp(focusX - VIEWPORT_WIDTH / 3, 0, LEVEL_WIDTH - VIEWPORT_WIDTH)
}

function resolvePlatformCollision(entity: Entity, platform: Rect): void {
  if (!rectsOverlap(entity, platform)) {
    return
  }

  const overlapLeft = entity.x + entity.width - platform.x
  const overlapRight = platform.x + platform.width - entity.x
  const overlapTop = entity.y + entity.height - platform.y
  const overlapBottom = platform.y + platform.height - entity.y

  const minOverlapX = Math.min(overlapLeft, overlapRight)
  const minOverlapY = Math.min(overlapTop, overlapBottom)

  if (minOverlapX < minOverlapY) {
    if (overlapLeft < overlapRight) {
      entity.x = platform.x - entity.width
    } else {
      entity.x = platform.x + platform.width
    }
    entity.vx = 0
    return
  }

  if (overlapTop < overlapBottom) {
    entity.y = platform.y - entity.height
    entity.vy = Math.min(entity.vy, 0)
    entity.grounded = true
    entity.isDashJumping = false
  } else {
    entity.y = platform.y + platform.height
    entity.vy = Math.max(entity.vy, 0)
  }
}

function isStomp(kirby: Entity, enemy: Enemy): boolean {
  if (kirby.vy <= 0) {
    return false
  }
  const overlapX =
    kirby.x + kirby.width > enemy.x + 6 &&
    kirby.x < enemy.x + enemy.width - 6
  if (!overlapX) {
    return false
  }
  const kirbyBottom = kirby.y + kirby.height
  return kirbyBottom <= enemy.y + enemy.height * 0.55 && kirbyBottom >= enemy.y - 10
}

function growKirbyFull(kirby: Entity): void {
  const oldHeight = kirby.height
  kirby.width = KIRBY_SIZE * KIRBY_FULL_SCALE
  kirby.height = KIRBY_SIZE * KIRBY_FULL_SCALE
  kirby.y -= kirby.height - oldHeight
}

function shrinkKirbyNormal(kirby: Entity): void {
  const oldHeight = kirby.height
  kirby.width = KIRBY_SIZE
  kirby.height = KIRBY_SIZE
  kirby.y += oldHeight - kirby.height
}

function getInhaleHitbox(kirby: Entity): Rect {
  if (kirby.facing === 'right') {
    return {
      x: kirby.x + kirby.width * 0.55,
      y: kirby.y + kirby.height * 0.15,
      width: INHALE_REACH,
      height: kirby.height * 0.7,
    }
  }
  return {
    x: kirby.x - INHALE_REACH + kirby.width * 0.45,
    y: kirby.y + kirby.height * 0.15,
    width: INHALE_REACH,
    height: kirby.height * 0.7,
  }
}

function updateEnemies(enemies: Enemy[], dt: number, inhaling: boolean): void {
  for (const enemy of enemies) {
    if (!enemy.alive) {
      continue
    }
    if (inhaling) {
      continue
    }
    enemy.x += enemy.vx * dt
    if (enemy.x <= enemy.patrolMin) {
      enemy.x = enemy.patrolMin
      enemy.vx = Math.abs(enemy.vx)
    }
    if (enemy.x + enemy.width >= enemy.patrolMax) {
      enemy.x = enemy.patrolMax - enemy.width
      enemy.vx = -Math.abs(enemy.vx)
    }
  }
}

function getFireMouthAnchor(kirby: Entity): { x: number; y: number } {
  const cx = kirby.x + kirby.width / 2
  const cy = kirby.y + kirby.height / 2
  const dir = kirby.facing === 'right' ? 1 : -1
  const r = kirby.width / 2
  const rY = (kirby.height / 2) * 0.95
  return {
    x: cx + dir * r * 0.42,
    y: cy - rY * 0.14,
  }
}

function getFireHitbox(kirby: Entity): Rect {
  const mouth = getFireMouthAnchor(kirby)
  const flameH = Math.max(FIRE_HEIGHT, kirby.height * 0.5)
  const dir = kirby.facing === 'right' ? 1 : -1

  return {
    x: dir > 0 ? mouth.x - 4 : mouth.x - FIRE_REACH + 4,
    y: mouth.y - flameH * 0.58,
    width: FIRE_REACH,
    height: flameH,
  }
}

function isInPitDeathZone(kirby: Entity, pits: Rect[]): boolean {
  const centerX = kirby.x + kirby.width / 2
  const feetY = kirby.y + kirby.height

  for (const pit of pits) {
    if (centerX < pit.x || centerX > pit.x + pit.width) {
      continue
    }
    if (feetY > pit.y + 6) {
      return true
    }
  }

  return false
}

function updateSpit(spit: SpitProjectile | null, dt: number): SpitProjectile | null {
  if (!spit) {
    return null
  }
  spit.x += spit.vx * dt
  spit.y += spit.vy * dt
  if (spit.x < -80 || spit.x > LEVEL_WIDTH + 80) {
    return null
  }
  return spit
}

function updateBoomerang(
  boomerang: Boomerang,
  kirby: Entity,
  dt: number,
): Boomerang | null {
  boomerang.spin += dt * 14

  if (boomerang.phase === 'out') {
    boomerang.x += boomerang.vx * dt
    boomerang.y += boomerang.vy * dt
    boomerang.traveled += Math.abs(boomerang.vx * dt)
    if (boomerang.traveled >= BOOMERANG_MAX_RANGE) {
      boomerang.phase = 'return'
    }
    return boomerang
  }

  const targetX = kirby.x + kirby.width / 2 - boomerang.width / 2
  const targetY = kirby.y + kirby.height / 2 - boomerang.height / 2
  const dx = targetX - boomerang.x
  const dy = targetY - boomerang.y
  const dist = Math.hypot(dx, dy)

  if (dist < 14) {
    return null
  }

  boomerang.x += (dx / dist) * BOOMERANG_RETURN_SPEED * dt
  boomerang.y += (dy / dist) * BOOMERANG_RETURN_SPEED * dt
  boomerang.vx = dx > 0 ? BOOMERANG_RETURN_SPEED : -BOOMERANG_RETURN_SPEED

  if (boomerang.x < -120 || boomerang.x > LEVEL_WIDTH + 120) {
    return null
  }

  return boomerang
}

function createInitialState(): GameState {
  const kirby = createInitialKirby()
  return {
    kirby,
    mouthState: 'normal',
    swallowedEnemyId: null,
    spit: null,
    boomerang: null,
    fireActive: false,
    platforms: PLATFORMS.map((p) => ({ ...p })),
    stars: STARS.map((s) => ({ ...s })),
    enemies: createInitialEnemies(),
    pits: PITS.map((p) => ({ ...p })),
    goal: { ...GOAL },
    score: 0,
    status: 'PLAYING',
    cameraX: computeCameraX(kirby.x, kirby.width),
    collectedStarIds: [],
    defeatedEnemyIds: [],
    levelWidth: LEVEL_WIDTH,
    levelHeight: LEVEL_HEIGHT,
    viewportWidth: VIEWPORT_WIDTH,
    viewportHeight: VIEWPORT_HEIGHT,
  }
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    kirby: { ...state.kirby },
    platforms: state.platforms.map((p) => ({ ...p })),
    stars: state.stars.map((s) => ({ ...s })),
    enemies: state.enemies.map((e) => ({ ...e })),
    spit: state.spit ? { ...state.spit } : null,
    boomerang: state.boomerang ? { ...state.boomerang } : null,
    pits: state.pits.map((p) => ({ ...p })),
    goal: { ...state.goal },
    collectedStarIds: [...state.collectedStarIds],
    defeatedEnemyIds: [...state.defeatedEnemyIds],
  }
}

export class PlatformerGameEngine {
  private state: GameState
  private input: InputState = { ...EMPTY_INPUT }

  constructor() {
    this.state = createInitialState()
  }

  static fromState(state: GameState): PlatformerGameEngine {
    const engine = new PlatformerGameEngine()
    engine.state = cloneState(state)
    return engine
  }

  getState(): GameState {
    return cloneState(this.state)
  }

  reset(): void {
    this.state = createInitialState()
    this.input = { ...EMPTY_INPUT }
  }

  setInput(input: InputState): void {
    this.input = { ...input }
  }

  togglePause(): void {
    if (this.state.status === 'GAME_OVER' || this.state.status === 'WON') {
      return
    }
    this.state = {
      ...this.state,
      status: this.state.status === 'PAUSED' ? 'PLAYING' : 'PAUSED',
    }
  }

  update(dt: number): UpdateResult {
    if (this.state.status !== 'PLAYING') {
      return { state: this.getState(), event: 'NONE' }
    }

    const wasGrounded = this.state.kirby.grounded
    const kirby: Entity = { ...this.state.kirby, grounded: false, isDashJumping: false }
    const enemies = this.state.enemies.map((e) => ({ ...e }))
    let mouthState: KirbyMouthState = this.state.mouthState
    let swallowedEnemyId = this.state.swallowedEnemyId
    let spit: SpitProjectile | null = this.state.spit ? { ...this.state.spit } : null
    let boomerang: Boomerang | null = this.state.boomerang
      ? { ...this.state.boomerang }
      : null
    let fireActive = false
    let event: GameEvent = 'NONE'

    if (mouthState === 'full' && this.input.inhalePressed) {
      const dir = kirby.facing === 'right' ? 1 : -1
      spit = {
        x: kirby.facing === 'right' ? kirby.x + kirby.width - 8 : kirby.x - SPIT_SIZE + 8,
        y: kirby.y + kirby.height / 2 - SPIT_SIZE / 2,
        width: SPIT_SIZE,
        height: SPIT_SIZE,
        vx: dir * SPIT_SPEED,
        vy: 0,
      }
      shrinkKirbyNormal(kirby)
      mouthState = 'normal'
      swallowedEnemyId = null
    }

    if (mouthState === 'normal' && this.input.inhaleHeld) {
      mouthState = 'inhaling'
    } else if (mouthState === 'inhaling' && !this.input.inhaleHeld) {
      mouthState = 'normal'
    }

    const inhaling = mouthState === 'inhaling'
    const isFull = mouthState === 'full'
    const canUseAbilities = !inhaling

    if (
      canUseAbilities &&
      this.input.boomerangPressed &&
      !boomerang
    ) {
      const dir = kirby.facing === 'right' ? 1 : -1
      boomerang = {
        x:
          kirby.facing === 'right'
            ? kirby.x + kirby.width - 4
            : kirby.x - BOOMERANG_SIZE + 4,
        y: kirby.y + kirby.height / 2 - BOOMERANG_SIZE / 2,
        width: BOOMERANG_SIZE,
        height: BOOMERANG_SIZE,
        vx: dir * BOOMERANG_SPEED,
        vy: 0,
        phase: 'out',
        traveled: 0,
        spin: 0,
      }
    }

    updateEnemies(enemies, dt, inhaling)
    spit = updateSpit(spit, dt)
    if (boomerang) {
      boomerang = updateBoomerang(boomerang, kirby, dt)
    }

    if (inhaling) {
      if (this.input.left && !this.input.right) {
        kirby.facing = 'left'
      } else if (this.input.right && !this.input.left) {
        kirby.facing = 'right'
      }
      kirby.vx *= 0.7
    } else {
      if (this.input.left && !this.input.right) {
        kirby.vx -= MOVE_ACCEL * dt
        kirby.facing = 'left'
      } else if (this.input.right && !this.input.left) {
        kirby.vx += MOVE_ACCEL * dt
        kirby.facing = 'right'
      } else {
        if (kirby.vx > 0) {
          kirby.vx = Math.max(0, kirby.vx - FRICTION * dt)
        } else if (kirby.vx < 0) {
          kirby.vx = Math.min(0, kirby.vx + FRICTION * dt)
        }
      }
    }

    kirby.vx = clamp(kirby.vx, -MAX_SPEED, MAX_SPEED)

    if (this.input.jumpPressed && wasGrounded && !inhaling) {
      const dashLeft = this.input.left && !this.input.right
      const dashRight = this.input.right && !this.input.left
      const isDashJump = this.input.dash || dashLeft || dashRight

      if (isDashJump) {
        kirby.vy = DASH_JUMP_VELOCITY
        kirby.isDashJumping = true
        if (dashRight) {
          kirby.facing = 'right'
          kirby.vx = Math.max(kirby.vx, DASH_JUMP_SPEED)
        } else if (dashLeft) {
          kirby.facing = 'left'
          kirby.vx = Math.min(kirby.vx, -DASH_JUMP_SPEED)
        } else {
          kirby.vx =
            kirby.facing === 'right' ? DASH_JUMP_SPEED : -DASH_JUMP_SPEED
        }
      } else {
        kirby.vy = JUMP_VELOCITY
      }
    } else if (!wasGrounded && this.state.kirby.isDashJumping) {
      kirby.isDashJumping = true
    }

    kirby.vy += GRAVITY * dt
    kirby.x += kirby.vx * dt
    kirby.y += kirby.vy * dt

    for (const platform of this.state.platforms) {
      resolvePlatformCollision(kirby, platform)
    }

    kirby.x = clamp(kirby.x, 0, LEVEL_WIDTH - kirby.width)

    const collectedStarIds = [...this.state.collectedStarIds]
    const defeatedEnemyIds = [...this.state.defeatedEnemyIds]
    let score = this.state.score

    if (inhaling) {
      const hitbox = getInhaleHitbox(kirby)
      const kirbyCx = kirby.x + kirby.width / 2
      const kirbyCy = kirby.y + kirby.height / 2

      for (const enemy of enemies) {
        if (!enemy.alive) {
          continue
        }
        if (!rectsOverlap(hitbox, enemy)) {
          continue
        }

        const enemyCx = enemy.x + enemy.width / 2
        const enemyCy = enemy.y + enemy.height / 2
        const dx = kirbyCx - enemyCx
        const dy = kirbyCy - enemyCy
        const dist = Math.hypot(dx, dy)

        if (dist <= INHALE_SWALLOW_DIST + enemy.width * 0.3) {
          enemy.alive = false
          defeatedEnemyIds.push(enemy.id)
          growKirbyFull(kirby)
          mouthState = 'full'
          swallowedEnemyId = enemy.id
          event = 'SWALLOW'
          break
        }

        if (dist > 0.001) {
          enemy.x += (dx / dist) * INHALE_PULL * dt
          enemy.y += (dy / dist) * INHALE_PULL * dt * 0.35
        }
      }
    }

    for (const enemy of enemies) {
      if (!enemy.alive) {
        continue
      }
      if (!rectsOverlap(kirby, enemy)) {
        continue
      }
      if (isStomp(kirby, enemy)) {
        enemy.alive = false
        defeatedEnemyIds.push(enemy.id)
        score += STOMP_SCORE
        kirby.vy = STOMP_BOUNCE_VELOCITY
        kirby.grounded = false
        event = 'STOMP'
      } else if (isFull) {
        shrinkKirbyNormal(kirby)
        mouthState = 'normal'
        swallowedEnemyId = null
        event = 'SHRINK'
      } else if (inhaling && rectsOverlap(getInhaleHitbox(kirby), enemy)) {
        // 正面吸入时由吸入逻辑处理，不判死
      } else {
        this.state = {
          ...this.state,
          kirby,
          mouthState,
          swallowedEnemyId,
          spit,
          boomerang,
          fireActive,
          enemies,
          score,
          collectedStarIds,
          defeatedEnemyIds,
          cameraX: computeCameraX(kirby.x, kirby.width),
          status: 'GAME_OVER',
        }
        return { state: this.getState(), event: 'GAME_OVER' }
      }
    }

    if (spit) {
      for (const enemy of enemies) {
        if (!enemy.alive) {
          continue
        }
        if (rectsOverlap(spit, enemy)) {
          enemy.alive = false
          defeatedEnemyIds.push(enemy.id)
          score += SPIT_HIT_SCORE
          spit = null
          event = 'SPIT_HIT'
          break
        }
      }
    }

    if (canUseAbilities && this.input.fireHeld) {
      fireActive = true
      const fireHitbox = getFireHitbox(kirby)
      for (const enemy of enemies) {
        if (!enemy.alive) {
          continue
        }
        if (rectsOverlap(kirby, enemy)) {
          continue
        }
        if (rectsOverlap(fireHitbox, enemy)) {
          enemy.alive = false
          defeatedEnemyIds.push(enemy.id)
          score += FIRE_HIT_SCORE
          event = 'FIRE_HIT'
        }
      }
    }

    if (boomerang) {
      for (const enemy of enemies) {
        if (!enemy.alive) {
          continue
        }
        if (rectsOverlap(boomerang, enemy)) {
          enemy.alive = false
          defeatedEnemyIds.push(enemy.id)
          score += BOOMERANG_HIT_SCORE
          event = 'BOOMERANG_HIT'
        }
      }
    }

    for (const star of this.state.stars) {
      if (collectedStarIds.includes(star.id)) {
        continue
      }
      if (rectsOverlap(kirby, star)) {
        collectedStarIds.push(star.id)
        score += 1
        event = 'COLLECT'
      }
    }

    if (rectsOverlap(kirby, this.state.goal)) {
      this.state = {
        ...this.state,
        kirby,
        mouthState,
        swallowedEnemyId,
        spit,
        boomerang,
        fireActive,
        enemies,
        score,
        collectedStarIds,
        defeatedEnemyIds,
        cameraX: computeCameraX(kirby.x, kirby.width),
        status: 'WON',
      }
      return { state: this.getState(), event: 'WON' }
    }

    if (isInPitDeathZone(kirby, this.state.pits)) {
      this.state = {
        ...this.state,
        kirby,
        mouthState,
        swallowedEnemyId,
        spit,
        boomerang,
        fireActive,
        enemies,
        score,
        collectedStarIds,
        defeatedEnemyIds,
        cameraX: computeCameraX(kirby.x, kirby.width),
        status: 'GAME_OVER',
      }
      return { state: this.getState(), event: 'GAME_OVER' }
    }

    if (kirby.y > DEATH_Y) {
      this.state = {
        ...this.state,
        kirby,
        mouthState,
        swallowedEnemyId,
        spit,
        boomerang,
        fireActive,
        enemies,
        score,
        collectedStarIds,
        defeatedEnemyIds,
        cameraX: computeCameraX(kirby.x, kirby.width),
        status: 'GAME_OVER',
      }
      return { state: this.getState(), event: 'GAME_OVER' }
    }

    this.state = {
      ...this.state,
      kirby,
      mouthState,
      swallowedEnemyId,
      spit,
      boomerang,
      fireActive,
      enemies,
      score,
      collectedStarIds,
      defeatedEnemyIds,
      cameraX: computeCameraX(kirby.x, kirby.width),
    }

    return { state: this.getState(), event }
  }
}

export {
  rectsOverlap,
  computeCameraX,
  createInitialState,
  cloneState,
  isStomp,
  isInPitDeathZone,
  getInhaleHitbox,
  getFireHitbox,
  getFireMouthAnchor,
  growKirbyFull,
  shrinkKirbyNormal,
}
