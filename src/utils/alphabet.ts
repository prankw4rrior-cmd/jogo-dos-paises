/**
 * Alfabeto português para o Jogo dos Países.
 * Exclui K, W e Y por serem raros em palavras portuguesas.
 */

export const ALPHABET_PT: string[] = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  'V', 'X', 'Z',
];

export const TOTAL_LETTERS = ALPHABET_PT.length;

/** Embaralha um array (Fisher-Yates) sem modificar o original */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sorteia uma letra aleatória de um array de letras disponíveis */
export function pickRandomLetter(remaining: string[]): string {
  const idx = Math.floor(Math.random() * remaining.length);
  return remaining[idx];
}

/** Remove uma letra do array de disponíveis */
export function removeLetter(remaining: string[], letter: string): string[] {
  return remaining.filter((l) => l !== letter);
}
