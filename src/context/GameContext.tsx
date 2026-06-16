import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction, GameConfig, CategoryKey, RoundHistory } from '@/types';
import { ALPHABET_PT, pickRandomLetter, removeLetter } from '@/utils/alphabet';
import { loadSettings } from '@/services/storageService';
import { getRandomExample } from '@/data/examples';

const DEFAULT_CATS: CategoryKey[] = ['pais', 'nome', 'cor', 'animal', 'objeto'];

/** Sorteia N categorias únicas da lista seleccionada */
function pickCategories(selected: CategoryKey[], count: number): CategoryKey[] {
  const pool = selected.length > 0 ? [...selected] : [...DEFAULT_CATS];
  const n = Math.min(count, pool.length);
  const result: CategoryKey[] = [];
  while (result.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

/** Obtém exemplos para as categorias sorteadas */
function getExamplesForCategories(letter: string, cats: CategoryKey[]): Partial<Record<CategoryKey, string>> {
  const ex = getRandomExample(letter);
  if (!ex) return {};
  const result: Partial<Record<CategoryKey, string>> = {};
  for (const cat of cats) result[cat] = ex[cat];
  return result;
}

const settings = loadSettings();
const _first = pickRandomLetter(ALPHABET_PT);
const _cats = pickCategories(
  settings.selectedCategories ?? DEFAULT_CATS,
  settings.categoriesPerRound ?? 1
);

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
    categoriesPerRound: settings.categoriesPerRound ?? 1,
    repeatLetters: settings.repeatLetters ?? false,
  },
  currentLetter: _first,
  currentCategories: _cats,
  currentPlayerIndex: 0,
  round: 1,
  scores: {},
  phase: 'countdown',
  timeRemaining: settings.defaultTime,
  usedLetters: [],
  remainingLetters: ALPHABET_PT,
  history: [],
};

function gameReducer(state: GameState, action: GameAction): GameState {
  const cfg = state.config;
  const cats = cfg.selectedCategories ?? DEFAULT_CATS;
  const perRound = cfg.categoriesPerRound ?? 1;

  switch (action.type) {
    case 'START_GAME': {
      const config: GameConfig = action.payload;
      const scores: Record<string, number> = {};
      for (const p of config.players) scores[p.id] = 0;
      const first = pickRandomLetter(ALPHABET_PT);
      const firstCats = pickCategories(config.selectedCategories, config.categoriesPerRound);
      return {
        ...state, screen: 'game', config,
        currentLetter: first,
        currentCategories: firstCats,
        currentPlayerIndex: 0, round: 1, scores,
        phase: 'countdown', timeRemaining: config.timePerRound,
        usedLetters: [first],
        remainingLetters: removeLetter(ALPHABET_PT, first),
        history: [],
      };
    }

    case 'START_COUNTDOWN': return { ...state, phase: 'countdown' };
    case 'START_ANNOUNCING': return { ...state, phase: 'announcing' };
    case 'START_PLAYING': return { ...state, phase: 'playing' };
    case 'PAUSE': return state.phase === 'playing' ? { ...state, phase: 'paused' } : state;
    case 'RESUME': return state.phase === 'paused' ? { ...state, phase: 'playing' } : state;

    case 'TICK': {
      if (state.phase !== 'playing') return state;
      const next = state.timeRemaining - 1;
      return next <= 0 ? { ...state, timeRemaining: 0, phase: 'scoring' } : { ...state, timeRemaining: next };
    }

    case 'START_SCORING': return { ...state, phase: 'scoring', timeRemaining: 0 };

    case 'ADD_POINT': {
      const { playerId } = action.payload;
      return { ...state, scores: { ...state.scores, [playerId]: (state.scores[playerId] ?? 0) + 1 } };
    }

    case 'REMOVE_POINT': {
      const { playerId } = action.payload;
      return { ...state, scores: { ...state.scores, [playerId]: Math.max(0, (state.scores[playerId] ?? 0) - 1) } };
    }

    case 'SAVE_ROUND_HISTORY': {
      const payload = action.payload as RoundHistory;
      return { ...state, history: [...state.history, payload] };
    }

    case 'NEXT_ROUND': {
      // Verificar se há letras disponíveis
      let remaining = state.remainingLetters;
      let used = state.usedLetters;

      if (remaining.length === 0) {
        if (cfg.repeatLetters) {
          // Recomeçar o alfabeto excluindo a letra actual
          remaining = removeLetter(ALPHABET_PT, state.currentLetter);
        } else {
          return { ...state, phase: 'finished', screen: 'results' };
        }
      }

      const letter = pickRandomLetter(remaining);
      const newRemaining = removeLetter(remaining, letter);
      const nextIdx = (state.currentPlayerIndex + 1) % cfg.players.length;
      const nextCats = pickCategories(cats, perRound);

      return {
        ...state,
        currentLetter: letter,
        currentCategories: nextCats,
        currentPlayerIndex: nextIdx,
        round: state.round + 1,
        phase: 'countdown',
        timeRemaining: cfg.timePerRound,
        usedLetters: [...used, letter],
        remainingLetters: newRemaining,
      };
    }

    case 'SKIP_LETTER': {
      let remaining = state.remainingLetters;
      if (remaining.length === 0) {
        if (cfg.repeatLetters) {
          remaining = removeLetter(ALPHABET_PT, state.currentLetter);
        } else {
          return { ...state, phase: 'finished', screen: 'results' };
        }
      }
      const letter = pickRandomLetter(remaining);
      const nextIdx = (state.currentPlayerIndex + 1) % cfg.players.length;
      const nextCats = pickCategories(cats, perRound);
      return {
        ...state,
        currentLetter: letter,
        currentCategories: nextCats,
        currentPlayerIndex: nextIdx,
        round: state.round + 1,
        phase: 'countdown',
        timeRemaining: cfg.timePerRound,
        usedLetters: [...state.usedLetters, letter],
        remainingLetters: removeLetter(remaining, letter),
      };
    }

    case 'END_GAME': return { ...state, screen: 'results', phase: 'finished' };

    case 'RESET': {
      const first = pickRandomLetter(ALPHABET_PT);
      const firstCats = pickCategories(cfg.selectedCategories, cfg.categoriesPerRound);
      return {
        ...INITIAL_STATE, config: cfg,
        currentLetter: first,
        currentCategories: firstCats,
        remainingLetters: removeLetter(ALPHABET_PT, first),
        usedLetters: [first],
        phase: 'countdown',
        history: [],
      };
    }

    case 'GO_TO_STATS': return { ...state, screen: 'stats' };
    case 'GO_TO_ABOUT': return { ...state, screen: 'about' };
    case 'GO_TO_ONLINE': return { ...state, screen: 'online' };
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

export { getExamplesForCategories };
