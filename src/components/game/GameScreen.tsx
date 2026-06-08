import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { TOTAL_LETTERS } from '@/utils/alphabet';
import { LetterDisplay } from './LetterDisplay';
import { TimerBar } from './TimerBar';
import { PlayerPanel } from './PlayerPanel';
import { CategoryDisplay } from './CategoryDisplay';
import { ScoreControls } from './ScoreControls';
import { Button } from '@/components/ui/Button';
import { GameMenu } from '@/components/ui/GameMenu';
import { useSpeech } from '@/hooks/useSpeech';
import { useTimer } from '@/hooks/useTimer';
import { cancelSpeech } from '@/services/speechService';
import { recordGame } from '@/services/storageService';
import './GameScreen.css';

export function GameScreen() {
  const { state, dispatch } = useGame();
  const { phase, config, scores, round, usedLetters, remainingLetters } = state;

  useSpeech();
  useTimer();

  const isScoring = phase === 'scoring';
  const isAnnouncing = phase === 'announcing';
  const isLastRound = remainingLetters.length === 0;

  function handleNextRound() {
    cancelSpeech();
    if (isLastRound) {
      recordGame(config.players, scores, usedLetters);
      dispatch({ type: 'END_GAME' });
    } else {
      dispatch({ type: 'NEXT_ROUND' });
    }
  }

  function handleSkip() {
    cancelSpeech();
    dispatch({ type: 'START_SCORING' });
  }

  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  const totalPlayed = usedLetters.length;
  const progressPct = (totalPlayed / TOTAL_LETTERS) * 100;

  return (
    <div className="game-screen">
      <div className="app-bg" />

      <div className="game-content">
        <GameMenu />

        {/* Progresso geral */}
        <div className="letter-progress animate-fade-in">
          <div className="letter-progress-bar">
            <div className="letter-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="letter-progress-text">
            {totalPlayed} / {TOTAL_LETTERS}
          </span>
        </div>

        {/* Letra */}
        <LetterDisplay letter={state.currentLetter} isAnnouncing={isAnnouncing} />

        {/* Timer */}
        <TimerBar />

        {/* Jogador actual */}
        <PlayerPanel />

        {/* Categoria sorteada */}
        <CategoryDisplay
          categoryKey={state.currentCategory}
          isAnnouncing={isAnnouncing}
          isScoring={isScoring}
          currentLetter={state.currentLetter}
        />

        {/* Pontuações */}
        <ScoreControls />

        {/* Acções */}
        <div className="game-actions animate-slide-up" style={{ animationDelay: '300ms' }}>
          {!isScoring && !isAnnouncing && (
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              ⏭ Terminar ronda
            </Button>
          )}

          {isScoring && (
            <Button variant="primary" size="lg" fullWidth onClick={handleNextRound} className="next-btn">
              {isLastRound ? '🏆 Ver resultados' : '➡️ Próxima ronda'}
            </Button>
          )}

          {isAnnouncing && (
            <div className="announcing-hint animate-fade-in">
              <span className="pulse-dot" />
              A preparar…
            </div>
          )}
        </div>

        <div className="round-badge">Ronda {round}</div>
      </div>
    </div>
  );
}
