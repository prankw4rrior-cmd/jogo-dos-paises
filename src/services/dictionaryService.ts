/**
 * Serviço de validação de palavras.
 *
 * Estratégia por categoria:
 * - Nomes próprios (País, Cidade, Nome, Marca, Filme): aceitar se começar pela letra correcta
 *   (nomes próprios não existem em dicionários comuns)
 * - Palavras comuns (Cor, Animal, Objeto, Fruta, Profissão): verificar no Wiktionary PT
 */

import type { CategoryKey } from '@/types';

// Categorias de nomes próprios — não verificar no dicionário
const PROPER_NOUN_CATEGORIES: CategoryKey[] = ['pais', 'nome', 'cidade', 'marca', 'filme'];

const CACHE = new Map<string, boolean>();

/**
 * Verifica se uma palavra existe no Wiktionary em português.
 */
async function checkWiktionary(word: string): Promise<boolean> {
  const clean = word.trim().toLowerCase();
  if (CACHE.has(clean)) return CACHE.get(clean)!;

  try {
    const encoded = encodeURIComponent(clean);
    const url = `https://pt.wiktionary.org/api/rest_v1/page/summary/${encoded}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });

    if (res.status === 404) {
      CACHE.set(clean, false);
      return false;
    }

    if (!res.ok) return true; // erro de rede — aceitar

    const data = await res.json() as { type?: string; title?: string };
    const exists = !!data.title && data.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found';

    CACHE.set(clean, exists);
    return exists;
  } catch {
    return true; // sem internet — aceitar
  }
}

/**
 * Verifica se a palavra começa pela letra correcta (ignora acentos).
 */
export function startsWithLetter(word: string, letter: string): boolean {
  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return normalize(word.trim()).startsWith(normalize(letter));
}

/**
 * Valida uma resposta tendo em conta a categoria.
 * Devolve { valid, reason }
 */
export async function validateAnswer(
  word: string,
  letter: string,
  category: CategoryKey
): Promise<{ valid: boolean; reason: string }> {
  const trimmed = word.trim();

  if (trimmed.length < 2) {
    return { valid: false, reason: 'Palavra demasiado curta.' };
  }

  // Verificar letra
  if (!startsWithLetter(trimmed, letter)) {
    return { valid: false, reason: `"${trimmed}" não começa por ${letter.toUpperCase()}.` };
  }

  // Nomes próprios — aceitar directamente se começar pela letra
  if (PROPER_NOUN_CATEGORIES.includes(category)) {
    return { valid: true, reason: `✓ "${trimmed}" aceite!` };
  }

  // Palavras comuns — verificar no dicionário
  const exists = await checkWiktionary(trimmed);
  if (exists) {
    return { valid: true, reason: `✓ "${trimmed}" é válido!` };
  } else {
    return { valid: false, reason: `"${trimmed}" não foi encontrado no dicionário.` };
  }
}
