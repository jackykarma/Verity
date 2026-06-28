import type { Collectible, Enemy, Rect } from './types.ts'
import {
  ENEMY_SIZE,
  ENEMY_SPEED,
  GOAL_HEIGHT,
  GOAL_WIDTH,
  GROUND_H,
  GROUND_Y,
  KIRBY_SIZE,
  LEVEL_WIDTH,
  STAR_SIZE,
} from './constants.ts'

/** 分段地面，中间留坑洼需跳跃通过 */
export const PLATFORMS: Rect[] = [
  { x: 0, y: GROUND_Y, width: 360, height: GROUND_H },
  { x: 500, y: GROUND_Y, width: 300, height: GROUND_H },
  { x: 920, y: GROUND_Y, width: 280, height: GROUND_H },
  { x: 1340, y: GROUND_Y, width: 320, height: GROUND_H },
  { x: 1780, y: GROUND_Y, width: 280, height: GROUND_H },
  { x: 2180, y: GROUND_Y, width: 220, height: GROUND_H },
  { x: 280, y: 360, width: 140, height: 16 },
  { x: 620, y: 300, width: 120, height: 16 },
  { x: 840, y: 340, width: 100, height: 16 },
  { x: 1060, y: 280, width: 160, height: 16 },
  { x: 1280, y: 320, width: 120, height: 16 },
  { x: 1520, y: 260, width: 140, height: 16 },
  { x: 1720, y: 300, width: 100, height: 16 },
  { x: 1920, y: 340, width: 160, height: 16 },
  { x: 2100, y: 280, width: 120, height: 16 },
]

/** 坑洼区域（掉入坑内即判失败） */
export const PITS: Rect[] = [
  { x: 360, y: GROUND_Y, width: 140, height: 80 },
  { x: 800, y: GROUND_Y, width: 120, height: 80 },
  { x: 1200, y: GROUND_Y, width: 140, height: 80 },
  { x: 1660, y: GROUND_Y, width: 120, height: 80 },
  { x: 2060, y: GROUND_Y, width: 120, height: 80 },
]

export const STARS: Collectible[] = [
  { id: 's1', x: 160, y: 320, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's2', x: 400, y: 280, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's3', x: 660, y: 260, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's4', x: 880, y: 300, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's5', x: 1120, y: 240, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's6', x: 1320, y: 280, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's7', x: 1580, y: 220, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's8', x: 1780, y: 260, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's9', x: 1980, y: 300, width: STAR_SIZE, height: STAR_SIZE },
  { id: 's10', x: 2280, y: 360, width: STAR_SIZE, height: STAR_SIZE },
]

const enemyY = GROUND_Y - ENEMY_SIZE

export const INITIAL_ENEMIES: Omit<Enemy, 'alive'>[] = [
  { id: 'e1', x: 180, y: enemyY, width: ENEMY_SIZE, height: ENEMY_SIZE, vx: ENEMY_SPEED, patrolMin: 60, patrolMax: 320 },
  { id: 'e2', x: 600, y: enemyY, width: ENEMY_SIZE, height: ENEMY_SIZE, vx: -ENEMY_SPEED, patrolMin: 520, patrolMax: 780 },
  { id: 'e3', x: 1000, y: enemyY, width: ENEMY_SIZE, height: ENEMY_SIZE, vx: ENEMY_SPEED, patrolMin: 940, patrolMax: 1160 },
  { id: 'e4', x: 320, y: 360 - ENEMY_SIZE, width: ENEMY_SIZE, height: ENEMY_SIZE, vx: ENEMY_SPEED, patrolMin: 290, patrolMax: 400 },
  { id: 'e5', x: 1450, y: enemyY, width: ENEMY_SIZE, height: ENEMY_SIZE, vx: -ENEMY_SPEED, patrolMin: 1360, patrolMax: 1620 },
  { id: 'e6', x: 1880, y: enemyY, width: ENEMY_SIZE, height: ENEMY_SIZE, vx: ENEMY_SPEED, patrolMin: 1800, patrolMax: 2040 },
]

export const GOAL: Rect = {
  x: LEVEL_WIDTH - 100,
  y: GROUND_Y - GOAL_HEIGHT,
  width: GOAL_WIDTH,
  height: GOAL_HEIGHT,
}

export const KIRBY_START_X = 80
export const KIRBY_START_Y = GROUND_Y - KIRBY_SIZE

export function createInitialKirby() {
  return {
    x: KIRBY_START_X,
    y: KIRBY_START_Y,
    width: KIRBY_SIZE,
    height: KIRBY_SIZE,
    vx: 0,
    vy: 0,
    grounded: true,
    facing: 'right' as const,
    isDashJumping: false,
  }
}

export function createInitialEnemies(): Enemy[] {
  return INITIAL_ENEMIES.map((e) => ({ ...e, alive: true }))
}
