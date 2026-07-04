import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Logo } from '@/components/ui/Logo';
import { PlayerInput } from './PlayerInput';
import { TimeSelector } from './TimeSelector';
import { CategorySelector } from './CategorySelector';
import { ThemeSelector } from './ThemeSelector';
import { AccessibilitySelector } from './AccessibilitySelector';
import type { Player, GameConfig, CategoryKey, Difficulty, AccentColor, ThemeOption, FontSize } from '@/types';
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
  const [settings] = useState(() => loadSettings());

  const [players, setPlayers] = useState<Player[]>([
    createPlayer('Jogador 1', 0),
    createPlayer('Jogador 2', 1),
  ]);
  const [timePerRound, setTimePerRound] = useState(settings.defaultTime);
  const [voiceEnabled, setVoiceEnabled] = useState(settings.voiceEnabled);
  const [examplesEnabled, setExamplesEnabled] = useState(settings.examplesEnabled);
  const [noTimer, setNoTimer] = useState(settings.noTimer ?? false);
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty ?? 'normal');
  const [selectedCategories, setSelectedCategories] = useState<CategoryKey[]>(
    settings.selectedCategories ?? ['pais', 'nome', 'cor', 'animal', 'objeto']
  );
  const [categoriesPerRound, setCategoriesPerRound] = useState(settings.categoriesPerRound ?? 1);
  const [repeatLetters, setRepeatLetters] = useState(settings.repeatLetters ?? false);
  const [powerUpsEnabled, setPowerUpsEnabled] = useState(settings.powerUpsEnabled ?? false);
  const [lightningMode, setLightningMode] = useState(settings.lightningMode ?? false);
  const [accent, setAccent] = useState<AccentColor>(settings.accentColor ?? 'purple');
  const [theme, setTheme] = useState<ThemeOption>(settings.theme ?? 'system');
  const [fontSize, setFontSize] = useState<FontSize>(settings.fontSize ?? 'medium');
  const [highContrast, setHighContrast] = useState(settings.highContrast ?? false);
  const [colorBlindMode, setColorBlindMode] = useState(settings.colorBlindMode ?? false);
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

    saveSettings({ voiceEnabled, examplesEnabled, defaultTime: timePerRound, noTimer, difficulty, selectedCategories, categoriesPerRound, repeatLetters, powerUpsEnabled, lightningMode, accentColor: accent, theme, fontSize, highContrast, colorBlindMode });

    const config: GameConfig = {
      players: players.map(p => ({ ...p, name: p.name.trim() })),
      teams: [], teamMode: false,
      timePerRound, voiceEnabled: voiceEnabled && speechSupported,
      examplesEnabled, noTimer, difficulty, selectedCategories,
      categoriesPerRound, repeatLetters, powerUpsEnabled, lightningMode,
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

        {/* Botões de canto */}
        <div className="setup-corner-btns animate-fade-in">
          <button className="setup-corner-btn" onClick={() => dispatch({ type: 'GO_TO_STATS' })}>
            📊 <span>Estatísticas</span>
          </button>
          <button className="setup-corner-btn" onClick={() => dispatch({ type: 'GO_TO_ABOUT' })}>
            ℹ️ <span>Sobre</span>
          </button>
        </div>

        {/* Jogadores */}
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
              <PlayerInput key={player.id} player={player} index={i}
                canRemove={players.length > 2}
                onRename={handleRenamePlayer} onRemove={handleRemovePlayer}
                onEmojiChange={handleEmojiChange} emoji={player.emoji} />
            ))}
          </div>
          {players.length < 8 && (
            <button className="add-player-btn" onClick={handleAddPlayer}>
              <span>+</span> Adicionar jogador
            </button>
          )}
        </Card>

        {/* Categorias */}
        <Card className="animate-slide-up" style={{ animationDelay: '90ms' }}>
          <div className="section-header">
            <span className="section-icon">🎯</span>
            <div>
              <h2 className="section-title">Categorias</h2>
              <p className="section-desc">{selectedCategories.length} seleccionadas</p>
            </div>
          </div>
          <CategorySelector
            selected={selectedCategories} difficulty={difficulty}
            onSelectedChange={setSelectedCategories} onDifficultyChange={setDifficulty}
          />
        </Card>

        {/* Tempo */}
        <Card className="animate-slide-up" style={{ animationDelay: '120ms' }}>
          <div className="section-header">
            <span className="section-icon">⏱️</span>
            <div>
              <h2 className="section-title">Tempo por ronda</h2>
              <p className="section-desc">{noTimer ? 'Sem limite de tempo' : 'Segundos por letra'}</p>
            </div>
          </div>
          {!noTimer && <TimeSelector value={timePerRound} onChange={setTimePerRound} />}
        </Card>

        {/* Opções */}
        <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="section-header">
            <span className="section-icon">⚙️</span>
            <div><h2 className="section-title">Opções</h2></div>
          </div>
          <div className="options-list">
            <Toggle checked={noTimer} onChange={(v) => { setNoTimer(v); if (v) setLightningMode(false); }} label="Sem timer" description="Ideal para crianças pequenas" />
            <div className="option-divider" />
            <Toggle checked={repeatLetters} onChange={setRepeatLetters} label="Repetir letras" description="Continua após esgotar o alfabeto" />
            <div className="option-divider" />
            <div className="option-row">
              <div>
                <div className="toggle-label">Categorias por ronda</div>
                <div className="toggle-desc">Quantas categorias sortear de cada vez</div>
              </div>
              <div className="cats-per-round-selector">
                {[1, 2, 3].map(n => (
                  <button
                    key={n}
                    className={`cats-per-round-btn ${categoriesPerRound === n ? 'active' : ''}`}
                    onClick={() => setCategoriesPerRound(n)}
                  >{n}</button>
                ))}
              </div>
            </div>
            <div className="option-divider" />
            <Toggle checked={voiceEnabled} onChange={setVoiceEnabled} label="Voz automática"
              description={speechSupported ? 'Anuncia a letra' : 'Não suportado neste browser'}
              disabled={!speechSupported} />
            <div className="option-divider" />
            <Toggle checked={examplesEnabled} onChange={setExamplesEnabled} label="Exemplos no fim" description="Mostra sugestão após cada ronda" />
            <div className="option-divider" />
            <Toggle checked={powerUpsEnabled} onChange={setPowerUpsEnabled} label="Power-ups" description="Dicas e tempo extra durante o jogo" />
            <div className="option-divider" />
            <Toggle checked={lightningMode} onChange={(v) => { setLightningMode(v); if (v) setNoTimer(false); }} label="⚡ Modo relâmpago" description="Apenas 10 segundos por ronda" />
            {lightningMode && noTimer && (
              <div className="option-warning">⚠️ O modo relâmpago e "Sem timer" são incompatíveis. O timer foi reactivado.</div>
            )}
          </div>
        </Card>

        {/* Aparência */}
        <Card className="animate-slide-up" style={{ animationDelay: '180ms' }}>
          <div className="section-header">
            <span className="section-icon">🎨</span>
            <div><h2 className="section-title">Aparência</h2></div>
          </div>
          <ThemeSelector accent={accent} theme={theme} onAccentChange={setAccent} onThemeChange={setTheme} />
        </Card>

        {/* Acessibilidade */}
        <Card className="animate-slide-up" style={{ animationDelay: '195ms' }}>
          <div className="section-header">
            <span className="section-icon">♿</span>
            <div><h2 className="section-title">Acessibilidade</h2></div>
          </div>
          <AccessibilitySelector
            fontSize={fontSize}
            highContrast={highContrast}
            colorBlindMode={colorBlindMode}
            onFontSizeChange={setFontSize}
            onHighContrastChange={setHighContrast}
            onColorBlindChange={setColorBlindMode}
          />
        </Card>

        {error && <div className="setup-error animate-slide-up">{error}</div>}

        <div className="animate-slide-up" style={{ animationDelay: '210ms' }}>
          <Button variant="primary" size="lg" fullWidth onClick={handleStart}>
            🎮 Jogo local
          </Button>
          <div style={{ marginTop: 10 }}>
            <Button variant="secondary" size="lg" fullWidth onClick={() => dispatch({ type: 'GO_TO_ONLINE' })}>
              🌐 Multijogador online
            </Button>
          </div>
        </div>

        <div className="setup-decoration" aria-hidden>
          <span>A</span><span>B</span><span>C</span>
        </div>
      </div>
    </div>
  );
}
