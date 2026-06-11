import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import {
  createRoom, joinRoom, watchRoom, startOnlineGame, deleteRoom,
  type OnlineRoom, type OnlinePlayer,
} from '@/services/firebaseService';
import { ALPHABET_PT, pickRandomLetter, removeLetter } from '@/utils/alphabet';
import { OnlineGame } from './OnlineGame';
import './OnlineLobby.css';

const PLAYER_COLORS = ['#6c63ff','#ff6b9d','#4ade80','#fbbf24','#60a5fa','#f87171','#a78bfa','#34d399'];
const DEFAULT_EMOJIS = ['😀','😎','🤩','🥳','🦁','🐯','🐻','🦊'];

function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}

type LobbyScreen = 'menu' | 'create' | 'join' | 'waiting' | 'game';

export function OnlineLobby() {
  const { dispatch } = useGame();
  const [screen, setScreen] = useState<LobbyScreen>('menu');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [myPlayerId] = useState(() => generatePlayerId());
  const [myEmoji] = useState(() => DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unwatch, setUnwatch] = useState<(() => void) | null>(null);

  // Limpar listener ao sair
  useEffect(() => {
    return () => { unwatch?.(); };
  }, [unwatch]);

  // Observar sala quando em waiting ou game
  useEffect(() => {
    if (!room?.code) return;
    const stop = watchRoom(room.code, (updated) => {
      if (updated) {
        setRoom(updated);
        if (updated.phase !== 'waiting' && screen === 'waiting') {
          setScreen('game');
        }
      }
    });
    setUnwatch(() => stop);
    return stop;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code]);

  async function handleCreate() {
    if (playerName.trim().length < 2) { setError('Nome deve ter pelo menos 2 letras.'); return; }
    setLoading(true); setError('');

    const firstLetter = pickRandomLetter(ALPHABET_PT);
    const remaining = removeLetter(ALPHABET_PT, firstLetter);
    // Sortear categoria inicial
    const cats = ['pais','nome','cor','animal','objeto'] as const;
    const firstCategory = cats[Math.floor(Math.random() * cats.length)];

    const player: OnlinePlayer = {
      id: myPlayerId,
      name: playerName.trim(),
      emoji: myEmoji,
      score: 0,
      isHost: true,
    };

    try {
      const code = await createRoom(player, 60, remaining, firstLetter, firstCategory);
      setRoomCode(code);
      setScreen('waiting');
    } catch {
      setError('Erro ao criar sala. Verifica a ligação à internet.');
    }
    setLoading(false);
  }

  async function handleJoin() {
    if (playerName.trim().length < 2) { setError('Nome deve ter pelo menos 2 letras.'); return; }
    if (roomCode.trim().length !== 4) { setError('Código deve ter 4 caracteres.'); return; }
    setLoading(true); setError('');

    const player: OnlinePlayer = {
      id: myPlayerId,
      name: playerName.trim(),
      emoji: myEmoji,
      score: 0,
      isHost: false,
    };

    try {
      const joined = await joinRoom(roomCode.trim().toUpperCase(), player);
      if (!joined) { setError('Sala não encontrada ou já iniciada.'); setLoading(false); return; }
      setRoom(joined);
      setScreen('waiting');
    } catch {
      setError('Erro ao entrar na sala. Verifica o código.');
    }
    setLoading(false);
  }

  async function handleStart() {
    if (!room) return;
    if (Object.keys(room.players).length < 2) { setError('Precisas de pelo menos 2 jogadores.'); return; }
    await startOnlineGame(room.code);
  }

  async function handleLeave() {
    unwatch?.();
    if (room && room.hostId === myPlayerId) {
      await deleteRoom(room.code);
    }
    setRoom(null);
    setScreen('menu');
    setRoomCode('');
    setError('');
  }

  const amHost = room?.hostId === myPlayerId;
  const players = room ? Object.values(room.players) : [];

  // Ecrã de jogo online
  if (screen === 'game' && room) {
    return (
      <OnlineGame
        room={room}
        myPlayerId={myPlayerId}
        amHost={amHost}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <div className="online-lobby">
      <div className="app-bg" />
      <div className="online-content">

        {/* Header */}
        <div className="online-header animate-slide-up">
          <button className="online-back-btn" onClick={() => {
            if (screen === 'menu') dispatch({ type: 'GO_TO_SETUP' });
            else { handleLeave(); }
          }}>←</button>
          <Logo size="sm" showName={false} />
          <div style={{ width: 40 }} />
        </div>

        {/* Menu principal */}
        {screen === 'menu' && (
          <div className="animate-scale-in">
            <div className="online-title-section">
              <h1 className="online-title">Multijogador</h1>
              <p className="online-subtitle">Joga com amigos noutro dispositivo</p>
            </div>

            <Card className="online-name-card">
              <div className="section-header">
                <span className="section-icon">{myEmoji}</span>
                <div>
                  <h2 className="section-title">O teu nome</h2>
                </div>
              </div>
              <input
                className="online-name-input"
                type="text"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                placeholder="Como te chamas?"
                maxLength={20}
              />
            </Card>

            <div className="online-actions">
              <Button variant="primary" size="lg" fullWidth onClick={() => { setError(''); setScreen('create'); }}>
                🏠 Criar sala
              </Button>
              <Button variant="secondary" size="lg" fullWidth onClick={() => { setError(''); setScreen('join'); }}>
                🚪 Entrar numa sala
              </Button>
            </div>
          </div>
        )}

        {/* Criar sala */}
        {screen === 'create' && (
          <div className="animate-scale-in">
            <h1 className="online-title">Criar sala</h1>
            <p className="online-subtitle">A jogar como <strong>{playerName || '?'}</strong></p>

            <Card>
              <p className="online-info-text">
                Será gerado um código de 4 letras. Partilha-o com os outros jogadores para entrarem.
              </p>
            </Card>

            {error && <div className="online-error">{error}</div>}

            <Button variant="primary" size="lg" fullWidth onClick={handleCreate} disabled={loading}>
              {loading ? 'A criar…' : '🎮 Criar sala'}
            </Button>
          </div>
        )}

        {/* Entrar em sala */}
        {screen === 'join' && (
          <div className="animate-scale-in">
            <h1 className="online-title">Entrar na sala</h1>
            <p className="online-subtitle">A jogar como <strong>{playerName || '?'}</strong></p>

            <Card>
              <div className="section-header">
                <span className="section-icon">🔑</span>
                <div><h2 className="section-title">Código da sala</h2></div>
              </div>
              <input
                className="online-code-input"
                type="text"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Ex: XKJF"
                maxLength={4}
              />
            </Card>

            {error && <div className="online-error">{error}</div>}

            <Button variant="primary" size="lg" fullWidth onClick={handleJoin} disabled={loading}>
              {loading ? 'A entrar…' : '🚪 Entrar'}
            </Button>
          </div>
        )}

        {/* Sala de espera */}
        {screen === 'waiting' && room && (
          <div className="animate-scale-in">
            <div className="room-code-display">
              <span className="room-code-label">Código da sala</span>
              <span className="room-code-value">{room.code}</span>
              <span className="room-code-hint">Partilha este código com os outros jogadores</span>
            </div>

            <Card>
              <div className="section-header">
                <span className="section-icon">👥</span>
                <div>
                  <h2 className="section-title">Jogadores</h2>
                  <p className="section-desc">{players.length} na sala</p>
                </div>
              </div>
              <div className="waiting-players">
                {players.map((p, i) => (
                  <div key={p.id} className="waiting-player">
                    <div className="waiting-player-avatar" style={{ background: `${PLAYER_COLORS[i % PLAYER_COLORS.length]}22`, borderColor: `${PLAYER_COLORS[i % PLAYER_COLORS.length]}44` }}>
                      <span>{p.emoji}</span>
                    </div>
                    <span className="waiting-player-name">{p.name}</span>
                    {p.isHost && <span className="waiting-host-badge">Host</span>}
                    {p.id === myPlayerId && <span className="waiting-you-badge">Tu</span>}
                  </div>
                ))}
              </div>
            </Card>

            {error && <div className="online-error">{error}</div>}

            {amHost ? (
              <Button variant="primary" size="lg" fullWidth onClick={handleStart}
                disabled={players.length < 2}>
                {players.length < 2 ? 'À espera de jogadores…' : '🎮 Iniciar jogo'}
              </Button>
            ) : (
              <div className="waiting-hint animate-fade-in">
                <span className="pulse-dot" />
                À espera que o host inicie…
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={handleLeave}>
              Sair da sala
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
