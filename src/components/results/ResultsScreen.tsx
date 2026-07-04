import { useEffect, useRef, useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Podium } from './Podium';
import { ScoreTable } from './ScoreTable';
import { Confetti } from '@/components/ui/Confetti';
import { AchievementToast } from '@/components/ui/AchievementToast';
import { announceWinner, cancelSpeech } from '@/services/speechService';
import './ResultsScreen.css';

export function ResultsScreen() {
  const { state, dispatch } = useGame();
  const { config, scores } = state;
  const announcedRef = useRef(false);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    const raw = sessionStorage.getItem('jdp_new_achievements');
    if (raw) {
      try {
        setNewAchievements(JSON.parse(raw));
      } catch { /* ignore */ }
      sessionStorage.removeItem('jdp_new_achievements');
    }
  }, []);

  // Ordenar jogadores por pontuação decrescente (memoizado para não recriar a cada render)
  const ranked = useMemo(() => {
    return [...config.players]
      .map((p) => ({ player: p, score: scores[p.id] ?? 0 }))
      .sort((a, b) => b.score - a.score);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.players, scores]);

  const winner = ranked[0];
  const isTie = ranked.length > 1 && ranked[0].score === ranked[1].score;

  // Anunciar vencedor uma só vez (independente de re-renders)
  useEffect(() => {
    if (announcedRef.current) return;
    announcedRef.current = true;

    if (config.voiceEnabled && winner && !isTie) {
      void announceWinner(winner.player.name);
    }

    return () => cancelSpeech();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="results-screen">
      <div className="app-bg" />
      <Confetti />

      {newAchievements.length > 0 && (
        <AchievementToast
          achievementIds={newAchievements}
          onDone={() => setNewAchievements([])}
        />
      )}

      <div className="results-content">

        {/* Header */}
        <div className="results-header animate-slide-up">
          <div className="results-trophy">🏆</div>
          <h1 className="results-title">Fim do Jogo!</h1>
          {winner && !isTie && (
            <p className="results-winner-text animate-fade-in" style={{ animationDelay: '300ms' }}>
              Parabéns, <strong>{winner.player.name}</strong>!
            </p>
          )}
          {isTie && (
            <p className="results-winner-text animate-fade-in" style={{ animationDelay: '300ms' }}>
              Empate entre <strong>{ranked.filter(r => r.score === winner.score).map(r => r.player.name).join(' e ')}</strong>!
            </p>
          )}
        </div>

        {/* Pódio */}
        <Podium ranked={ranked} />

        {/* Tabela completa */}
        {ranked.length > 3 && <ScoreTable ranked={ranked} />}

        {/* Acções */}
        <div className="results-actions animate-slide-up" style={{ animationDelay: '600ms' }}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => dispatch({ type: 'RESET' })}          >
            🔄 Jogar de novo
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => dispatch({ type: 'GO_TO_STATS' })}
          >
            📊 Ver estatísticas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch({ type: 'GO_TO_SETUP' })}
          >
            Alterar configuração
          </Button>
        </div>
      </div>
    </div>
  );
}
