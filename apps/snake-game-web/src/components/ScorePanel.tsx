interface ScorePanelProps {
  score: number
  status: string
}

export function ScorePanel({ score, status }: ScorePanelProps) {
  const statusLabel =
    status === 'PLAYING'
      ? '进行中'
      : status === 'PAUSED'
        ? '已暂停'
        : '游戏结束'

  return (
    <div className="score-panel">
      <h1 className="title">贪食蛇</h1>
      <div className="score-row">
        <span className="label">分数</span>
        <span className="score">{score}</span>
      </div>
      <p className="status">{statusLabel}</p>
      <div className="help">
        <p>方向键 / WASD — 移动</p>
        <p>空格 — 暂停 / 继续</p>
      </div>
    </div>
  )
}
