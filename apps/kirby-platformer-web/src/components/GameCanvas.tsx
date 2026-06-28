import { useEffect, useRef } from 'react'
import type { GameState, KirbyMouthState } from '../game/types.ts'
import { getFireMouthAnchor, getInhaleHitbox } from '../game/PlatformerGameEngine.ts'
import { FIRE_REACH } from '../game/constants.ts'

interface GameCanvasProps {
  state: GameState
}

const COLORS = {
  skyTop: '#87CEEB',
  skyBottom: '#E0F6FF',
  cloud: 'rgba(255, 255, 255, 0.85)',
  grass: '#4ade80',
  grassDark: '#22c55e',
  platform: '#8B4513',
  platformTop: '#A0522D',
  kirbyBody: '#FFB7C5',
  kirbyDark: '#FF8FAB',
  kirbyCheek: '#FF6B9D',
  eye: '#1a1a2e',
  star: '#FFD700',
  starGlow: '#FFF176',
  flagPole: '#64748b',
  flag: '#ef4444',
  flagAccent: '#dc2626',
  pit: '#1e293b',
  pitDeep: '#0f172a',
  enemyBody: '#f97316',
  enemyFeet: '#ea580c',
  enemyEye: '#1a1a2e',
  inhaleWind: 'rgba(186, 230, 253, 0.65)',
  mouthInner: '#5c0033',
  boomerangBlade: '#38bdf8',
  boomerangEdge: '#0ea5e9',
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  ctx.fillStyle = COLORS.cloud
  ctx.beginPath()
  ctx.arc(x, y, 20 * scale, 0, Math.PI * 2)
  ctx.arc(x + 25 * scale, y - 5 * scale, 25 * scale, 0, Math.PI * 2)
  ctx.arc(x + 55 * scale, y, 22 * scale, 0, Math.PI * 2)
  ctx.arc(x + 30 * scale, y + 8 * scale, 18 * scale, 0, Math.PI * 2)
  ctx.fill()
}

function drawInhaleEffect(
  ctx: CanvasRenderingContext2D,
  kirby: GameState['kirby'],
) {
  const hitbox = getInhaleHitbox(kirby)
  const cx = kirby.x + kirby.width / 2
  const cy = kirby.y + kirby.height / 2
  const dir = kirby.facing === 'right' ? 1 : -1

  ctx.strokeStyle = COLORS.inhaleWind
  ctx.lineWidth = 2
  for (let i = 0; i < 4; i++) {
    const offset = i * 14
    ctx.beginPath()
    ctx.moveTo(
      kirby.facing === 'right' ? hitbox.x + hitbox.width - offset : hitbox.x + offset,
      hitbox.y + hitbox.height * 0.3,
    )
    ctx.lineTo(cx + dir * 8, cy)
    ctx.stroke()
  }
}

function drawFireBreath(
  ctx: CanvasRenderingContext2D,
  kirby: GameState['kirby'],
) {
  const mouth = getFireMouthAnchor(kirby)
  const dir = kirby.facing === 'right' ? 1 : -1
  const t = performance.now() / 1000
  const baseReach = FIRE_REACH * (kirby.width / 32)

  ctx.save()

  for (let layer = 0; layer < 3; layer++) {
    const layerScale = 1 - layer * 0.14
    const alphaMul = 1 - layer * 0.22

    for (let i = 0; i < 6; i++) {
      const phase = t * (8 + layer * 2) + i * 1.05
      const flicker = 0.68 + 0.32 * Math.sin(phase * 1.6)
      const spread = (i - 2.5) * 0.24
      const length = baseReach * layerScale * flicker
      const tipX = mouth.x + dir * length
      const tipY = mouth.y + spread * kirby.height * 0.2 + Math.sin(phase * 2.2) * 2.5
      const midX = mouth.x + dir * length * 0.52
      const midY = mouth.y + spread * kirby.height * 0.12 + Math.cos(phase * 1.3) * 2
      const baseSpread = (5 - layer) + Math.abs(spread) * 2.2
      const a = alphaMul

      const grad = ctx.createLinearGradient(mouth.x, mouth.y, tipX, tipY)
      grad.addColorStop(0, `rgba(255, 235, 59, ${0.98 * a})`)
      grad.addColorStop(0.22, `rgba(255, 193, 7, ${0.96 * a})`)
      grad.addColorStop(0.48, `rgba(255, 152, 0, ${0.94 * a})`)
      grad.addColorStop(0.72, `rgba(255, 87, 34, ${0.9 * a})`)
      grad.addColorStop(0.9, `rgba(244, 67, 54, ${0.82 * a})`)
      grad.addColorStop(1, 'rgba(211, 47, 47, 0)')

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(mouth.x, mouth.y - baseSpread * 0.3)
      ctx.quadraticCurveTo(midX, midY - baseSpread, tipX, tipY)
      ctx.quadraticCurveTo(midX, midY + baseSpread, mouth.x, mouth.y + baseSpread * 0.3)
      ctx.closePath()
      ctx.fill()
    }
  }

  const glow = ctx.createRadialGradient(mouth.x, mouth.y, 0, mouth.x, mouth.y, 12)
  glow.addColorStop(0, 'rgba(255, 255, 220, 0.95)')
  glow.addColorStop(0.35, 'rgba(255, 214, 0, 0.75)')
  glow.addColorStop(0.7, 'rgba(255, 111, 0, 0.45)')
  glow.addColorStop(1, 'rgba(229, 57, 53, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(mouth.x, mouth.y, 12, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawBoomerang(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  spin: number,
) {
  const cx = x + w / 2
  const cy = y + h / 2

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(spin)

  ctx.fillStyle = COLORS.boomerangBlade
  ctx.beginPath()
  ctx.moveTo(-w * 0.45, -h * 0.1)
  ctx.quadraticCurveTo(0, -h * 0.55, w * 0.45, -h * 0.1)
  ctx.quadraticCurveTo(w * 0.15, 0, w * 0.45, h * 0.1)
  ctx.quadraticCurveTo(0, h * 0.55, -w * 0.45, h * 0.1)
  ctx.quadraticCurveTo(-w * 0.15, 0, -w * 0.45, -h * 0.1)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = COLORS.boomerangEdge
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
}

function drawKirby(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  facing: 'left' | 'right',
  isDashJumping: boolean,
  mouthState: KirbyMouthState,
  fireActive: boolean,
) {
  const stretchX = isDashJumping ? 1.12 : 1
  const stretchY = isDashJumping ? 0.9 : 1
  const cx = x + w / 2
  const cy = y + h / 2
  const r = (w / 2) * stretchX
  const rY = (h / 2) * stretchY * 0.95
  const isFull = mouthState === 'full'
  const isInhaling = mouthState === 'inhaling'

  if (isDashJumping) {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.25)'
    ctx.beginPath()
    ctx.ellipse(cx, cy, r + 6, rY + 4, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = COLORS.kirbyBody
  ctx.beginPath()
  ctx.ellipse(cx, cy, r, rY, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLORS.kirbyDark
  ctx.beginPath()
  ctx.ellipse(cx, cy + rY * 0.3, r * 0.85, rY * 0.55, 0, 0, Math.PI)
  ctx.fill()

  if (isInhaling) {
    drawInhaleEffect(ctx, { x, y, width: w, height: h, facing } as GameState['kirby'])
    const mouthX = cx + (facing === 'right' ? r * 0.42 : -r * 0.42)
    ctx.fillStyle = 'rgba(186, 230, 253, 0.35)'
    ctx.beginPath()
    ctx.ellipse(mouthX, cy, r * 0.75, rY * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = COLORS.mouthInner
    ctx.beginPath()
    ctx.ellipse(mouthX, cy + rY * 0.05, r * 0.62, rY * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#3b001f'
    ctx.lineWidth = 3
    ctx.stroke()

    const eyeOffsetX = facing === 'right' ? 4 : -4
    ctx.fillStyle = COLORS.eye
    ctx.beginPath()
    ctx.ellipse(cx + eyeOffsetX - 5, cy - 6, 4, 2, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + eyeOffsetX + 5, cy - 6, 4, 2, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (isFull) {
    const cheekR = r * 0.22
    ctx.fillStyle = COLORS.kirbyCheek
    ctx.beginPath()
    ctx.ellipse(cx - r * 0.55, cy + rY * 0.1, cheekR, cheekR * 0.75, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + r * 0.55, cy + rY * 0.1, cheekR, cheekR * 0.75, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = COLORS.kirbyBody
    ctx.beginPath()
    ctx.ellipse(cx, cy + rY * 0.15, r * 0.75, rY * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()

    const eyeOffsetX = facing === 'right' ? 5 : -5
    ctx.fillStyle = COLORS.eye
    ctx.beginPath()
    ctx.ellipse(cx + eyeOffsetX - 6, cy - rY * 0.15, 3, 5, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + eyeOffsetX + 6, cy - rY * 0.15, 3, 5, 0, 0, Math.PI * 2)
    ctx.fill()
  } else {
    const eyeOffsetX = facing === 'right' ? 4 : -4
    ctx.fillStyle = COLORS.eye
    ctx.beginPath()
    if (fireActive) {
      ctx.ellipse(cx + eyeOffsetX - 5, cy - 4, 4, 2.2, 0, 0, Math.PI * 2)
      ctx.ellipse(cx + eyeOffsetX + 5, cy - 4, 4, 2.2, 0, 0, Math.PI * 2)
    } else {
      ctx.ellipse(cx + eyeOffsetX - 5, cy - 4, 3, 5, 0, 0, Math.PI * 2)
      ctx.ellipse(cx + eyeOffsetX + 5, cy - 4, 3, 5, 0, 0, Math.PI * 2)
    }
    ctx.fill()

    if (!fireActive) {
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(cx + eyeOffsetX - 4, cy - 6, 1.2, 0, Math.PI * 2)
      ctx.arc(cx + eyeOffsetX + 6, cy - 6, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }

    if (fireActive) {
      const mouthX = cx + (facing === 'right' ? r * 0.34 : -r * 0.34)
      ctx.fillStyle = '#7f1d1d'
      ctx.beginPath()
      ctx.ellipse(mouthX, cy + rY * 0.02, r * 0.22, rY * 0.14, 0, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.fillStyle = COLORS.kirbyCheek
    ctx.beginPath()
    ctx.ellipse(cx - 10, cy + 2, 4, 2.5, 0, 0, Math.PI * 2)
    ctx.ellipse(cx + 10, cy + 2, 4, 2.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawSpitProjectile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const cx = x + w / 2
  const cy = y + h / 2

  ctx.fillStyle = 'rgba(249, 115, 22, 0.35)'
  ctx.beginPath()
  ctx.ellipse(cx, cy, w * 0.7, h * 0.45, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLORS.enemyBody
  ctx.beginPath()
  ctx.ellipse(cx, cy, w / 2.2, h / 2.4, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.ellipse(cx + 4, cy - 2, 4, 5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.enemyEye
  ctx.beginPath()
  ctx.arc(cx + 5, cy - 1, 2, 0, Math.PI * 2)
  ctx.fill()
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
) {
  const cx = x + size / 2
  const cy = y + size / 2
  const spikes = 5
  const outer = size / 2
  const inner = outer * 0.45

  ctx.fillStyle = COLORS.starGlow
  ctx.beginPath()
  ctx.arc(cx, cy, outer + 3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLORS.star
  ctx.beginPath()
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    const px = cx + Math.cos(angle) * radius
    const py = cy + Math.sin(angle) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
}

function drawGoal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const poleX = x + w / 2 - 3
  ctx.fillStyle = COLORS.flagPole
  ctx.fillRect(poleX, y, 6, h)

  ctx.fillStyle = COLORS.flagAccent
  ctx.fillRect(poleX - 8, y + h - 12, 22, 12)

  const flagY = y + 8
  ctx.fillStyle = COLORS.flag
  ctx.beginPath()
  ctx.moveTo(poleX + 6, flagY)
  ctx.lineTo(poleX + 52, flagY + 22)
  ctx.lineTo(poleX + 6, flagY + 44)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.beginPath()
  ctx.moveTo(poleX + 6, flagY + 6)
  ctx.lineTo(poleX + 36, flagY + 22)
  ctx.lineTo(poleX + 6, flagY + 28)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(poleX + 3, y, 7, 0, Math.PI * 2)
  ctx.fill()
}

function drawPit(ctx: CanvasRenderingContext2D, pit: { x: number; y: number; width: number; height: number }) {
  const gradient = ctx.createLinearGradient(pit.x, pit.y, pit.x, pit.y + pit.height)
  gradient.addColorStop(0, COLORS.pit)
  gradient.addColorStop(1, COLORS.pitDeep)
  ctx.fillStyle = gradient
  ctx.fillRect(pit.x, pit.y + 4, pit.width, pit.height)
  ctx.strokeStyle = '#334155'
  ctx.lineWidth = 2
  ctx.strokeRect(pit.x, pit.y + 4, pit.width, pit.height)
}

function drawEnemy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  vx: number,
) {
  const cx = x + w / 2
  const cy = y + h / 2

  ctx.fillStyle = COLORS.enemyBody
  ctx.beginPath()
  ctx.ellipse(cx, cy, w / 2, h / 2.2, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLORS.enemyFeet
  ctx.fillRect(x + 4, y + h - 6, 8, 5)
  ctx.fillRect(x + w - 12, y + h - 6, 8, 5)

  const eyeDir = vx >= 0 ? 1 : -1
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.ellipse(cx + eyeDir * 5, cy - 2, 5, 6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = COLORS.enemyEye
  ctx.beginPath()
  ctx.arc(cx + eyeDir * 6, cy - 1, 2.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#7c2d12'
  ctx.beginPath()
  ctx.moveTo(cx - 6, cy + 4)
  ctx.lineTo(cx + 6, cy + 4)
  ctx.lineTo(cx, cy + 8)
  ctx.closePath()
  ctx.fill()
}

export function GameCanvas({ state }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    kirby,
    mouthState,
    spit,
    boomerang,
    fireActive,
    platforms,
    stars,
    enemies,
    pits,
    goal,
    cameraX,
    collectedStarIds,
    status,
    viewportWidth,
    viewportHeight,
  } = state

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, 0, viewportHeight)
    gradient.addColorStop(0, COLORS.skyTop)
    gradient.addColorStop(1, COLORS.skyBottom)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, viewportWidth, viewportHeight)

    ctx.save()
    ctx.translate(-cameraX, 0)

    drawCloud(ctx, 120, 60, 1)
    drawCloud(ctx, 520, 40, 0.8)
    drawCloud(ctx, 980, 70, 1.1)
    drawCloud(ctx, 1500, 50, 0.9)
    drawCloud(ctx, 2000, 65, 1)

    for (const pit of pits) {
      drawPit(ctx, pit)
    }

    for (const platform of platforms) {
      ctx.fillStyle = COLORS.platform
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height)
      ctx.fillStyle = COLORS.platformTop
      ctx.fillRect(platform.x, platform.y, platform.width, 4)
      if (platform.y >= viewportHeight - 40) {
        ctx.fillStyle = COLORS.grass
        ctx.fillRect(platform.x, platform.y - 4, platform.width, 4)
        ctx.fillStyle = COLORS.grassDark
        for (let gx = platform.x; gx < platform.x + platform.width; gx += 16) {
          ctx.fillRect(gx + 4, platform.y - 8, 3, 4)
        }
      }
    }

    for (const star of stars) {
      if (collectedStarIds.includes(star.id)) continue
      drawStar(ctx, star.x, star.y, star.width)
    }

    for (const enemy of enemies) {
      if (!enemy.alive) continue
      drawEnemy(ctx, enemy.x, enemy.y, enemy.width, enemy.height, enemy.vx)
    }

    if (spit) {
      drawSpitProjectile(ctx, spit.x, spit.y, spit.width, spit.height)
    }

    if (boomerang) {
      drawBoomerang(ctx, boomerang.x, boomerang.y, boomerang.width, boomerang.height, boomerang.spin)
    }

    drawGoal(ctx, goal.x, goal.y, goal.width, goal.height)

    drawKirby(
      ctx,
      kirby.x,
      kirby.y,
      kirby.width,
      kirby.height,
      kirby.facing,
      kirby.isDashJumping,
      mouthState,
      fireActive,
    )

    if (fireActive) {
      drawFireBreath(ctx, kirby)
    }

    ctx.restore()

    if (status === 'PAUSED') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.fillRect(0, 0, viewportWidth, viewportHeight)
    }
  }, [
    kirby,
    mouthState,
    spit,
    boomerang,
    fireActive,
    platforms,
    stars,
    enemies,
    pits,
    goal,
    cameraX,
    collectedStarIds,
    status,
    viewportWidth,
    viewportHeight,
  ])

  return (
    <canvas
      ref={canvasRef}
      width={viewportWidth}
      height={viewportHeight}
      className="game-canvas"
      aria-label="卡比跳跃游戏画面"
    />
  )
}
