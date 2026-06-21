import type { Achievement } from '@/types';

/** Definições estáticas de todas as conquistas possíveis */
export const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_game', title: 'Primeira Partida', description: 'Jogaste o teu primeiro jogo', emoji: '🎮' },
  { id: 'five_games', title: 'A Apanhar o Jeito', description: 'Jogaste 5 jogos', emoji: '🎲' },
  { id: 'twenty_games', title: 'Veterano', description: 'Jogaste 20 jogos', emoji: '🏅' },
  { id: 'first_win', title: 'Primeira Vitória', description: 'Ganhaste o teu primeiro jogo', emoji: '🥇' },
  { id: 'five_wins', title: 'Imparável', description: 'Ganhaste 5 jogos', emoji: '👑' },
  { id: 'perfect_alphabet', title: 'Alfabeto Perfeito', description: 'Acertaste em todas as rondas de um jogo', emoji: '💯' },
  { id: 'all_letters', title: 'Mestre das Letras', description: 'Jogaste com todas as 23 letras', emoji: '🔤' },
  { id: 'streak_3', title: 'Em Forma', description: '3 jogos seguidos sem desistir de nenhuma ronda', emoji: '🔥' },
];

export function getAchievementDef(id: string): Omit<Achievement, 'unlockedAt'> | undefined {
  return ACHIEVEMENT_DEFS.find(a => a.id === id);
}
