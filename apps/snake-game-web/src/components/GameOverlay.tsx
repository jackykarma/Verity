interface GameOverlayProps {
  status: 'PLAYING' | 'PAUSED' | 'GAME_OVER'
  score: number
  onRestart: () => void
}

export function GameOverlay({
  status,
  score,
  onRestart,
}: GameOverlayProps) {
  if (status === 'PLAYING') {
    return null
  }

  if (status === 'PAUSED') {
    return (
      <div className="overlay overlay-paused">
        <p className="overlay-title">已暂停</p>
      </div>
    )
  }

  return (
    <div className="overlay overlay-game-over">
      <p className="overlay-title">游戏结束</p>
      <p className="overlay-score">最终分数：{score}</p>
      <button type="button" className="btn btn-primary" onClick={onRestart}>
        重新开始
      </button>
    </div>
  )
}
