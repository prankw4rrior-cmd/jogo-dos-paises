// ─── Jogador ───────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  emoji: string;
  teamId?: string;
}

// ─── Equipa ────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  emoji: string;
  playerIds: string[];
}

// ─── Categorias ────────────────────────────────────────────────────────────

export type CategoryKey =
  | 'pais' | 'nome' | 'cor' | 'animal' | 'objeto'
  | 'fruta' | 'cidade' | 'profissao' | 'marca' | 'filme';

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
}

export interface CategoryExamples {
  pais: string;
  nome: string;
  cor: string;
  animal: string;
  objeto: string;
  fruta: string;
  cidade: string;
  profissao: string;
  marca: string;
  filme: string;
}

// ─── Dificuldade ───────────────────────────────────────────────────────────

export type Difficulty = 'facil' | 'normal' | 'dificil';

// ─── Configuração ──────────────────────────────────────────────────────────

export interface GameConfig {
  players: Player[];
  teams: Team[];
  teamMode: boolean;
  timePerRound: number;
  voiceEnabled: boolean;
  examplesEnabled: boolean;
  noTimer: boolean;
  difficulty: Difficulty;
  selectedCategories: CategoryKey[];
}

// ─── Estado do jogo ────────────────────────────────────────────────────────

export type GamePhase = 'countdown' | 'announcing' | 'playing' | 'paused' | 'scoring' | 'finished';
export type AppScreen = 'setup' | 'game' | 'results' | 'stats';
export type ThemeOption = 'system' | 'light' | 'dark';
export type AccentColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';

export interface GameState {
  screen: AppScreen;
  config: GameConfig;
  currentLetter: string;
  currentCategory: CategoryKey;
  currentPlayerIndex: number;
  round: number;
  scores: Record<string, number>;
  phase: GamePhase;
  timeRemaining: number;
  usedLetters: string[];
  remainingLetters: string[];
}

// ─── Estatísticas persistidas ──────────────────────────────────────────────

export interface PlayerStats {
  name: string;
  wins: number;
  gamesPlayed: number;
  bestScore: number;
  totalPoints: number;
}

export interface AppStats {
  gamesPlayed: number;
  players: Record<string, PlayerStats>;
  lettersUsed: string[];
  lastPlayed: string | null;
}

// ─── Definições persistidas ────────────────────────────────────────────────

export interface AppSettings {
  theme: ThemeOption;
  accentColor: AccentColor;
  voiceEnabled: boolean;
  examplesEnabled: boolean;
  defaultTime: number;
  noTimer: boolean;
  difficulty: Difficulty;
  selectedCategories: CategoryKey[];
}

// ─── Actions do Reducer ────────────────────────────────────────────────────

export type GameAction =
  | { type: 'START_GAME'; payload: GameConfig }
  | { type: 'START_COUNTDOWN' }
  | { type: 'START_PLAYING' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'START_SCORING' }
  | { type: 'SKIP_LETTER' }
  | { type: 'ADD_POINT'; payload: { playerId: string } }
  | { type: 'REMOVE_POINT'; payload: { playerId: string } }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESET' }
  | { type: 'GO_TO_STATS' }
  | { type: 'GO_TO_SETUP' };
