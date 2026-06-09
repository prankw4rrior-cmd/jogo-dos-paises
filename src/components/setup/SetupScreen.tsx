import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Logo } from '@/components/ui/Logo';
import { PlayerInput } from './PlayerInput';
import { TimeSelector } from './TimeSelector';
import type { Player, GameConfig } from '@/types';
import { loadSettings, saveSettings } from '@/services/storageService';
import { isSpeechSupported } from '@/services/speechService';
import './SetupScreen.css';

let playerIdCounter = 1;

const DEFAULT_EMOJIS = ['😀','😎','🤩','🥳','🦁','🐯','🐻','🦊'];

function createPlayer(name: string, index: number): Player {
  return { id: `p${playerIdCounter++}`, name: name.trim(), emoji: DEFAULT_EMOJIS[index] ?? '😀' };
}

export function SetupScreen() {
  const { dispatch } = useGame();
  const settings = loadSettings();

  const [players, setPlayers] = useState<Player[]>([
    createPlayer('Jogador 1', 0),
    createPlayer('Jogador 2', 1),
  ]);
  const [timePerRound, setTimePerRound] = useState(settings.defaultTime);
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled);
  const [examplesEnabled, setExamplesEnabled] = useState(settings.examplesEnabled);
  const [noTimer, setNoTimer] = useState(settings.noTimer ?? false);
  const [error, setError] = useState('');

  const speechSupported = isSpeechSupported();

  function handleAddPlayer() {
    if (players.length >= 8) return;
    setPlayers(prev => [...prev, createPlayer(`Jogador ${prev.length + 1}`, prev.length)]);
  }

  function handleRemovePlayer(id: string) {
    if (players.length <= 2) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  function handleRenamePlayer(id: string, name: string) {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  }

  function handleEmojiChange(id: string, emoji: string) {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, emoji } : p));
  }

  function handleStart() {
    const names = players.map(p => p.name.trim());
    if (names.some(n => n.length === 0)) { setError('Todos os jogadores precisam de um nome.'); return; }
    if (new Set(names).size !== names.length) { setError('Os nomes dos jogadores devem ser únicos.'); return; }

    setError('');
    saveSettings({ voiceEnabled, examplesEnabled, defaultTime: timePerRound, noTimer });

    const config: GameConfig = {
      players: players.map(p => ({ ...p, name: p.name.trim() })),
      timePerRound,
      voiceEnabled: voiceEnabled && speechSupported,
      examplesEnabled,
      noTimer,
    };

    dispatch({ type: 'START_GAME', payload: config });
  }

  return (
    <div className="setup-screen">
      <div className="app-bg" />
      <div className="setup-content">

        <div className="setup-header animate-slide-up">
          <Logo size="lg" showName={false} />
          <h1 className="setup-title">Letra a Letra</h1>
          <p className="setup-subtitle">Com família e amigos</p>
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: '60ms' }}>
          <div className="section-header">
            <span className="section-icon">👥</span>
            <div>
              <h2 className="section-title">Jogadores</h2>
              <p className="section-desc">{players.length} de 8 jogadores</p>
            </div>
          </div>
          <div className="players-list">
            {players.map((player, i) => (
              <PlayerInput
                key={player.id}
                player={player}
                index={i}
                canRemove={players.length > 2}
                onRename={handleRenamePlayer}
                onRemove={handleRemovePlayer}
                onEmojiChange={handleEmojiChange}
                emoji={player.emoji}
              />
            ))}
          </div>
          {players.length < 8 && (
            <button className="add-player-btn" onClick={handleAddPlayer}>
              <span>+</span> Adicionar jogador
            </button>
          )}
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div className="section-header">
            <span className="section-icon">⏱️</span>
            <div>
              <h2 className="section-title">Tempo por ronda</h2>
              <p className="section-desc">{noTimer ? 'Sem limite de tempo' : 'Segundos para cada letra'}</p>
            </div>
          </div>
          {!noTimer && <TimeSelector value={timePerRound} onChange={setTimePerRound} />}
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '180ms' }}>
          <div className="section-header">
            <span className="section-icon">⚙️</span>
            <div><h2 className="section-title">Opções</h2></div>
          </div>
          <div className="options-list">
            <Toggle checked={noTimer} onChange={setNoTimer} label="Sem timer" description="Ideal para crianças pequenas" />
            <div className="option-divider" />
            <Toggle checked={voiceEnabled} onChange={setVoiceEnabled} label="Voz automática"
              description={speechSupported ? 'Anuncia a letra' : 'Não suportado neste browser'}
              disabled={!speechSupported} />
            <div className="option-divider" />
            <Toggle checked={examplesEnabled} onChange={setExamplesEnabled} label="Exemplos no fim" description="Mostra uma sugestão após cada ronda" />
          </div>
        </Card>

        {error && <div className="setup-error animate-slide-up">{error}</div>}

        <div className="animate-slide-up" style={{ animationDelay: '240ms' }}>
          <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
            🎮 Iniciar Jogo
          </Button>
        </div>

        <div className="setup-decoration" aria-hidden>
          <span>A</span><span>B</span><span>C</span>
        </div>
      </div>
    </div>
  );
}
