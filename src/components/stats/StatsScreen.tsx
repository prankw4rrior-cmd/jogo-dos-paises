import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { loadStats, clearStats } from '@/services/storageService';
import { ACHIEVEMENT_DEFS } from '@/data/achievements';
import './StatsScreen.css';

export function StatsScreen() {
  const { dispatch } = useGame();
  const [stats, setStats] = useState(() => loadStats());
  const [showConfirm, setShowConfirm] = useState(false);

  const playerEntries = Object.values(stats.players).sort(
    (a, b) => b.wins - a.wins
  );

  const topWinner = playerEntries[0];
  const totalPoints = playerEntries.reduce((acc, p) => acc + p.totalPoints, 0);

  function handleClear() {
    clearStats();
    setStats(loadStats());
    setShowConfirm(false);
  }

  return (
    <div className="stats-screen">
      <div className="app-bg" />

      <div className="stats-content">

        {/* Header */}
        <div className="stats-header animate-slide-up">
          <button
            className="stats-back-btn"
            onClick={() => dispatch({ type: 'GO_TO_SETUP' })}
            aria-label="Voltar"
          >
            ←
          </button>
          <h1 className="stats-title">Estatísticas</h1>
          <div style={{ width: 40 }} />
        </div>

        {stats.gamesPlayed === 0 ? (
          <Card className="stats-empty animate-scale-in">
            <div className="stats-empty-icon">📊</div>
            <p>Ainda não jogaste nenhum jogo.</p>
            <p className="stats-empty-sub">Inicia um jogo para ver as estatísticas aqui!</p>
          </Card>
        ) : (
          <>
            {/* Resumo global */}
            <div className="stats-grid animate-slide-up" style={{ animationDelay: '60ms' }}>
              <StatCard icon="🎮" label="Jogos" value={stats.gamesPlayed} />
              <StatCard icon="🔤" label="Letras usadas" value={stats.lettersUsed.length} />
              <StatCard icon="⭐" label="Pontos totais" value={totalPoints} />
              {topWinner && (
                <StatCard icon="🏆" label="Melhor jogador" value={topWinner.name} small />
              )}
            </div>

            {/* Ranking de jogadores */}
            {playerEntries.length > 0 && (
              <Card className="animate-slide-up" style={{ animationDelay: '120ms' }}>
                <div className="stats-section-title">Ranking de vitórias</div>
                <div className="stats-players-list">
                  {playerEntries.map((p, i) => (
                    <div key={p.name} className="stats-player-row">
                      <span className="stats-player-rank">#{i + 1}</span>
                      <span className="stats-player-name">{p.name}</span>
                      <div className="stats-player-details">
                        <span className="stats-badge stats-badge-wins">{p.wins}V</span>
                        <span className="stats-badge">{p.gamesPlayed}J</span>
                        <span className="stats-badge stats-badge-best">🏅 {p.bestScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Letras já usadas */}
            {stats.lettersUsed.length > 0 && (
              <Card className="animate-slide-up" style={{ animationDelay: '180ms' }}>
                <div className="stats-section-title">Letras utilizadas</div>
                <div className="stats-letters">
                  {stats.lettersUsed.sort().map((l) => (
                    <span key={l} className="stats-letter-chip">{l}</span>
                  ))}
                </div>
              </Card>
            )}

            {/* Conquistas */}
            <Card className="animate-slide-up" style={{ animationDelay: '220ms' }}>
              <div className="stats-section-title">
                Conquistas ({Object.keys(stats.achievements ?? {}).length}/{ACHIEVEMENT_DEFS.length})
              </div>
              <div className="achievements-grid">
                {ACHIEVEMENT_DEFS.map((a) => {
                  const unlocked = !!(stats.achievements ?? {})[a.id];
                  return (
                    <div key={a.id} className={`achievement-item ${unlocked ? 'achievement-unlocked' : 'achievement-locked'}`}>
                      <span className="achievement-item-emoji">{unlocked ? a.emoji : '🔒'}</span>
                      <div className="achievement-item-text">
                        <span className="achievement-item-title">{a.title}</span>
                        <span className="achievement-item-desc">{a.description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Limpar dados */}
            {!showConfirm ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="animate-fade-in"
              >
                🗑 Limpar estatísticas
              </Button>
            ) : (
              <Card className="stats-confirm animate-scale-in">
                <p>Tens a certeza? Esta acção não pode ser desfeita.</p>
                <div className="stats-confirm-actions">
                  <Button variant="danger" size="sm" onClick={handleClear}>Sim, limpar</Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>Cancelar</Button>
                </div>
              </Card>
            )}
          </>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => dispatch({ type: 'GO_TO_SETUP' })}
        >
          Novo jogo
        </Button>
      </div>
    </div>
  );
}

/* ─── StatCard interno ──────────────────────────────────────────────────── */
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  small?: boolean;
}

function StatCard({ icon, label, value, small }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card-icon">{icon}</span>
      <span className={`stat-card-value ${small ? 'stat-card-value-sm' : ''}`}>{value}</span>
      <span className="stat-card-label">{label}</span>
    </div>
  );
}
