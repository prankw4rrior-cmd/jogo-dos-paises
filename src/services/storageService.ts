import type { AppStats, AppSettings, Player } from '@/types';
import { TOTAL_LETTERS } from '@/utils/alphabet';

const KEYS = {
  STATS: 'jdp_stats',
  SETTINGS: 'jdp_settings',
} as const;

const DEFAULT_STATS: AppStats = {
  gamesPlayed: 0,
  players: {},
  lettersUsed: [],
  lastPlayed: null,
  achievements: {},
  currentStreak: 0,
  bestStreak: 0,
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  accentColor: 'purple',
  voiceEnabled: true,
  examplesEnabled: true,
  defaultTime: 60,
  noTimer: false,
  difficulty: 'normal',
  selectedCategories: ['pais', 'nome', 'cor', 'animal', 'objeto'],
  categoriesPerRound: 1,
  repeatLetters: false,
  powerUpsEnabled: false,
  lightningMode: false,
  fontSize: 'medium',
  highContrast: false,
  colorBlindMode: false,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch { return fallback; }
}

function safeSet(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function loadStats(): AppStats { return safeGet<AppStats>(KEYS.STATS, DEFAULT_STATS); }
export function saveStats(stats: AppStats): void { safeSet(KEYS.STATS, stats); }
export function clearStats(): void { safeSet(KEYS.STATS, DEFAULT_STATS); }
export function loadSettings(): AppSettings { return safeGet<AppSettings>(KEYS.SETTINGS, DEFAULT_SETTINGS); }
export function saveSettings(settings: Partial<AppSettings>): void {
  const current = loadSettings();
  safeSet(KEYS.SETTINGS, { ...current, ...settings });
}

/**
 * Regista o resultado de um jogo e devolve a lista de conquistas
 * recém-desbloqueadas (para mostrar ao utilizador).
 */
export function recordGame(
  players: Player[],
  scores: Record<string, number>,
  letters: string[],
  options?: { gaveUpAnyRound?: boolean; isOnlineTeam?: boolean }
): string[] {
  const stats = loadStats();
  const newlyUnlocked: string[] = [];

  function unlock(id: string) {
    if (!stats.achievements[id]) {
      stats.achievements[id] = new Date().toISOString();
      newlyUnlocked.push(id);
    }
  }

  stats.gamesPlayed += 1;
  stats.lastPlayed = new Date().toISOString();
  const allLetters = new Set([...stats.lettersUsed, ...letters]);
  stats.lettersUsed = Array.from(allLetters);

  let winnerId = '';
  let maxScore = -1;
  for (const p of players) {
    const s = scores[p.id] ?? 0;
    if (s > maxScore) { maxScore = s; winnerId = p.id; }
  }

  for (const player of players) {
    const prev = stats.players[player.name] ?? { name: player.name, wins: 0, gamesPlayed: 0, bestScore: 0, totalPoints: 0 };
    const playerScore = scores[player.id] ?? 0;
    stats.players[player.name] = {
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      wins: prev.wins + (player.id === winnerId ? 1 : 0),
      bestScore: Math.max(prev.bestScore, playerScore),
      totalPoints: prev.totalPoints + playerScore,
    };
  }

  // ─── Avaliar conquistas ──────────────────────────────────────────────
  unlock('first_game');
  if (stats.gamesPlayed >= 5) unlock('five_games');
  if (stats.gamesPlayed >= 20) unlock('twenty_games');

  const totalWins = Object.values(stats.players).reduce((s, p) => s + p.wins, 0);
  if (totalWins >= 1) unlock('first_win');
  if (totalWins >= 5) unlock('five_wins');

  if (maxScore >= letters.length && letters.length > 0) unlock('perfect_alphabet');
  if (stats.lettersUsed.length >= TOTAL_LETTERS) unlock('all_letters');

  // Streak: incrementa se ninguém desistiu de nenhuma ronda
  if (options?.gaveUpAnyRound) {
    stats.currentStreak = 0;
  } else {
    stats.currentStreak += 1;
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  }
  if (stats.currentStreak >= 3) unlock('streak_3');

  saveStats(stats);
  return newlyUnlocked;
}
