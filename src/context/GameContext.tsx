import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react';
import type { GameState, GameAction, GameConfig, CategoryKey } from '@/types';
import { ALPHABET_PT, pickRandomLetter, removeLetter } from '@/utils/alphabet';
import { loadSettings } from '@/services/storageService';

const ALL_CATEGORIES: CategoryKey[] = ['pais', 'nome', 'cor', 'animal', 'objeto'];

function pickRandomCategory(): CategoryKey {
  return ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
}

const settings = loadSettings();
const firstLetter = pickRandomLetter(ALPHABET_PT);

const INITIAL_STATE: GameState = {
  screen: 'setup',
  config: {
    players: [],
    timePerRound: settings.defaultTime,
    voiceEnabled: settings.voiceEnabled,
    examplesEnabled: settings.examplesEnabled,
    noTimer: settings.noTimer ?? false,
  },
  currentLetter: firstLetter,
  currentCategory: pickRandomCategory(),
  currentPlayerIndex: 0,
  round: 1,
  scores: {},
  phase: 'countdown',
  timeRemaining: settings.defaultTime,
  usedLetters: [],
  remainingLetters: ALPHABET_PT,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'START_GAME': {
      const config: GameConfig = action.payload;
      const scores: Record<string, number> = {};
      for (const p of config.players) scores[p.id] = 0;
      const firstLetter = pickRandomLetter(ALPHABET_PT);
      const remaining = removeLetter(ALPHABET_PT, firstLetter);
      return {
        ...state,
        screen: 'game',
        config,
        currentLetter: firstLetter,
        currentCategory: pickRandomCategory(),
        currentPlayerIndex: 0,
        round: 1,
        scores,
        phase: 'countdown',
        timeRemaining: config.timePerRound,
        usedLetters: [firstLetter],
        remainingLetters: remaining,
      };
    }

    case 'START_COUNTDOWN': {
      return { ...state, phase: 'countdown' };
    }

    case 'START_PLAYING': {
      return { ...state, phase: 'playing' };
    }

    case 'PAUSE': {
      if (state.phase !== 'playing') return state;
      return { ...state, phase: 'paused' };
    }

    case 'RESUME': {
      if (state.phase !== 'paused') return state;
      return { ...state, phase: 'playing' };
    }

    case 'TICK': {
      if (state.phase !== 'playing') return state;
      const next = state.timeRemaining - 1;
      if (next <= 0) return { ...state, timeRemaining: 0, phase: 'scoring' };
      return { ...state, timeRemaining: next };
    }

    case 'START_SCORING': {
      return { ...state, phase: 'scoring', timeRemaining: 0 };
    }

    case 'SKIP_LETTER': {
      // Salta a letra actual sem pontuar — avança para a próxima
      if (state.remainingLetters.length === 0) {
        return { ...state, phase: 'finished', screen: 'results' };
      }
      const nextLetter = pickRandomLetter(state.remainingLetters);
      const newRemaining = removeLetter(state.remainingLetters, nextLetter);
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.config.players.length;
      return {
        ...state,
        currentLetter: nextLetter,
        currentCategory: pickRandomCategory(),
        currentPlayerIndex: nextPlayerIndex,
        round: state.round + 1,
        phase: 'countdown',
        timeRemaining: state.config.timePerRound,
        usedLetters: [...state.usedLetters, nextLetter],
        remainingLetters: newRemaining,
      };
    }

    case 'ADD_POINT': {
      const { playerId } = action.payload;
      return {
        ...state,
        scores: { ...state.scores, [playerId]: (state.scores[playerId] ?? 0) + 1 },
      };
    }

    case 'REMOVE_POINT': {
      const { playerId } = action.payload;
      return {
        ...state,
        scores: { ...state.scores, [playerId]: Math.max(0, (state.scores[playerId] ?? 0) - 1) },
      };
    }

    case 'NEXT_ROUND': {
      if (state.remainingLetters.length === 0) {
        return { ...state, phase: 'finished', screen: 'results' };
      }
      const nextLetter = pickRandomLetter(state.remainingLetters);
      const newRemaining = removeLetter(state.remainingLetters, nextLetter);
      const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.config.players.length;
      return {
        ...state,
        currentLetter: nextLetter,
        currentCategory: pickRandomCategory(),
        currentPlayerIndex: nextPlayerIndex,
        round: state.round + 1,
        phase: 'countdown',
        timeRemaining: state.config.timePerRound,
        usedLetters: [...state.usedLetters, nextLetter],
        remainingLetters: newRemaining,
      };
    }

    case 'END_GAME': {
      return { ...state, screen: 'results', phase: 'finished' };
    }

    case 'RESET': {
      const firstLetter = pickRandomLetter(ALPHABET_PT);
      return {
        ...INITIAL_STATE,
        config: state.config,
        currentLetter: firstLetter,
        currentCategory: pickRandomCategory(),
        remainingLetters: removeLetter(ALPHABET_PT, firstLetter),
        usedLetters: [firstLetter],
        phase: 'countdown',
      };
    }

    case 'GO_TO_STATS': {
      return { ...state, screen: 'stats' };
    }

    case 'GO_TO_SETUP': {
      const firstLetter = pickRandomLetter(ALPHABET_PT);
      return {
        ...INITIAL_STATE,
        currentLetter: firstLetter,
        remainingLetters: removeLetter(ALPHABET_PT, firstLetter),
      };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  useEffect(() => {
    const settings = loadSettings();
    applyTheme(settings.theme);
  }, []);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame deve ser usado dentro de GameProvider');
  return ctx;
}

export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-theme', theme);
  }
}
