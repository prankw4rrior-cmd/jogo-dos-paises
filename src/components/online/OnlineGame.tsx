import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Countdown } from '@/components/game/Countdown';
import { LetterDisplay } from '@/components/game/LetterDisplay';
import {
  setOnlinePhase, nextOnlineRound, endOnlineGame,
  setPlayerAnswer, addScore, watchRoom,
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

export function OnlineGame({ room, myPlayerId, onLeave }: OnlineGameProps) {
  const [localRoom, setLocalRoom] = useState(room);
  const [answer, setAnswer] = useState('');
  const [listening, setListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(room.timePerRound);
  const [timerActive, setTimerActive] = useState(false);

  const phase = localRoom.phase;
  const mode = localRoom.mode;
  const catInfo = CATEGORY_INFO[localRoom.currentCategory];
  const players = Object.values(localRoom.players);
  const otherPlayer = players.find(p => p.id !== myPlayerId);
  const myAnswer = localRoom.answers?.[myPlayerId];
  const otherAnswer = otherPlayer ? localRoom.answers?.[otherPlayer.id] : undefined;
  const isLastRound = localRoom.remainingLetters.length === 0;

  // Observar sala
  useEffect(() => {
    const stop = watchRoom(room.code, (updated) => {
      if (updated) setLocalRoom(updated);
    });
    return stop;
  }, [room.code]);

  // Timer
  useEffect(() => {
    if (phase === 'playing') {
      setTimeLeft(localRoom.timePerRound);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, localRoom.round]);

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
        void handleTimeUp();
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
  }, [localRoom.currentLetter, localRoom.currentCategory]);

  // Verificar se a ronda deve avançar (ambos terminaram)
  useEffect(() => {
    if (phase !== 'playing') return;
    const me = localRoom.answers?.[myPlayerId];
    const other = otherPlayer ? localRoom.answers?.[otherPlayer.id] : undefined;

    const meDone = me && me.status !== 'pending';
    const otherDone = !otherPlayer || (other && other.status !== 'pending');

    if (meDone && otherDone) {
      // Pequeno delay para garantir sincronização
      const t = setTimeout(() => void setOnlinePhase(room.code, 'scoring'), 600);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localRoom.answers, phase]);

  const handleCountdownComplete = useCallback(() => {
    void setOnlinePhase(room.code, 'playing');
  }, [room.code]);

  async function handleTimeUp() {
    // Quem ainda está 'pending' passa a 'wrong' (perdeu por tempo)
    const me = localRoom.answers?.[myPlayerId];
    if (!me || me.status === 'pending') {
      await setPlayerAnswer(room.code, myPlayerId, { text: answer.trim(), status: 'wrong' });
    }
  }

  async function handleMark(correct: boolean) {
    if (myAnswer?.status !== undefined && myAnswer.status !== 'pending') return;
    const trimmed = answer.trim();
    if (!trimmed) return;

    if (correct) {
      await setPlayerAnswer(room.code, myPlayerId, { text: trimmed, status: 'correct' });
      await addScore(room.code, myPlayerId, 1);
      playPoint();
    } else {
      await setPlayerAnswer(room.code, myPlayerId, { text: trimmed, status: 'wrong' });
    }
  }

  function handleGiveUp() {
    void setPlayerAnswer(room.code, myPlayerId, { text: answer.trim(), status: 'gaveup' });
  }

  function handleMic() {
    if (listening) { stopRecognition(); setListening(false); return; }
    setListening(true);
    startRecognition(
      (transcript, isFinal) => { setAnswer(transcript); if (isFinal) setListening(false); },
      () => setListening(false),
      () => setListening(false)
    );
  }

  async function handleNextRound() {
    if (isLastRound) { await endOnlineGame(room.code); return; }
    const nextLetter = pickRandomLetter(localRoom.remainingLetters);
    const newRemaining = removeLetter(localRoom.remainingLetters, nextLetter);
    const nextCat = ALL_CATS[Math.floor(Math.random() * ALL_CATS.length)];
    await nextOnlineRound(
      room.code, nextLetter, nextCat,
      [...localRoom.usedLetters, nextLetter], newRemaining, localRoom.round + 1
    );
  }

  const timePct = (timeLeft / localRoom.timePerRound) * 100;
  const timerColor = timeLeft <= 10 ? 'var(--danger)' : timeLeft <= 20 ? 'var(--warning)' : 'var(--accent)';

  const myStatus = myAnswer?.status ?? 'pending';
  const isFinalForMe = myStatus === 'correct' || myStatus === 'gaveup' || (myStatus === 'wrong' && timeLeft === 0);

  // ─── Fim do jogo ──────────────────────────────────────────────────────
  if (phase === 'finished') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const isTie = sorted.length === 2 && sorted[0].score === sorted[1].score;
    return (
      <div className="online-game-screen">
        <div className="app-bg" />
        <Confetti />
        <div className="online-game-content">
          <div className="og-finished-header">
            <div className="og-trophy">{mode === 'team' ? '🤝' : '🏆'}</div>
            <h1>Fim do jogo!</h1>
            {mode === 'team' ? (
              <p>Pontuação final da equipa: <strong>{sorted[0]?.score ?? 0}</strong></p>
            ) : isTie ? (
              <p>Empate!</p>
            ) : (
              <p>Parabéns, <strong>{sorted[0]?.name}</strong>!</p>
            )}
          </div>

          <Card>
            <div className="og-final-scores">
              {sorted.map((p, i) => (
                <div key={p.id} className="og-final-row">
                  <span className="og-final-rank">{mode === 'versus' ? (['🥇','🥈'][i] ?? '') : '🤝'}</span>
                  <span className="og-final-emoji">{p.emoji}</span>
                  <span className="og-final-name">{p.name}</span>
                  <span className="og-final-score">{p.score} pts</span>
                </div>
              ))}
            </div>
          </Card>

          <Button variant="primary" size="lg" fullWidth onClick={onLeave}>Voltar ao menu</Button>
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
          <div className="og-round-badge">
            {mode === 'team' ? '🤝' : '⚔️'} Ronda {localRoom.round}
          </div>
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

        {/* ─── FASE: PLAYING ─────────────────────────────────────── */}
        {phase === 'playing' && (
          <>
            {/* Estado do adversário */}
            {otherPlayer && (
              <div className={`og-opponent-status ${otherAnswer?.status === 'correct' ? 'og-opp-correct' : otherAnswer?.status === 'wrong' ? 'og-opp-wrong' : otherAnswer?.status === 'gaveup' ? 'og-opp-gaveup' : ''}`}>
                <span className="og-opponent-emoji">{otherPlayer.emoji}</span>
                <span className="og-opponent-name">{otherPlayer.name}</span>
                <span className="og-opponent-state">
                  {mode === 'team' ? (
                    otherAnswer?.status === 'correct' ? '✓ Acertou!' :
                    otherAnswer?.status === 'wrong' ? `Tentou: "${otherAnswer.text}" ✗` :
                    otherAnswer?.text ? `A escrever: "${otherAnswer.text}"` : 'A pensar…'
                  ) : (
                    otherAnswer?.status === 'correct' ? '✓ Já acertou!' :
                    otherAnswer?.status === 'wrong' ? '✗ Ainda a tentar…' :
                    otherAnswer?.status === 'gaveup' ? 'Desistiu' :
                    'A pensar…'
                  )}
                </span>
              </div>
            )}

            {/* Input de resposta */}
            {!isFinalForMe && (
              <div className="og-answer-section">
                {myStatus === 'wrong' && (
                  <div className="og-retry-hint">✗ "{myAnswer?.text}" não estava certo. Tenta outra vez!</div>
                )}
                <div className="og-answer-row">
                  <input
                    className="og-answer-input" type="text" value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder={`Palavra com ${localRoom.currentLetter}…`}
                    maxLength={40} disabled={listening} autoComplete="off" autoCapitalize="none"
                  />
                  {isRecognitionSupported() && (
                    <button className={`og-mic-btn ${listening ? 'og-mic-active' : ''}`} onClick={handleMic}>
                      {listening ? '⏹' : '🎤'}
                    </button>
                  )}
                </div>

                {/* Validação: começa pela letra? */}
                {answer.trim().length >= 2 && startsWithLetter(answer, localRoom.currentLetter) && (
                  <div className="og-mark-btns">
                    <button className="og-mark-correct" onClick={() => void handleMark(true)}>✓ Acertei!</button>
                    <button className="og-mark-wrong" onClick={() => void handleMark(false)}>✗ Não sei</button>
                  </div>
                )}

                {answer.trim().length >= 2 && !startsWithLetter(answer, localRoom.currentLetter) && (
                  <div className="og-letter-warning">"{answer}" não começa por {localRoom.currentLetter.toUpperCase()}</div>
                )}

                <button className="og-giveup-btn" onClick={handleGiveUp}>Desistir desta ronda</button>
              </div>
            )}

            {/* Estado final do próprio jogador */}
            {isFinalForMe && (
              <Card className={`og-my-status ${myStatus === 'correct' ? 'og-status-correct' : 'og-status-other'}`}>
                {myStatus === 'correct' && <div className="og-status-text">✓ Acertaste: "{myAnswer?.text}"</div>}
                {myStatus === 'gaveup' && <div className="og-status-text">Desististe desta ronda.</div>}
                {myStatus === 'wrong' && timeLeft === 0 && <div className="og-status-text">✗ Tempo esgotado.</div>}
                <div className="og-status-hint">
                  {mode === 'team' ? 'À espera do teu colega de equipa…' : 'À espera do adversário…'}
                </div>
              </Card>
            )}
          </>
        )}

        {/* ─── FASE: SCORING ─────────────────────────────────────── */}
        {phase === 'scoring' && (
          <>
            <Card>
              <div className="og-round-summary">
                {players.map(p => {
                  const ans = localRoom.answers?.[p.id];
                  return (
                    <div key={p.id} className="og-summary-row">
                      <span className="og-summary-emoji">{p.emoji}</span>
                      <span className="og-summary-name">{p.name}</span>
                      <span className="og-summary-answer">
                        {ans?.status === 'correct' && `✓ "${ans.text}"`}
                        {ans?.status === 'wrong' && `✗ "${ans.text || '—'}"`}
                        {ans?.status === 'gaveup' && 'Desistiu'}
                        {!ans && '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <div className="og-scores">
                {players.map(p => (
                  <div key={p.id} className="og-score-row">
                    <span>{p.emoji}</span>
                    <span className="og-score-name">{p.name}</span>
                    <span className="og-score-pts">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </Card>

            <Button variant="primary" size="lg" fullWidth onClick={() => void handleNextRound()}>
              {isLastRound ? '🏆 Ver resultados' : '➡️ Próxima ronda'}
            </Button>
          </>
        )}

      </div>
    </div>
  );
}
