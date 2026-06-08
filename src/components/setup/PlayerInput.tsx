import type { Player } from '@/types';
import './PlayerInput.css';

interface PlayerInputProps {
  player: Player;
  index: number;
  canRemove: boolean;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

const PLAYER_COLORS = [
  '#6c63ff', '#ff6b9d', '#4ade80', '#fbbf24',
  '#60a5fa', '#f87171', '#a78bfa', '#34d399',
];

export function PlayerInput({ player, index, canRemove, onRename, onRemove }: PlayerInputProps) {
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];

  return (
    <div className="player-input-row">
      <div className="player-avatar" style={{ background: `${color}22`, borderColor: `${color}44` }}>
        <span style={{ color }}>{player.name.charAt(0).toUpperCase() || '?'}</span>
      </div>

      <input
        className="player-name-input"
        type="text"
        value={player.name}
        onChange={(e) => onRename(player.id, e.target.value)}
        maxLength={20}
        placeholder="Nome do jogador"
        style={{ '--player-color': color } as React.CSSProperties}
      />

      {canRemove && (
        <button
          className="player-remove-btn"
          onClick={() => onRemove(player.id)}
          aria-label={`Remover ${player.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
