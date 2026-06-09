import { useGame } from '@/context/GameContext';
import './PlayerPanel.css';

const PLAYER_COLORS = [
  '#6c63ff', '#ff6b9d', '#4ade80', '#fbbf24',
  '#60a5fa', '#f87171', '#a78bfa', '#34d399',
];

export function PlayerPanel() {
  const { state } = useGame();
  const { config, currentPlayerIndex, scores } = state;
  const currentPlayer = config.players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const color = PLAYER_COLORS[currentPlayerIndex % PLAYER_COLORS.length];
  const score = scores[currentPlayer.id] ?? 0;

  return (
    <div className="player-panel animate-scale-in">
      <div className="player-panel-avatar" style={{ background: `${color}22`, borderColor: `${color}55` }}>
        <span>{currentPlayer.emoji || currentPlayer.name.charAt(0).toUpperCase()}</span>
      </div>
      <div className="player-panel-info">
        <div className="player-panel-label">A jogar agora</div>
        <div className="player-panel-name">{currentPlayer.name}</div>
      </div>
      <div className="player-panel-score" style={{ color }}>
        <span className="score-number">{score}</span>
        <span className="score-label">pts</span>
      </div>
    </div>
  );
}
