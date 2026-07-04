import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import { Toggle } from '@/components/ui/Toggle';
import {
  createRoom, joinRoom, watchRoom, startOnlineGame, deleteRoom, removePlayerFromRoom,
  type OnlineRoom, type OnlinePlayer, type RoomMode, type OnlineConfig,
} from '@/services/firebaseService';
import { ALPHABET_PT, pickRandomLetter, removeLetter } from '@/utils/alphabet';
import { OnlineGame } from './OnlineGame';
import { ConnectionBanner } from './ConnectionBanner';
import type { CategoryKey } from '@/types';
import './OnlineLobby.css';

const PLAYER_COLORS = ['#6c63ff', '#ff6b9d'];
const DEFAULT_EMOJIS = ['😀','😎','🤩','🥳','🦁','🐯','🐻','🦊'];
const ALL_CATS: CategoryKey[] = ['pais','nome','cor','animal','objeto','fruta','cidade','profissao','marca','filme'];
const CAT_LABELS: Record<CategoryKey, string> = {
  pais:'País', nome:'Nome', cor:'Cor', animal:'Animal', objeto:'Objeto',
  fruta:'Fruta', cidade:'Cidade', profissao:'Profissão', marca:'Marca', filme:'Filme',
};

function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 10);
}

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

type LobbyScreen = 'menu' | 'mode' | 'config' | 'join' | 'waiting' | 'game';

export function OnlineLobby() {
  const { dispatch } = useGame();
  const [screen, setScreen] = useState<LobbyScreen>('menu');
  const [mode, setMode] = useState<RoomMode>('team');
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [room, setRoom] = useState<OnlineRoom | null>(null);
  const [myPlayerId] = useState(() => generatePlayerId());
  const [myEmoji] = useState(() => DEFAULT_EMOJIS[Math.floor(Math.random() * DEFAULT_EMOJIS.length)]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Config da sala
  const [timePerRound, setTimePerRound] = useState(60);
  const [selectedCats, setSelectedCats] = useState<CategoryKey[]>(['pais','nome','cor','animal','objeto']);
  const [catsPerRound, setCatsPerRound] = useState(1);
  const [noTimer, setNoTimer] = useState(false);

  const stopWatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!room?.code) return;

    // Se já estamos no jogo, o OnlineGame tem o seu próprio listener — não duplicar
    if (screen === 'game') return;

    const stop = watchRoom(room.code, (updated) => {
      if (updated) {
        setRoom(updated);
        if (updated.phase !== 'waiting') {
          setScreen('game');
          // Parar este listener — o OnlineGame vai criar o seu
          stop();
          stopWatchRef.current = null;
        }
      } else {
        setError('A sala foi encerrada.');
        setScreen('menu');
        setRoom(null);
      }
    });

    stopWatchRef.current = stop;
    return () => { stop(); stopWatchRef.current = null; };
  }, [room?.code, screen]);

  function toggleCat(cat: CategoryKey) {
    setSelectedCats(prev =>
      prev.includes(cat)
        ? prev.length > 1 ? prev.filter(c => c !== cat) : prev
        : [...prev, cat]
    );
  }

  async function handleCreate() {
    if (playerName.trim().length < 2) { setError('Nome deve ter pelo menos 2 letras.'); return; }
    setLoading(true); setError('');

    const firstLetter = pickRandomLetter(ALPHABET_PT);
    const remaining = removeLetter(ALPHABET_PT, firstLetter);
    const firstCats = pickCategories(selectedCats, catsPerRound);
    const cfg: OnlineConfig = {
      timePerRound: noTimer ? 0 : timePerRound,
      selectedCategories: selectedCats,
      categoriesPerRound: catsPerRound,
    };

    const player: OnlinePlayer = { id: myPlayerId, name: playerName.trim(), emoji: myEmoji, score: 0, isHost: true };

    try {
      const code = await createRoom(player, mode, cfg, remaining, firstLetter, firstCats);
      setRoom({
        code, mode, hostId: player.id, phase: 'waiting',
        currentLetter: firstLetter, currentCategories: firstCats,
        round: 1, config: cfg,
        usedLetters: [firstLetter], remainingLetters: remaining,
        players: { [player.id]: player }, answers: {}, chat: {},
        createdAt: Date.now(),
      });
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

    const player: OnlinePlayer = { id: myPlayerId, name: playerName.trim(), emoji: myEmoji, score: 0, isHost: false };

    try {
      const joined = await joinRoom(roomCode.trim().toUpperCase(), player);
      if (!joined) { setError('Sala não encontrada, cheia ou já iniciada.'); setLoading(false); return; }
      setRoom(joined);
      setScreen('waiting');
    } catch {
      setError('Erro ao entrar na sala.');
    }
    setLoading(false);
  }

  async function handleStart() {
    if (!room) return;
    if (Object.keys(room.players).length < 2) { setError('Precisas de 2 jogadores.'); return; }
    await startOnlineGame(room.code);
  }

  async function handleLeave() {
    if (room) {
      if (room.hostId === myPlayerId) {
        await deleteRoom(room.code);
      } else {
        await removePlayerFromRoom(room.code, myPlayerId);
      }
    }
    setRoom(null); setScreen('menu'); setRoomCode(''); setError('');
  }

  const amHost = room?.hostId === myPlayerId;
  const players = room ? Object.values(room.players) : [];

  if (screen === 'game' && room) {
    return <OnlineGame room={room} myPlayerId={myPlayerId} amHost={amHost} onLeave={handleLeave} />;
  }

  return (
    <div className="online-lobby">
      <div className="app-bg" />
      <ConnectionBanner />
      <div className="online-content">

        <div className="online-header animate-slide-up">
          <button className="online-back-btn" onClick={() => {
            if (screen === 'menu') dispatch({ type: 'GO_TO_SETUP' });
            else if (screen === 'mode') setScreen('menu');
            else if (screen === 'config') setScreen('mode');
            else if (screen === 'join') setScreen('menu');
            else void handleLeave();
          }}>←</button>
          <Logo size="sm" showName={false} />
          <div style={{ width: 40 }} />
        </div>

        {/* Menu */}
        {screen === 'menu' && (
          <div className="animate-scale-in">
            <div className="online-title-section">
              <h1 className="online-title">Multijogador</h1>
              <p className="online-subtitle">2 jogadores, dispositivos diferentes</p>
            </div>
            <Card className="online-name-card">
              <div className="section-header">
                <span className="section-icon">{myEmoji}</span>
                <div><h2 className="section-title">O teu nome</h2></div>
              </div>
              <input className="online-name-input" type="text" value={playerName}
                onChange={e => setPlayerName(e.target.value)} placeholder="Como te chamas?" maxLength={20} />
            </Card>
            <div className="online-actions">
              <Button variant="primary" size="lg" fullWidth onClick={() => { setError(''); setScreen('mode'); }}>🏠 Criar sala</Button>
              <Button variant="secondary" size="lg" fullWidth onClick={() => { setError(''); setScreen('join'); }}>🚪 Entrar numa sala</Button>
            </div>
          </div>
        )}

        {/* Escolher modo */}
        {screen === 'mode' && (
          <div className="animate-scale-in">
            <h1 className="online-title">Escolhe o modo</h1>
            <button className={`mode-card ${mode === 'team' ? 'mode-active' : ''}`} onClick={() => setMode('team')}>
              <span className="mode-emoji">🤝</span>
              <div className="mode-text">
                <div className="mode-title">Equipa</div>
                <div className="mode-desc">Jogam juntos. Quando alguém acerta, a equipa avança.</div>
              </div>
            </button>
            <button className={`mode-card ${mode === 'versus' ? 'mode-active' : ''}`} onClick={() => setMode('versus')}>
              <span className="mode-emoji">⚔️</span>
              <div className="mode-text">
                <div className="mode-title">Contra (1v1)</div>
                <div className="mode-desc">Cada um joga para si. Não vês a resposta do adversário.</div>
              </div>
            </button>
            <Button variant="primary" size="lg" fullWidth onClick={() => { setError(''); setScreen('config'); }}>
              Continuar →
            </Button>
          </div>
        )}

        {/* Configuração da sala */}
        {screen === 'config' && (
          <div className="animate-scale-in">
            <h1 className="online-title">Configuração</h1>
            <p className="online-subtitle">{mode === 'team' ? '🤝 Modo Equipa' : '⚔️ Modo Contra'}</p>

            {/* Timer */}
            <Card>
              <div className="section-header">
                <span className="section-icon">⏱️</span>
                <div><h2 className="section-title">Tempo por ronda</h2></div>
              </div>
              <Toggle checked={noTimer} onChange={setNoTimer} label="Sem timer" description="Ideal para jogar sem pressão" />
              {!noTimer && (
                <div className="online-time-presets">
                  {[30, 60, 90].map(t => (
                    <button key={t} className={`time-preset-btn ${timePerRound === t ? 'active' : ''}`}
                      onClick={() => setTimePerRound(t)}>{t}s</button>
                  ))}
                </div>
              )}
            </Card>

            {/* Categorias por ronda */}
            <Card>
              <div className="section-header">
                <span className="section-icon">🎯</span>
                <div>
                  <h2 className="section-title">Categorias por ronda</h2>
                  <p className="section-desc">{selectedCats.length} seleccionadas</p>
                </div>
              </div>
              <div className="online-cats-per-round">
                {[1,2,3].map(n => (
                  <button key={n} className={`cats-per-round-btn ${catsPerRound === n ? 'active' : ''}`}
                    onClick={() => setCatsPerRound(n)}>{n}</button>
                ))}
              </div>
              <div className="online-cat-grid">
                {ALL_CATS.map(cat => (
                  <button key={cat} className={`online-cat-chip ${selectedCats.includes(cat) ? 'active' : ''}`}
                    onClick={() => toggleCat(cat)}>
                    {CAT_LABELS[cat]}
                  </button>
                ))}
              </div>
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
              <input className="online-code-input" type="text" value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())} placeholder="Ex: XKJF" maxLength={4} />
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
              <span className="room-code-label">{room.mode === 'team' ? '🤝 Modo Equipa' : '⚔️ Modo Contra'}</span>
              <span className="room-code-value">{room.code}</span>
              <span className="room-code-hint">Partilha este código com o outro jogador</span>
            </div>
            <Card>
              <div className="section-header">
                <span className="section-icon">👥</span>
                <div>
                  <h2 className="section-title">Jogadores</h2>
                  <p className="section-desc">{players.length} de 2</p>
                </div>
              </div>
              <div className="waiting-players">
                {players.map((p, i) => (
                  <div key={p.id} className="waiting-player">
                    <div className="waiting-player-avatar" style={{ background: `${PLAYER_COLORS[i % 2]}22`, borderColor: `${PLAYER_COLORS[i % 2]}44` }}>
                      <span>{p.emoji}</span>
                    </div>
                    <span className="waiting-player-name">{p.name}</span>
                    {p.isHost && <span className="waiting-host-badge">Host</span>}
                    {p.id === myPlayerId && <span className="waiting-you-badge">Tu</span>}
                  </div>
                ))}
                {players.length < 2 && (
                  <div className="waiting-player waiting-empty">
                    <div className="waiting-player-avatar waiting-empty-avatar"><span>?</span></div>
                    <span className="waiting-player-name">À espera…</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Resumo da config */}
            <Card padding="sm">
              <div className="config-summary">
                <span>{room.config.timePerRound === 0 ? '♾️ Sem timer' : `⏱️ ${room.config.timePerRound}s`}</span>
                <span>🎯 {room.config.categoriesPerRound} categoria{room.config.categoriesPerRound > 1 ? 's' : ''}/ronda</span>
                <span>📂 {room.config.selectedCategories.length} categorias activas</span>
              </div>
            </Card>

            {error && <div className="online-error">{error}</div>}
            {amHost ? (
              <Button variant="primary" size="lg" fullWidth onClick={handleStart} disabled={players.length < 2}>
                {players.length < 2 ? 'À espera de jogador…' : '🎮 Iniciar jogo'}
              </Button>
            ) : (
              <div className="waiting-hint animate-fade-in">
                <span className="pulse-dot" />À espera que o host inicie…
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLeave}>Sair da sala</Button>
          </div>
        )}

      </div>
    </div>
  );
}
