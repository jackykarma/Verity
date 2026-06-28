import { useEffect, useRef } from 'react'
import type { GameState } from '../game/types.ts'

interface GameBoardProps {
  state: GameState
}

const CELL_COLORS = {
  background: '#1a1a2e',
  grid: '#243352',
  wallZone: '#0c1929',
  wallHighlight: '#1e3a5f',
  snakeHead: '#4ade80',
  snakeBody: '#22c55e',
  food: '#f87171',
  border: '#38bdf8',
  borderGlow: 'rgba(56, 189, 248, 0.35)',
}

function isEdgeCell(x: number, y: number, gridSize: number): boolean {
  return x === 0 || y === 0 || x === gridSize - 1 || y === gridSize - 1
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  fill: string,
) {
  ctx.fillStyle = fill
  ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
}

const OUTER_BORDER_WIDTH = 8
const INNER_DASH_BORDER_WIDTH = 3

export function GameBoard({ state }: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { gridSize, snake, food, status } = state

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = canvas.width
    const cellSize = size / gridSize

    ctx.fillStyle = CELL_COLORS.background
    ctx.fillRect(0, 0, size, size)

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (isEdgeCell(x, y, gridSize)) {
          drawCell(ctx, x, y, cellSize, CELL_COLORS.wallZone)
        }
      }
    }

    ctx.strokeStyle = CELL_COLORS.grid
    ctx.lineWidth = 1
    for (let i = 1; i < gridSize; i++) {
      const pos = i * cellSize
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(size, pos)
      ctx.stroke()
    }

    ctx.strokeStyle = CELL_COLORS.wallHighlight
    ctx.lineWidth = INNER_DASH_BORDER_WIDTH
    ctx.setLineDash([8, 5])
    ctx.strokeRect(cellSize, cellSize, size - cellSize * 2, size - cellSize * 2)
    ctx.setLineDash([])

    const inset = OUTER_BORDER_WIDTH / 2
    ctx.strokeStyle = CELL_COLORS.border
    ctx.lineWidth = OUTER_BORDER_WIDTH
    ctx.strokeRect(inset, inset, size - OUTER_BORDER_WIDTH, size - OUTER_BORDER_WIDTH)

    ctx.shadowColor = CELL_COLORS.borderGlow
    ctx.shadowBlur = 12
    ctx.strokeStyle = CELL_COLORS.border
    ctx.lineWidth = 3
    ctx.strokeRect(1.5, 1.5, size - 3, size - 3)
    ctx.shadowBlur = 0

    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? CELL_COLORS.snakeHead : CELL_COLORS.snakeBody
      ctx.fillRect(
        segment.x * cellSize + 1,
        segment.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2,
      )
    })

    if (food.x >= 0 && food.y >= 0) {
      ctx.fillStyle = CELL_COLORS.food
      ctx.beginPath()
      ctx.arc(
        food.x * cellSize + cellSize / 2,
        food.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }

    if (status === 'PAUSED') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
      ctx.fillRect(0, 0, size, size)
    }
  }, [gridSize, snake, food, status])

  const displaySize = Math.min(560, window.innerWidth - 32)

  return (
    <canvas
      ref={canvasRef}
      width={displaySize}
      height={displaySize}
      className="game-board"
      aria-label="贪食蛇游戏棋盘"
    />
  )
}
