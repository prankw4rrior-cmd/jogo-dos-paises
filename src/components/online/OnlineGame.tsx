import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Countdown } from '@/components/game/Countdown';
import { LetterDisplay } from '@/components/game/LetterDisplay';
import { Confetti } from '@/components/ui/Confetti';
import { ConnectionBanner } from './ConnectionBanner';
import {
  setOnlinePhase, nextOnlineRound, endOnlineGame, rematch,
  setPlayerAnswer, addScore, watchRoom, sendChatEmoji,
  type OnlineRoom,
} from '@/services/firebaseService';
import { ALPHABET_PT, pickRandomLetter, removeLetter } from '@/utils/alphabet';
import { startsWithLetter } from '@/services/dictionaryService';
import { playPoint, playTimeUp, vibrateTimeUp } from '@/services/soundService';
import { isRecognitionSupported, startRecognition, stopRecognition } from '@/services/recognitionService';
import { announceRound, cancelSpeech, isSpeechSupported } from '@/services/speechService';
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

const QUICK_EMOJIS = ['👍','😂','🔥','😱','🎉','👏','😅','🤔','💪','🥳'];

function pickCategories(selected: CategoryKey[], count: number): CategoryKey[] {
  const pool = [...selected];
  const n = Math.min(count, pool.length);
  const result: CategoryKey[] = [];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

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
  const [timeLeft, setTimeLeft] = useState(room.config.timePerRound || 60);
  const [timerActive, setTimerActive] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatFlash, setChatFlash] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = localRoom.phase;
  const mode = localRoom.mode;
  const noTimer = localRoom.config.timePerRound === 0;
  const cats = localRoom.currentCategories ?? [];
  const players = Object.values(localRoom.players);
  const otherPlayer = players.find(p => p.id !== myPlayerId);
  const myAnswer = localRoom.answers?.[myPlayerId];
  const otherAnswer = otherPlayer ? localRoom.answers?.[otherPlayer.id] : undefined;
  const isLastRound = localRoom.remainingLetters.length === 0;
  const myStatus = myAnswer?.status ?? 'pending';
  const isFinalForMe = myStatus === 'correct' || myStatus === 'gaveup' || (myStatus === 'wrong' && timeLeft === 0 && !noTimer);

  // Observar sala
  useEffect(() => {
    const stop = watchRoom(room.code, (updated) => {
      if (updated) {
        // Detectar se o outro jogador saiu (sala ainda existe mas só tem 1 jogador)
        const playerCount = Object.keys(updated.players).length;
        if (playerCount < 2 && localRoom.phase !== 'finished' && Object.keys(localRoom.players).length === 2) {
          // O outro jogador abandonou — terminar o jogo
          setLocalRoom({ ...updated, phase: 'finished' });
          return;
        }
        setLocalRoom(updated);
      } else {
        // Sala foi apagada (o host saiu) — voltar ao menu
        onLeave();
      }
    });
    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.code]);

  // Mostrar emojis do chat
  useEffect(() => {
    const messages = Object.values(localRoom.chat ?? {});
    if (messages.length === 0) return;
    const latest = messages.sort((a, b) => b.ts - a.ts)[0];
    if (Date.now() - latest.ts < 3000) {
      const p = localRoom.players[latest.playerId];
      setChatFlash(`${p?.emoji ?? ''} ${latest.emoji}`);
      const t = setTimeout(() => setChatFlash(null), 2500);
      return () => clearTimeout(t);
    }
  }, [localRoom.chat, localRoom.players]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      cancelSpeech();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Voz ao iniciar ronda
  useEffect(() => {
    if (phase !== 'countdown') return;
    cancelSpeech();
  }, [phase, localRoom.currentLetter]);

  // Timer
  useEffect(() => {
    if (phase === 'playing' && !noTimer) {
      setTimeLeft(localRoom.config.timePerRound);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, localRoom.round]);

  useEffect(() => {
    if (!timerActive) return;
    const endTime = Date.now() + timeLeft * 1000;
    timerRef.current = setInterval(() => {
      const remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        setTimeLeft(0);
        setTimerActive(false);
        playTimeUp();
        vibrateTimeUp();
        void handleTimeUp();
      } else {
        setTimeLeft(remaining);
      }
    }, 200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive]);

  // Reset ao mudar de ronda
  useEffect(() => {
    setAnswer('');
  }, [localRoom.currentLetter, localRoom.round]);

  // Verificar quando a ronda deve avançar para scoring
  useEffect(() => {
    if (phase !== 'playing') return;
    const me = localRoom.answers?.[myPlayerId];
    const other = otherPlayer ? localRoom.answers?.[otherPlayer.id] : undefined;

    let shouldAdvance = false;

    if (mode === 'team') {
      // Modo equipa: avança quando QUALQUER jogador acerta
      const anyCorrect =
        me?.status === 'correct' || other?.status === 'correct';
      // Ou quando ambos desistiram/erraram sem acertar
      const meDone = !!(me && me.status !== 'pending');
      const otherDone = !otherPlayer || !!(other && other.status !== 'pending');
      shouldAdvance = anyCorrect || (meDone && otherDone);
    } else {
      // Modo contra: avança quando ambos terminaram (acertaram, erraram ou desistiram)
      const meDone = !!(me && me.status !== 'pending');
      const otherDone = !otherPlayer || !!(other && other.status !== 'pending');
      shouldAdvance = meDone && otherDone;
    }

    if (shouldAdvance) {
      const t = setTimeout(() => void setOnlinePhase(room.code, 'scoring'), 800);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localRoom.answers, phase]);

  const handleCountdownComplete = useCallback(async () => {
    if (isSpeechSupported()) {
      await announceRound(localRoom.currentLetter);
    }
    void setOnlinePhase(room.code, 'playing');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.code, localRoom.currentLetter]);

  async function handleTimeUp() {
    const me = localRoom.answers?.[myPlayerId];
    if (!me || me.status === 'pending') {
      await setPlayerAnswer(room.code, myPlayerId, { text: answer.trim(), status: 'wrong' });
    }
  }

  async function handleMark(correct: boolean) {
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
    const nextCats = pickCategories(localRoom.config.selectedCategories, localRoom.config.categoriesPerRound);
    await nextOnlineRound(
      room.code, nextLetter, nextCats,
      [...localRoom.usedLetters, nextLetter], newRemaining, localRoom.round + 1
    );
  }

  async function handleRematch() {
    const firstLetter = pickRandomLetter(ALPHABET_PT);
    const remaining = removeLetter(ALPHABET_PT, firstLetter);
    const firstCats = pickCategories(localRoom.config.selectedCategories, localRoom.config.categoriesPerRound);
    await rematch(room.code, firstLetter, firstCats, remaining);
  }

  async function handleSendEmoji(emoji: string) {
    await sendChatEmoji(room.code, myPlayerId, emoji);
    setShowChat(false);
  }

  const timePct = noTimer ? 100 : (timeLeft / localRoom.config.timePerRound) * 100;
  const timerColor = timeLeft <= 10 ? 'var(--danger)' : timeLeft <= 20 ? 'var(--warning)' : 'var(--accent)';

  // ─── FIM DO JOGO ────────────────────────────────────────────────────
  if (phase === 'finished') {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const isTie = sorted.length === 2 && sorted[0].score === sorted[1].score;
    const opponentLeft = players.length < 2;
    return (
      <div className="online-game-screen">
        <div className="app-bg" />
        <ConnectionBanner />
        {!opponentLeft && <Confetti />}
        <div className="online-game-content">
          {opponentLeft && (
            <div className="og-left-notice animate-scale-in">
              ⚠️ O outro jogador saiu da sala. O jogo terminou.
            </div>
          )}
          <div className="og-finished-header">
            <div className="og-trophy">{mode === 'team' ? '🤝' : '🏆'}</div>
            <h1>Fim do jogo!</h1>
            {mode === 'team' ? (
              <p>Pontuação final: <strong>{sorted.reduce((s, p) => s + p.score, 0)} pts</strong></p>
            ) : isTie ? <p>Empate!</p> : (
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
          {!opponentLeft && (
            <Button variant="primary" size="lg" fullWidth onClick={() => void handleRematch()}>🔄 Revanche</Button>
          )}
          <Button variant="secondary" size="md" fullWidth onClick={onLeave}>Voltar ao menu</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="online-game-screen">
      <div className="app-bg" />
      <ConnectionBanner />
      {phase === 'countdown' && <Countdown onComplete={() => void handleCountdownComplete()} />}

      {/* Flash de emoji do chat */}
      {chatFlash && (
        <div className="chat-flash animate-scale-in">{chatFlash}</div>
      )}

      <div className="online-game-content">

        {/* Header */}
        <div className="og-header">
          <div className="og-round-badge">{mode === 'team' ? '🤝' : '⚔️'} Ronda {localRoom.round}</div>
          <div className="og-players-mini">
            {players.map(p => (
              <div key={p.id} className="og-player-mini">
                <span>{p.emoji}</span>
                <span className="og-player-mini-score">{p.score}</span>
              </div>
            ))}
          </div>
          <div className="og-header-actions">
            <button className="og-chat-btn" onClick={() => setShowChat(v => !v)}>💬</button>
            <button className="og-leave-btn" onClick={onLeave}>✕</button>
          </div>
        </div>

        {/* Chat de emojis */}
        {showChat && (
          <div className="chat-panel animate-slide-up">
            {QUICK_EMOJIS.map(e => (
              <button key={e} className="chat-emoji-btn" onClick={() => void handleSendEmoji(e)}>{e}</button>
            ))}
          </div>
        )}

        {/* Letra */}
        <LetterDisplay letter={localRoom.currentLetter} isAnnouncing={phase === 'countdown'} />

        {/* Timer */}
        {!noTimer && phase === 'playing' && (
          <div className="og-timer">
            <div className="og-timer-bar">
              <div className="og-timer-fill" style={{ width: `${timePct}%`, background: timerColor }} />
            </div>
            <span className="og-timer-value" style={{ color: timeLeft <= 10 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {timeLeft}s
            </span>
          </div>
        )}

        {/* Categorias */}
        <div className={`og-categories ${cats.length > 1 ? 'og-multi-cats' : ''}`}>
          {cats.map(cat => {
            const info = CATEGORY_INFO[cat];
            return (
              <div key={cat} className="og-category" style={{ '--cat-color': info.color } as React.CSSProperties}>
                <span className="og-category-emoji">{info.emoji}</span>
                <div>
                  <div className="og-category-label">Categoria</div>
                  <div className="og-category-name">{info.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FASE: PLAYING */}
        {phase === 'playing' && (
          <>
            {/* Estado do adversário */}
            {otherPlayer && (
              <div className={`og-opponent-status ${otherAnswer?.status === 'correct' ? 'og-opp-correct' : otherAnswer?.status === 'gaveup' ? 'og-opp-gaveup' : ''}`}>
                <span className="og-opponent-emoji">{otherPlayer.emoji}</span>
                <span className="og-opponent-name">{otherPlayer.name}</span>
                <span className="og-opponent-state">
                  {mode === 'team' ? (
                    otherAnswer?.status === 'correct' ? '✓ Acertou!' :
                    otherAnswer?.status === 'wrong' ? `Tentou: "${otherAnswer.text}" ✗` :
                    otherAnswer?.text ? `"${otherAnswer.text}"…` : 'A pensar…'
                  ) : (
                    otherAnswer?.status === 'correct' ? '✓ Já acertou!' :
                    otherAnswer?.status === 'gaveup' ? 'Desistiu' :
                    otherAnswer?.status === 'wrong' ? 'A tentar…' : 'A pensar…'
                  )}
                </span>
              </div>
            )}

            {/* Input */}
            {!isFinalForMe && (
              <div className="og-answer-section">
                {myStatus === 'wrong' && (
                  <div className="og-retry-hint">✗ "{myAnswer?.text}" — tenta outra vez!</div>
                )}
                <div className="og-answer-row">
                  <input className="og-answer-input" type="text" value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder={`Palavra com ${localRoom.currentLetter}…`}
                    maxLength={40} disabled={listening} autoComplete="off" autoCapitalize="none" />
                  {isRecognitionSupported() && (
                    <button className={`og-mic-btn ${listening ? 'og-mic-active' : ''}`} onClick={handleMic}>
                      {listening ? '⏹' : '🎤'}
                    </button>
                  )}
                </div>
                {answer.trim().length >= 2 && startsWithLetter(answer, localRoom.currentLetter) && (
                  <div className="og-mark-btns">
                    <button className="og-mark-correct" onClick={() => void handleMark(true)}>✓ Acertei!</button>
                    <button className="og-mark-wrong" onClick={() => void handleMark(false)}>✗ Errei</button>
                  </div>
                )}
                {answer.trim().length >= 2 && !startsWithLetter(answer, localRoom.currentLetter) && (
                  <div className="og-letter-warning">"{answer}" não começa por {localRoom.currentLetter.toUpperCase()}</div>
                )}
                <button className="og-giveup-btn" onClick={handleGiveUp}>Desistir desta ronda</button>
              </div>
            )}

            {isFinalForMe && (
              <Card className={`og-my-status ${myStatus === 'correct' ? 'og-status-correct' : 'og-status-other'}`}>
                {myStatus === 'correct' && <div className="og-status-text">✓ Acertaste: "{myAnswer?.text}"</div>}
                {myStatus === 'gaveup' && <div className="og-status-text">Desististe desta ronda.</div>}
                {myStatus === 'wrong' && <div className="og-status-text">✗ Tempo esgotado.</div>}
                <div className="og-status-hint">
                  {mode === 'team' ? 'À espera do teu colega…' : 'À espera do adversário…'}
                </div>
              </Card>
            )}
          </>
        )}

        {/* FASE: SCORING */}
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
                        {ans?.status === 'correct' && <span style={{color:'var(--success)'}}>✓ "{ans.text}"</span>}
                        {ans?.status === 'wrong' && <span style={{color:'var(--danger)'}}>✗ "{ans.text || '—'}"</span>}
                        {ans?.status === 'gaveup' && <span style={{color:'var(--text-tertiary)'}}>Desistiu</span>}
                        {!ans && <span style={{color:'var(--text-tertiary)'}}>—</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card>
              <div className="og-scores">
                {players.sort((a,b) => b.score - a.score).map(p => (
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
