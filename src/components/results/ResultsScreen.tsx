import { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Podium } from './Podium';
import { ScoreTable } from './ScoreTable';
import { announceWinner, cancelSpeech } from '@/services/speechService';
import './ResultsScreen.css';

export function ResultsScreen() {
  const { state, dispatch } = useGame();
  const { config, scores } = state;
  const announcedRef = useRef(false);

  // Ordenar jogadores por pontuação decrescente
  const ranked = [...config.players]
    .map((p) => ({ player: p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score);

  const winner = ranked[0];

  // Anunciar vencedor uma só vez
  useEffect(() => {
    if (announcedRef.current) return;
    announcedRef.current = true;

    if (config.voiceEnabled && winner) {
      void announceWinner(winner.player.name);
    }

    return () => cancelSpeech();
  }, [config.voiceEnabled, winner]);

  return (
    <div className="results-screen">
      <div className="app-bg" />

      <div className="results-content">

        {/* Header */}
        <div className="results-header animate-slide-up">
          <div className="results-trophy">🏆</div>
          <h1 className="results-title">Fim do Jogo!</h1>
          {winner && (
            <p className="results-winner-text animate-fade-in" style={{ animationDelay: '300ms' }}>
              Parabéns, <strong>{winner.player.name}</strong>!
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
