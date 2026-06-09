import { useEffect, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { TOTAL_LETTERS } from '@/utils/alphabet';
import { LetterDisplay } from './LetterDisplay';
import { TimerBar } from './TimerBar';
import { PlayerPanel } from './PlayerPanel';
import { CategoryDisplay } from './CategoryDisplay';
import { ScoreControls } from './ScoreControls';
import { Countdown } from './Countdown';
import { LetterHistory } from './LetterHistory';
import { AnswerInput } from './AnswerInput';
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
  const { noTimer } = useTimer();

  useSpeech();

  const isScoring = phase === 'scoring';
  const isAnnouncing = phase === 'announcing';
  const isPlaying = phase === 'playing';
  const isPaused = phase === 'paused';
  const isCountdown = phase === 'countdown';
  const isLastRound = remainingLetters.length === 0;

  const totalPlayed = usedLetters.length;
  const progressPct = (totalPlayed / TOTAL_LETTERS) * 100;

  // Quando o countdown termina, avança para 'announcing'
  const handleCountdownComplete = useCallback(() => {
    dispatch({ type: 'START_PLAYING' });
  }, [dispatch]);

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

  function handleSkipLetter() {
    cancelSpeech();
    dispatch({ type: 'SKIP_LETTER' });
  }

  function handlePause() { dispatch({ type: 'PAUSE' }); }
  function handleResume() { dispatch({ type: 'RESUME' }); }

  useEffect(() => {
    return () => cancelSpeech();
  }, []);

  return (
    <div className="game-screen">
      <div className="app-bg" />

      {/* Contagem decrescente */}
      {isCountdown && <Countdown onComplete={handleCountdownComplete} />}

      {/* Pausa overlay */}
      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-panel animate-scale-in">
            <div className="pause-icon">⏸</div>
            <div className="pause-title">Jogo em pausa</div>
            <Button variant="primary" size="lg" fullWidth onClick={handleResume}>
              ▶ Continuar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSkipLetter}>
              Saltar esta letra
            </Button>
          </div>
        </div>
      )}

      <div className="game-content">
        <GameMenu />

        {/* Progresso */}
        <div className="letter-progress animate-fade-in">
          <div className="letter-progress-bar">
            <div className="letter-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span className="letter-progress-text">{totalPlayed} / {TOTAL_LETTERS}</span>
        </div>

        {/* Letra */}
        <LetterDisplay letter={state.currentLetter} isAnnouncing={isAnnouncing} />

        {/* Histórico de letras */}
        <LetterHistory />

        {/* Timer (escondido se noTimer) */}
        {!noTimer && <TimerBar />}

        {/* Jogador actual */}
        <PlayerPanel />

        {/* Categoria */}
        <CategoryDisplay
          categoryKey={state.currentCategory}
          isAnnouncing={isAnnouncing}
          isScoring={isScoring}
          currentLetter={state.currentLetter}
        />

        {/* Campo de resposta (durante o jogo) */}
        {isPlaying && (
          <AnswerInput
            currentLetter={state.currentLetter}
            currentCategory={state.currentCategory}
            onValidAnswer={() => dispatch({ type: 'ADD_POINT', payload: { playerId: config.players[state.currentPlayerIndex]?.id ?? '' } })}
          />
        )}

        {/* Pontuações */}
        <ScoreControls />

        {/* Acções */}
        <div className="game-actions animate-slide-up" style={{ animationDelay: '300ms' }}>

          {isPlaying && (
            <div className="game-playing-actions">
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                ⏭ Terminar ronda
              </Button>
              {!noTimer && (
                <Button variant="ghost" size="sm" onClick={handlePause}>
                  ⏸ Pausar
                </Button>
              )}
            </div>
          )}

          {isScoring && (
            <Button variant="primary" size="lg" fullWidth onClick={handleNextRound} className="next-btn">
              {isLastRound ? '🏆 Ver resultados' : '➡️ Próxima ronda'}
            </Button>
          )}

          {isAnnouncing && (
            <div className="announcing-hint animate-fade-in">
              <span className="pulse-dot" />
              A anunciar…
            </div>
          )}

          {isCountdown && (
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
