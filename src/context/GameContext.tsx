import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, GameConfig, CategoryKey } from '@/types';
import { ALPHABET_PT, pickRandomLetter, removeLetter } from '@/utils/alphabet';
import { loadSettings } from '@/services/storageService';

const DEFAULT_CATS: CategoryKey[] = ['pais', 'nome', 'cor', 'animal', 'objeto'];

function pickCat(cats: CategoryKey[]): CategoryKey {
  const pool = cats.length > 0 ? cats : DEFAULT_CATS;
  return pool[Math.floor(Math.random() * pool.length)];
}

const settings = loadSettings();
const _first = pickRandomLetter(ALPHABET_PT);

const INITIAL_STATE: GameState = {
  screen: 'setup',
  config: {
    players: [],
    teams: [],
    teamMode: false,
    timePerRound: settings.defaultTime,
    voiceEnabled: settings.voiceEnabled,
    examplesEnabled: settings.examplesEnabled,
    noTimer: settings.noTimer ?? false,
    difficulty: settings.difficulty ?? 'normal',
    selectedCategories: settings.selectedCategories ?? DEFAULT_CATS,
  },
  currentLetter: _first,
  currentCategory: pickCat(settings.selectedCategories ?? DEFAULT_CATS),
  currentPlayerIndex: 0,
  round: 1,
  scores: {},
  phase: 'countdown',
  timeRemaining: settings.defaultTime,
  usedLetters: [],
  remainingLetters: ALPHABET_PT,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  const cats = state.config.selectedCategories ?? DEFAULT_CATS;

  switch (action.type) {
    case 'START_GAME': {
      const cfg: GameConfig = action.payload;
      const scores: Record<string, number> = {};
      for (const p of cfg.players) scores[p.id] = 0;
      const first = pickRandomLetter(ALPHABET_PT);
      return {
        ...state, screen: 'game', config: cfg,
        currentLetter: first,
        currentCategory: pickCat(cfg.selectedCategories),
        currentPlayerIndex: 0, round: 1, scores,
        phase: 'countdown', timeRemaining: cfg.timePerRound,
        usedLetters: [first], remainingLetters: removeLetter(ALPHABET_PT, first),
      };
    }
    case 'START_COUNTDOWN': return { ...state, phase: 'countdown' };
    case 'START_PLAYING': return { ...state, phase: 'playing' };
    case 'PAUSE': return state.phase === 'playing' ? { ...state, phase: 'paused' } : state;
    case 'RESUME': return state.phase === 'paused' ? { ...state, phase: 'playing' } : state;
    case 'TICK': {
      if (state.phase !== 'playing') return state;
      const next = state.timeRemaining - 1;
      return next <= 0 ? { ...state, timeRemaining: 0, phase: 'scoring' } : { ...state, timeRemaining: next };
    }
    case 'START_SCORING': return { ...state, phase: 'scoring', timeRemaining: 0 };
    case 'SKIP_LETTER': {
      if (state.remainingLetters.length === 0) return { ...state, phase: 'finished', screen: 'results' };
      const letter = pickRandomLetter(state.remainingLetters);
      const nextIdx = (state.currentPlayerIndex + 1) % state.config.players.length;
      return {
        ...state, currentLetter: letter,
        currentCategory: pickCat(cats),
        currentPlayerIndex: nextIdx, round: state.round + 1,
        phase: 'countdown', timeRemaining: state.config.timePerRound,
        usedLetters: [...state.usedLetters, letter],
        remainingLetters: removeLetter(state.remainingLetters, letter),
      };
    }
    case 'ADD_POINT': {
      const { playerId } = action.payload;
      return { ...state, scores: { ...state.scores, [playerId]: (state.scores[playerId] ?? 0) + 1 } };
    }
    case 'REMOVE_POINT': {
      const { playerId } = action.payload;
      return { ...state, scores: { ...state.scores, [playerId]: Math.max(0, (state.scores[playerId] ?? 0) - 1) } };
    }
    case 'NEXT_ROUND': {
      if (state.remainingLetters.length === 0) return { ...state, phase: 'finished', screen: 'results' };
      const letter = pickRandomLetter(state.remainingLetters);
      const nextIdx = (state.currentPlayerIndex + 1) % state.config.players.length;
      return {
        ...state, currentLetter: letter,
        currentCategory: pickCat(cats),
        currentPlayerIndex: nextIdx, round: state.round + 1,
        phase: 'countdown', timeRemaining: state.config.timePerRound,
        usedLetters: [...state.usedLetters, letter],
        remainingLetters: removeLetter(state.remainingLetters, letter),
      };
    }
    case 'END_GAME': return { ...state, screen: 'results', phase: 'finished' };
    case 'RESET': {
      const first = pickRandomLetter(ALPHABET_PT);
      return { ...INITIAL_STATE, config: state.config, currentLetter: first,
        currentCategory: pickCat(state.config.selectedCategories),
        remainingLetters: removeLetter(ALPHABET_PT, first),
        usedLetters: [first], phase: 'countdown' };
    }
    case 'GO_TO_STATS': return { ...state, screen: 'stats' };
    case 'GO_TO_SETUP': {
      const first = pickRandomLetter(ALPHABET_PT);
      return { ...INITIAL_STATE, currentLetter: first, remainingLetters: removeLetter(ALPHABET_PT, first) };
    }
    default: return state;
  }
}

interface GameContextValue { state: GameState; dispatch: React.Dispatch<GameAction>; }
const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  useEffect(() => { applyTheme(loadSettings().theme); }, []);
  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame deve ser usado dentro de GameProvider');
  return ctx;
}

export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;
  const dark = theme === 'system' ? window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
}
