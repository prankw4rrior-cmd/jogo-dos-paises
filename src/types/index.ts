// ─── Jogador ───────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
}

// ─── Configuração ──────────────────────────────────────────────────────────

export interface GameConfig {
  players: Player[];
  timePerRound: number; // em segundos
  voiceEnabled: boolean;
  examplesEnabled: boolean;
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

export type GamePhase = 'announcing' | 'playing' | 'scoring' | 'finished';
export type AppScreen = 'setup' | 'game' | 'results' | 'stats';

export interface GameState {
  screen: AppScreen;
  config: GameConfig;
  currentLetter: string;
  currentCategory: CategoryKey;
  currentPlayerIndex: number;
  round: number;
  scores: Record<string, number>; // playerId → pontuação
  phase: GamePhase;
  timeRemaining: number;
  usedLetters: string[];        // letras já jogadas
  remainingLetters: string[];   // letras ainda disponíveis
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
  players: Record<string, PlayerStats>; // playerName → stats
  lettersUsed: string[];
  lastPlayed: string | null; // ISO date
}

// ─── Definições persistidas ────────────────────────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  voiceEnabled: boolean;
  examplesEnabled: boolean;
  defaultTime: number;
}

// ─── Actions do Reducer ────────────────────────────────────────────────────

export type GameAction =
  | { type: 'START_GAME'; payload: GameConfig }
  | { type: 'START_PLAYING' }
  | { type: 'TICK' }
  | { type: 'START_SCORING' }
  | { type: 'ADD_POINT'; payload: { playerId: string } }
  | { type: 'REMOVE_POINT'; payload: { playerId: string } }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESET' }
  | { type: 'GO_TO_STATS' }
  | { type: 'GO_TO_SETUP' };
