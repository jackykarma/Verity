import type { GameStatus } from '../game/types.ts'

interface GameOverlayProps {
  status: GameStatus
  score: number
  totalStars: number
  onRestart: () => void
}

export function GameOverlay({ status, score, totalStars, onRestart }: GameOverlayProps) {
  if (status === 'PLAYING') {
    return null
  }

  const isWon = status === 'WON'
  const isPaused = status === 'PAUSED'

  return (
    <div className="overlay">
      <h2 className="overlay-title">
        {isPaused ? '暂停' : isWon ? '恭喜通关！' : '卡比掉下去了…'}
      </h2>
      {!isPaused && (
        <p className="overlay-score">
          星星：{score} / {totalStars}
        </p>
      )}
      {!isPaused && (
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          重新开始
        </button>
      )}
      {isPaused && <p className="overlay-hint">按 P 或点击继续按钮恢复游戏</p>}
    </div>
  )
}
