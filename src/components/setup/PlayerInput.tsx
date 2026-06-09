import { useState } from 'react';
import type { Player } from '@/types';
import './PlayerInput.css';

interface PlayerInputProps {
  player: Player;
  index: number;
  canRemove: boolean;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onEmojiChange: (id: string, emoji: string) => void;
  emoji: string;
}

const PLAYER_COLORS = [
  '#6c63ff', '#ff6b9d', '#4ade80', '#fbbf24',
  '#60a5fa', '#f87171', '#a78bfa', '#34d399',
];

const EMOJI_OPTIONS = [
  '😀','😎','🤩','🥳','🦁','🐯','🐻','🦊',
  '🐼','🐨','🦄','🐸','🐧','🦋','🌟','⚡',
  '🎮','🏆','🎯','🚀','👑','🌈','🍕','⚽',
];

export function PlayerInput({ player, index, canRemove, onRename, onRemove, onEmojiChange, emoji }: PlayerInputProps) {
  const color = PLAYER_COLORS[index % PLAYER_COLORS.length];
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="player-input-row">
      {/* Avatar clicável */}
      <div className="player-avatar-wrapper">
        <button
          className="player-avatar player-avatar-emoji"
          style={{ background: `${color}22`, borderColor: `${color}44` }}
          onClick={() => setShowPicker(v => !v)}
          aria-label="Escolher emoji"
        >
          {emoji}
        </button>

        {showPicker && (
          <div className="emoji-picker animate-scale-in">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                className={`emoji-option ${emoji === e ? 'emoji-selected' : ''}`}
                onClick={() => { onEmojiChange(player.id, e); setShowPicker(false); }}
              >
                {e}
              </button>
            ))}
          </div>
        )}
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
