import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Countdown } from '@/components/game/Countdown';
import { LetterDisplay } from '@/components/game/LetterDisplay';
import {
  setOnlinePhase, nextOnlineRound, endOnlineGame,
  submitAnswer, voteAnswer, watchRoom,
  type OnlineRoom,
} from '@/services/firebaseService';
import { pickRandomLetter, removeLetter } from '@/utils/alphabet';
import { startsWithLetter } from '@/services/dictionaryService';
import { playPoint, playTimeUp, vibrateTimeUp } from '@/services/soundService';
import { isRecognitionSupported, startRecognition, stopRecognition } from '@/services/recognitionService';
import { Confetti } from '@/components/ui/Confetti';
import type { CategoryKey } from '@/types';
import './OnlineGame.css';

const CATEGORY_INFO: Record<CategoryKey, { label: string; emoji: string; color: string }> = {
  pais:      { label: 'País',      emoji: '🌍', color: '#6c63ff' },
  nome:      { label: 'Nome',      emoji: '👤', color: '#ff6b9d' },
  cor:       { label: 'Cor',       emoji: '🎨', color: '#4ade80' },
  animal:    { label: 'Animal',    emoji: '🐾', color: '#fbbf24' },
  objeto:    { label: 'Objeto',    emoji: '📦', color: '#60a5fa' },
  fruta:     { label: 'Fruta',     emoji: '🍎', color: '#f87171' },
  cidade:    { label: 'Cidade',    emoji: '🏙️', color: '#a78bfa' },
  profissao: { label: 'Profissão', emoji: '💼', color: '#34d399' },
  marca:     { label: 'Marca',     emoji: '🏷️', color: '#fb923c' },
  filme:     { label: 'Filme',     emoji: '🎬', color: '#e879f9' },
};

const ALL_CATS: CategoryKey[] = ['pais','nome','cor','animal','objeto','fruta','cidade','profissao','marca','filme'];

interface OnlineGameProps {
  room: OnlineRoom;
  myPlayerId: string;
  amHost: boolean;
  onLeave: () => void;
}

export function OnlineGame({ room, myPlayerId, amHost, onLeave }: OnlineGameProps) {
  const [localRoom, setLocalRoom] = useState(room);
  const [answer, setAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [listening, setListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(room.timePerRound);
  const [timerActive, setTimerActive] = useState(false);

  const phase = localRoom.phase;
  const catInfo = CATEGORY_INFO[localRoom.currentCategory];
  const players = Object.values(localRoom.players).sort((a, b) => b.score - a.score);
  const myAnswer = localRoom.answers?.[myPlayerId];
  const isLastRound = localRoom.remainingLetters.length === 0;

  // Observar sala
  useEffect(() => {
    const stop = watchRoom(room.code, (updated) => {
      if (updated) setLocalRoom(updated);
    });
    return stop;
  }, [room.code]);

  // Timer local
  useEffect(() => {
    if (phase === 'playing') {
      setTimeLeft(localRoom.timePerRound);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (!timerActive) return;
    const endTime = Date.now() + timeLeft * 1000;
    const interval = setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        setTimerActive(false);
        playTimeUp();
        vibrateTimeUp();
        if (amHost && phase === 'playing') {
          void setOnlinePhase(room.code, 'scoring');
        }
      } else {
        setTimeLeft(remaining);
      }
    }, 200);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive]);

  // Reset answer ao mudar de ronda
  useEffect(() => {
    setAnswer('');
    setAnswerSubmitted(false);
  }, [localRoom.currentLetter, localRoom.currentCategory]);

  const handleCountdownComplete = useCallback(() => {
    if (amHost) void setOnlinePhase(room.code, 'playing');
  }, [amHost, room.code]);

  async function handleSubmitAnswer() {
    const trimmed = answer.trim();
    if (!trimmed || answerSubmitted) return;
    if (!startsWithLetter(trimmed, localRoom.currentLetter)) return;
    setAnswerSubmitted(true);
    await submitAnswer(room.code, myPlayerId, trimmed);
  }

  async function handleVote(valid: boolean) {
    if (!myAnswer || myAnswer.valid !== null) return;
    await voteAnswer(room.code, myPlayerId, valid);
    if (valid) { playPoint(); }
  }

  function handleMic() {
    if (listening) { stopRecognition(); setListening(false); return; }
    setListening(true);
    startRecognition(
      (transcript, isFinal) => {
        setAnswer(transcript);
        if (isFinal) { setListening(false); }
      },
      () => setListening(false),
      () => setListening(false)
    );
  }

  async function handleNextRound() {
    if (!amHost) return;
    if (isLastRound) {
      await endOnlineGame(room.code);
      return;
    }
    const nextLetter = pickRandomLetter(localRoom.remainingLetters);
    const newRemaining = removeLetter(localRoom.remainingLetters, nextLetter);
    const nextCat = ALL_CATS[Math.floor(Math.random() * ALL_CATS.length)];
    await nextOnlineRound(
      room.code, nextLetter, nextCat,
      [...localRoom.usedLetters, nextLetter],
      newRemaining,
      localRoom.round + 1
    );
  }

  const timePct = (timeLeft / localRoom.timePerRound) * 100;
  const timerColor = timeLeft <= 10 ? 'var(--danger)' : timeLeft <= 20 ? 'var(--warning)' : 'var(--accent)';

  // Fim do jogo
  if (phase === 'finished') {
    return (
      <div className="online-game-screen">
        <div className="app-bg" />
        <Confetti />
        <div className="online-game-content">
          <div className="og-finished-header">
            <div className="og-trophy">🏆</div>
            <h1>Fim do jogo!</h1>
            {players[0] && <p>Parabéns, <strong>{players[0].name}</strong>!</p>}
          </div>

          <Card>
            <div className="og-final-scores">
              {players.map((p, i) => (
                <div key={p.id} className="og-final-row">
                  <span className="og-final-rank">{['🥇','🥈','🥉'][i] ?? `#${i+1}`}</span>
                  <span className="og-final-emoji">{p.emoji}</span>
                  <span className="og-final-name">{p.name}</span>
                  <span className="og-final-score">{p.score} pts</span>
                </div>
              ))}
            </div>
          </Card>

          <Button variant="primary" size="lg" fullWidth onClick={onLeave}>
            Voltar ao menu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="online-game-screen">
      <div className="app-bg" />

      {phase === 'countdown' && <Countdown onComplete={handleCountdownComplete} />}

      <div className="online-game-content">

        {/* Header */}
        <div className="og-header">
          <div className="og-round-badge">Ronda {localRoom.round}</div>
          <div className="og-players-mini">
            {players.map(p => (
              <div key={p.id} className="og-player-mini">
                <span>{p.emoji}</span>
                <span className="og-player-mini-score">{p.score}</span>
              </div>
            ))}
          </div>
          <button className="og-leave-btn" onClick={onLeave}>✕</button>
        </div>

        {/* Letra */}
        <LetterDisplay letter={localRoom.currentLetter} isAnnouncing={phase === 'countdown'} />

        {/* Timer */}
        {phase === 'playing' && (
          <div className="og-timer">
            <div className="og-timer-bar">
              <div className="og-timer-fill" style={{ width: `${timePct}%`, background: timerColor }} />
            </div>
            <span className="og-timer-value" style={{ color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {timeLeft}s
            </span>
          </div>
        )}

        {/* Categoria */}
        <div className="og-category" style={{ '--cat-color': catInfo.color } as React.CSSProperties}>
          <span className="og-category-emoji">{catInfo.emoji}</span>
          <div>
            <div className="og-category-label">Categoria</div>
            <div className="og-category-name">{catInfo.label}</div>
          </div>
        </div>

        {/* Campo de resposta */}
        {phase === 'playing' && !answerSubmitted && (
          <div className="og-answer-section">
            <div className="og-answer-row">
              <input
                className="og-answer-input"
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && void handleSubmitAnswer()}
                placeholder={`Palavra com ${localRoom.currentLetter}…`}
                maxLength={40}
                disabled={listening}
                autoComplete="off"
                autoCapitalize="none"
              />
              {isRecognitionSupported() && (
                <button className={`og-mic-btn ${listening ? 'og-mic-active' : ''}`} onClick={handleMic}>
                  {listening ? '⏹' : '🎤'}
                </button>
              )}
              <button
                className="og-submit-btn"
                onClick={() => void handleSubmitAnswer()}
                disabled={answer.trim().length < 2 || listening}
              >→</button>
            </div>
          </div>
        )}

        {/* Resposta submetida */}
        {phase === 'playing' && answerSubmitted && (
          <Card className="og-submitted">
            <div className="og-submitted-text">Resposta enviada: <strong>{answer}</strong></div>
            <div className="og-submitted-hint">À espera que o tempo acabe…</div>
          </Card>
        )}

        {/* Votação */}
        {(phase === 'voting' || phase === 'scoring') && (
          <div className="og-voting-section">
            {Object.values(localRoom.answers ?? {}).map(ans => {
              const p = localRoom.players[ans.playerId];
              if (!p) return null;
              return (
                <Card key={ans.playerId} className="og-vote-card">
                  <div className="og-vote-player">
                    <span>{p.emoji}</span>
                    <span>{p.name}</span>
                  </div>
                  <div className="og-vote-answer">"{ans.text}"</div>
                  {ans.valid === null ? (
                    <div className="og-vote-btns">
                      <button className="og-vote-valid" onClick={() => void handleVote(true)}>✓ Válido</button>
                      <button className="og-vote-invalid" onClick={() => void handleVote(false)}>✗ Inválido</button>
                    </div>
                  ) : (
                    <div className={`og-vote-result ${ans.valid ? 'og-result-ok' : 'og-result-err'}`}>
                      {ans.valid ? '✓ Aceite' : '✗ Rejeitado'}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Pontuações */}
        {phase === 'scoring' && (
          <Card>
            <div className="og-scores">
              {players.map((p, i) => (
                <div key={p.id} className="og-score-row">
                  <span className="og-score-rank">#{i+1}</span>
                  <span>{p.emoji}</span>
                  <span className="og-score-name">{p.name}</span>
                  <span className="og-score-pts">{p.score} pts</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Próxima ronda (só host) */}
        {phase === 'scoring' && amHost && (
          <Button variant="primary" size="lg" fullWidth onClick={() => void handleNextRound()}>
            {isLastRound ? '🏆 Ver resultados' : '➡️ Próxima ronda'}
          </Button>
        )}

        {phase === 'scoring' && !amHost && (
          <div className="waiting-hint animate-fade-in">
            <span className="pulse-dot" />
            À espera que o host avance…
          </div>
        )}

      </div>
    </div>
  );
}
