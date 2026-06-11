/**
 * Verifica se a palavra começa pela letra correcta (ignora acentos).
 * A validação do conteúdo é feita pelos jogadores humanos.
 */
export function startsWithLetter(word: string, letter: string): boolean {
  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return normalize(word.trim()).startsWith(normalize(letter));
}
