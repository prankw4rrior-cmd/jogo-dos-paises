import { useGame } from '@/context/GameContext';
import { playPoint } from '@/services/soundService';
import './ScoreControls.css';

const PLAYER_COLORS = [
  '#6c63ff', '#ff6b9d', '#4ade80', '#fbbf24',
  '#60a5fa', '#f87171', '#a78bfa', '#34d399',
];

interface ScoreControlsProps {
  answerAlreadyScored?: boolean;
}

export function ScoreControls({ answerAlreadyScored = false }: ScoreControlsProps) {
  const { state, dispatch } = useGame();
  const { config, scores, currentPlayerIndex, phase } = state;

  const isScoring = phase === 'scoring';

  return (
    <div className="score-controls animate-slide-up" style={{ animationDelay: '200ms' }}>
      <div className="score-controls-header">
        <span className="score-controls-title">Pontuações</span>
        {isScoring && (
          <span className="score-controls-hint animate-fade-in">
            {answerAlreadyScored ? '✓ Ponto já atribuído — ajusta se necessário' : 'Ajusta os pontos'}
          </span>
        )}
      </div>

      <div className="score-players">
        {config.players.map((player, i) => {
          const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
          const score = scores[player.id] ?? 0;
          const isCurrent = i === currentPlayerIndex;

          return (
            <div
              key={player.id}
              className={`score-player-row ${isCurrent ? 'is-current' : ''}`}
              style={{ '--player-color': color } as React.CSSProperties}
            >
              <div className="score-player-avatar" style={{ background: `${color}20`, borderColor: `${color}44` }}>
                <span style={{ color }}>{player.emoji || player.name.charAt(0).toUpperCase()}</span>
              </div>

              <span className="score-player-name">{player.name}</span>

              {isScoring ? (
                <div className="score-player-controls">
                  <button
                    className="score-btn score-btn-minus"
                    onClick={() => dispatch({ type: 'REMOVE_POINT', payload: { playerId: player.id } })}
                    disabled={score <= 0}
                    aria-label={`Remover ponto a ${player.name}`}
                  >
                    −
                  </button>
                  <span className="score-player-value">{score}</span>
                  <button
                    className="score-btn score-btn-plus"
                    onClick={() => { playPoint(); dispatch({ type: 'ADD_POINT', payload: { playerId: player.id } }); }}
                    aria-label={`Adicionar ponto a ${player.name}`}
                  >
                    +
                  </button>
                </div>
              ) : (
                <span className="score-player-value-static">{score}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
