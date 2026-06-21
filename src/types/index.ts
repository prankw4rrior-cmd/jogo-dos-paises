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
  categoriesPerRound: number;   // quantas categorias por ronda (1–5)
  repeatLetters: boolean;       // permitir repetir letras após esgotar o alfabeto
  powerUpsEnabled: boolean;     // activar dicas e tempo extra
  lightningMode: boolean;       // modo relâmpago (10s fixo, sem power-ups)
}

// ─── Resposta de uma ronda ─────────────────────────────────────────────────

export interface RoundAnswer {
  category: CategoryKey;
  answer: string;
  valid: boolean;
}

// ─── Histórico de uma ronda ────────────────────────────────────────────────

export interface RoundHistory {
  round: number;
  letter: string;
  playerName: string;
  categories: CategoryKey[];
  answers: RoundAnswer[];       // respostas dadas nessa ronda
  examples: Partial<CategoryExamples>; // exemplos para as categorias sorteadas
}

// ─── Estado do jogo ────────────────────────────────────────────────────────

export type GamePhase = 'countdown' | 'announcing' | 'playing' | 'paused' | 'scoring' | 'finished';
export type AppScreen = 'setup' | 'game' | 'results' | 'stats' | 'about' | 'online';
export type ThemeOption = 'system' | 'light' | 'dark';
export type AccentColor = 'purple' | 'blue' | 'green' | 'orange' | 'pink';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export interface GameState {
  screen: AppScreen;
  config: GameConfig;
  currentLetter: string;
  currentCategories: CategoryKey[];  // lista de categorias desta ronda
  currentPlayerIndex: number;
  round: number;
  scores: Record<string, number>;
  phase: GamePhase;
  timeRemaining: number;
  usedLetters: string[];
  remainingLetters: string[];
  history: RoundHistory[];           // histórico de todas as rondas
  hintUsedThisRound: boolean;
  extraTimeUses: Record<string, number>; // playerId → vezes que usou tempo extra
  hintUses: Record<string, number>;      // playerId → vezes que usou dica
}

// ─── Conquistas ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt: string | null; // ISO date, null = ainda não desbloqueada
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
  achievements: Record<string, string>; // achievementId → ISO date desbloqueada
  currentStreak: number;   // jogos seguidos sem desistir de nenhuma ronda
  bestStreak: number;
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
  categoriesPerRound: number;
  repeatLetters: boolean;
  powerUpsEnabled: boolean;
  lightningMode: boolean;
  fontSize: FontSize;
  highContrast: boolean;
  colorBlindMode: boolean;
}

// ─── Actions do Reducer ────────────────────────────────────────────────────

export type GameAction =
  | { type: 'START_GAME'; payload: GameConfig }
  | { type: 'START_COUNTDOWN' }
  | { type: 'START_ANNOUNCING' }
  | { type: 'START_PLAYING' }
  | { type: 'TICK' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'START_SCORING' }
  | { type: 'SKIP_LETTER' }
  | { type: 'SAVE_ROUND_HISTORY'; payload: RoundHistory }
  | { type: 'USE_HINT'; payload: { playerId: string } }
  | { type: 'USE_EXTRA_TIME'; payload: { playerId: string } }
  | { type: 'ADD_POINT'; payload: { playerId: string } }
  | { type: 'REMOVE_POINT'; payload: { playerId: string } }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESET' }
  | { type: 'GO_TO_STATS' }
  | { type: 'GO_TO_ABOUT' }
  | { type: 'GO_TO_ONLINE' }
  | { type: 'GO_TO_SETUP' };
