import type { Player } from '@/types';
import './Podium.css';

interface RankedPlayer {
  player: Player;
  score: number;
}

interface PodiumProps {
  ranked: RankedPlayer[];
}

const PLAYER_COLORS = [
  '#6c63ff', '#ff6b9d', '#4ade80', '#fbbf24',
  '#60a5fa', '#f87171', '#a78bfa', '#34d399',
];

const MEDALS = ['🥇', '🥈', '🥉'];
const PODIUM_HEIGHTS = ['80px', '56px', '44px'];
const PODIUM_ORDER = [1, 0, 2]; // 2º, 1º, 3º (visual do pódio)

export function Podium({ ranked }: PodiumProps) {
  const top3 = ranked.slice(0, 3);

  // Reordenar para o layout visual do pódio
  const visualOrder = PODIUM_ORDER.map((i) => top3[i]).filter(Boolean);

  return (
    <div className="podium-wrapper animate-scale-in" style={{ animationDelay: '200ms' }}>
      {visualOrder.map((entry, visualIndex) => {
        if (!entry) return null;
        const rank = ranked.indexOf(entry);
        const color = PLAYER_COLORS[rank % PLAYER_COLORS.length];
        const delay = [150, 0, 300][visualIndex] ?? 0;

        return (
          <div
            key={entry.player.id}
            className={`podium-place podium-rank-${rank}`}
            style={{ animationDelay: `${delay + 300}ms` }}
          >
            {/* Avatar e nome */}
            <div className="podium-player-info">
              <div className="podium-medal">{MEDALS[rank]}</div>
              <div
                className="podium-avatar"
                style={{ background: `${color}22`, borderColor: `${color}55` }}
              >
                <span style={{ color }}>{entry.player.emoji || entry.player.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="podium-name">{entry.player.name}</div>
              <div className="podium-score" style={{ color }}>{entry.score} pts</div>
            </div>

            {/* Coluna do pódio */}
            <div
              className="podium-column"
              style={{
                height: PODIUM_HEIGHTS[rank] ?? '44px',
                background: `linear-gradient(180deg, ${color}33 0%, ${color}11 100%)`,
                borderColor: `${color}44`,
              }}
            >
              <span className="podium-rank-num">{rank + 1}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
