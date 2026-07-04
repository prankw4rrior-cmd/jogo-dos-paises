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

/** Sorteia uma letra aleatória de um array de letras disponíveis */
export function pickRandomLetter(remaining: string[]): string {
  if (remaining.length === 0) return 'A'; // fallback defensivo
  const idx = Math.floor(Math.random() * remaining.length);
  return remaining[idx];
}

/** Remove uma letra do array de disponíveis */
export function removeLetter(remaining: string[], letter: string): string[] {
  return remaining.filter((l) => l !== letter);
}
