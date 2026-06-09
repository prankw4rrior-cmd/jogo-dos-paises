// ─── Jogador ───────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  emoji: string;
}

// ─── Configuração ──────────────────────────────────────────────────────────

export interface GameConfig {
  players: Player[];
  timePerRound: number; // 0 = sem timer
  voiceEnabled: boolean;
  examplesEnabled: boolean;
  noTimer: boolean;
}

// ─── Exemplos por categoria ────────────────────────────────────────────────

export interface CategoryExamples {
  pais: string;
  nome: string;
  cor: string;
  animal: string;
  objeto: string;
}

// ─── Categorias ────────────────────────────────────────────────────────────

export type CategoryKey = keyof CategoryExamples;

export interface Category {
  key: CategoryKey;
  label: string;
  emoji: string;
}

// ─── Estado do jogo ────────────────────────────────────────────────────────

export type GamePhase = 'countdown' | 'announcing' | 'playing' | 'paused' | 'scoring' | 'finished';
export type AppScreen = 'setup' | 'game' | 'results' | 'stats';

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
  theme: 'light' | 'dark' | 'system';
  voiceEnabled: boolean;
  examplesEnabled: boolean;
  defaultTime: number;
  noTimer: boolean;
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
