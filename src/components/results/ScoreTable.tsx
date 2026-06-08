import type { Player } from '@/types';
import './ScoreTable.css';

interface RankedPlayer {
  player: Player;
  score: number;
}

interface ScoreTableProps {
  ranked: RankedPlayer[];
}

const PLAYER_COLORS = [
  '#6c63ff', '#ff6b9d', '#4ade80', '#fbbf24',
  '#60a5fa', '#f87171', '#a78bfa', '#34d399',
];

export function ScoreTable({ ranked }: ScoreTableProps) {
  return (
    <div className="score-table animate-slide-up" style={{ animationDelay: '450ms' }}>
      <div className="score-table-header">
        <span>Classificação completa</span>
      </div>
      {ranked.map((entry, i) => {
        const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
        return (
          <div key={entry.player.id} className="score-table-row">
            <span className="score-table-rank">#{i + 1}</span>
            <div className="score-table-avatar" style={{ background: `${color}20`, borderColor: `${color}44` }}>
              <span style={{ color }}>{entry.player.name.charAt(0).toUpperCase()}</span>
            </div>
            <span className="score-table-name">{entry.player.name}</span>
            <span className="score-table-score" style={{ color }}>{entry.score} pts</span>
          </div>
        );
      })}
    </div>
  );
}
