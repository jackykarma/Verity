import { useEffect, useRef } from 'react'
import { GameCanvas } from './components/GameCanvas.tsx'
import { GameOverlay } from './components/GameOverlay.tsx'
import { HudPanel } from './components/HudPanel.tsx'
import { STARS } from './game/levelData.ts'
import { usePlatformerGame } from './hooks/usePlatformerGame.ts'

export function App() {
  const { state, reset, togglePause } = usePlatformerGame()
  const collectedCount = state.collectedStarIds.length
  const gameAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gameAreaRef.current?.focus()
  }, [])

  return (
    <div className="app">
      <HudPanel
        score={state.score}
        totalStars={STARS.length}
        collectedCount={collectedCount}
        status={state.status}
      />
      <div className="game-column">
        <div
          ref={gameAreaRef}
          className="game-area"
          tabIndex={0}
          role="application"
          aria-label="星之卡比游戏区域，点击后按键操作"
          onPointerDown={() => gameAreaRef.current?.focus()}
        >
          <GameCanvas state={state} />
          <GameOverlay
            status={state.status}
            score={state.score}
            totalStars={STARS.length}
            onRestart={reset}
          />
        </div>
        {state.status === 'PLAYING' && (
          <div className="game-controls">
            <button type="button" className="btn btn-primary" onClick={togglePause}>
              暂停
            </button>
          </div>
        )}
        {state.status === 'PAUSED' && (
          <div className="game-controls">
            <button type="button" className="btn btn-primary" onClick={togglePause}>
              继续
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
