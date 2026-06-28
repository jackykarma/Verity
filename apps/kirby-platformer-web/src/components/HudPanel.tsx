import type { GameStatus } from '../game/types.ts'

interface HudPanelProps {
  score: number
  totalStars: number
  collectedCount: number
  status: GameStatus
}

const STATUS_LABEL: Record<GameStatus, string> = {
  PLAYING: '冒险进行中',
  PAUSED: '已暂停',
  GAME_OVER: '失败',
  WON: '通关！',
}

export function HudPanel({ score, totalStars, collectedCount, status }: HudPanelProps) {
  return (
    <div className="hud-panel">
      <h1 className="title">星之卡比</h1>
      <p className="subtitle">跳跃大冒险</p>

      <div className="score-row">
        <span className="label">星星</span>
        <span className="score">{score}</span>
        <span className="score-total">/ {totalStars}</span>
      </div>

      <p className="status">{STATUS_LABEL[status]}</p>
      <p className="progress">已收集 {collectedCount} 颗星星</p>

      <div className="help">
        <p>← → / A D：移动</p>
        <p>空格 / W / ↑：跳跃</p>
        <p>方向 + 跳 / Shift + 跳：冲跳（更高更远）</p>
        <p>按住 J：吸入怪物（含怪时再按 J 吐出）</p>
        <p>按住 K：喷火</p>
        <p>按 L：扔回旋镖</p>
        <p>请先点击游戏画面再按键（避免输入法拦截）</p>
        <p>变大时碰怪会缩小，不会死亡</p>
        <p>从上方踩怪物也可消灭（+2 分）</p>
        <p>正常体型侧面碰怪会失败</p>
        <p>掉入坑洼会失败（跳回来也无效）</p>
        <p>P：暂停</p>
        <p>跳过坑洼，收集星星，抵达终点旗杆！</p>
      </div>
    </div>
  )
}
