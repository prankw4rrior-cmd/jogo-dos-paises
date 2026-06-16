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
import { RoundHistory } from './RoundHistory';
import { Button } from '@/components/ui/Button';
import { GameMenu } from '@/components/ui/GameMenu';
import { useSpeech } from '@/hooks/useSpeech';
import { useTimer } from '@/hooks/useTimer';
import { cancelSpeech } from '@/services/speechService';
import { recordGame } from '@/services/storageService';
import { getRandomExample } from '@/data/examples';
import './GameScreen.css';

export function GameScreen() {
  const { state, dispatch } = useGame();
  const { phase, config, scores, round, usedLetters, remainingLetters, currentCategories, currentLetter } = state;
  const { noTimer } = useTimer();

  useSpeech();

  const isScoring = phase === 'scoring';
  const isAnnouncing = phase === 'announcing';
  const isPlaying = phase === 'playing';
  const isPaused = phase === 'paused';
  const isCountdown = phase === 'countdown';
  const isLastRound = remainingLetters.length === 0 && !config.repeatLetters;

  const totalPlayed = usedLetters.length;
  const progressPct = config.repeatLetters
    ? ((totalPlayed % TOTAL_LETTERS) / TOTAL_LETTERS) * 100
    : (totalPlayed / TOTAL_LETTERS) * 100;

  const handleCountdownComplete = useCallback(() => {
    dispatch({ type: 'START_ANNOUNCING' });
  }, [dispatch]);

  function handleNextRound() {
    cancelSpeech();
    // Guardar histórico da ronda actual
    const currentPlayer = config.players[state.currentPlayerIndex];
    const ex = getRandomExample(currentLetter);
    const examples: Partial<Record<string, string>> = {};
    if (ex) for (const cat of currentCategories) examples[cat] = ex[cat as keyof typeof ex];

    dispatch({
      type: 'SAVE_ROUND_HISTORY',
      payload: {
        round,
        letter: currentLetter,
        playerName: currentPlayer?.name ?? '',
        categories: currentCategories,
        answers: [],
        examples,
      },
    });

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

  useEffect(() => { return () => cancelSpeech(); }, []);

  return (
    <div className="game-screen">
      <div className="app-bg" />

      {isCountdown && <Countdown onComplete={handleCountdownComplete} />}

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-panel animate-scale-in">
            <div className="pause-icon">⏸</div>
            <div className="pause-title">Jogo em pausa</div>
            <Button variant="primary" size="lg" fullWidth onClick={handleResume}>▶ Continuar</Button>
            <Button variant="ghost" size="sm" onClick={handleSkipLetter}>Saltar esta letra</Button>
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
          <span className="letter-progress-text">
            {config.repeatLetters ? `Ronda ${round}` : `${totalPlayed} / ${TOTAL_LETTERS}`}
          </span>
        </div>

        {/* Letra */}
        <LetterDisplay letter={currentLetter} isAnnouncing={isAnnouncing} />

        {/* Timer */}
        {!noTimer && <TimerBar />}

        {/* Jogador actual */}
        <PlayerPanel />

        {/* Categorias */}
        <CategoryDisplay
          categories={currentCategories}
          isAnnouncing={isAnnouncing}
          isScoring={isScoring}
          currentLetter={currentLetter}
        />

        {/* Campo de resposta */}
        {isPlaying && (
          <AnswerInput
            currentLetter={currentLetter}
            currentCategory={currentCategories[0]}
            onValidAnswer={() => dispatch({ type: 'ADD_POINT', payload: { playerId: config.players[state.currentPlayerIndex]?.id ?? '' } })}
          />
        )}

        {/* Pontuações */}
        <ScoreControls />

        {/* Histórico de letras */}
        <LetterHistory />

        {/* Histórico de rondas */}
        {isScoring && <RoundHistory />}

        {/* Acções */}
        <div className="game-actions animate-slide-up" style={{ animationDelay: '300ms' }}>
          {isPlaying && (
            <div className="game-playing-actions">
              <Button variant="ghost" size="sm" onClick={handleSkip}>⏭ Terminar ronda</Button>
              {!noTimer && <Button variant="ghost" size="sm" onClick={handlePause}>⏸ Pausar</Button>}
            </div>
          )}

          {isScoring && (
            <Button variant="primary" size="lg" fullWidth onClick={handleNextRound} className="next-btn">
              {isLastRound ? '🏆 Ver resultados' : '➡️ Próxima ronda'}
            </Button>
          )}

          {(isAnnouncing || isCountdown) && (
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
