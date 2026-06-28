import { GameBoard } from './components/GameBoard.tsx'
import { GameOverlay } from './components/GameOverlay.tsx'
import { ScorePanel } from './components/ScorePanel.tsx'
import { useSnakeGame } from './hooks/useSnakeGame.ts'

export function App() {
  const { state, reset, togglePause } = useSnakeGame()

  return (
    <div className="app">
      <ScorePanel score={state.score} status={state.status} />
      <div className="game-column">
        <div className="game-area">
          <GameBoard state={state} />
          <GameOverlay
            status={state.status}
            score={state.score}
            onRestart={reset}
          />
        </div>
        {state.status !== 'GAME_OVER' && (
          <div className="game-controls">
            <button type="button" className="btn btn-primary" onClick={togglePause}>
              {state.status === 'PAUSED' ? '继续' : '暂停'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
