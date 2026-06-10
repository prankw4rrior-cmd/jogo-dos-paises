/**
 * Serviço de validação de palavras.
 *
 * Estratégia por categoria:
 * - Nomes próprios (País, Cidade, Nome, Marca, Filme): aceitar se começar pela letra correcta
 * - Palavras comuns (Cor, Animal, Objeto, Fruta, Profissão): verificar no dicionário local PT
 */

import type { CategoryKey } from '@/types';
import { wordExistsInDictionary } from '@/data/dictionary';

const PROPER_NOUN_CATEGORIES: CategoryKey[] = ['pais', 'nome', 'cidade', 'marca', 'filme'];

export function startsWithLetter(word: string, letter: string): boolean {
  const normalize = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return normalize(word.trim()).startsWith(normalize(letter));
}

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

  // Nomes próprios — aceitar directamente
  if (PROPER_NOUN_CATEGORIES.includes(category)) {
    return { valid: true, reason: `"${trimmed}" aceite!` };
  }

  // Palavras comuns — verificar no dicionário local
  const exists = wordExistsInDictionary(trimmed);
  if (exists) {
    return { valid: true, reason: `"${trimmed}" é válido!` };
  } else {
    return { valid: false, reason: `"${trimmed}" não está no dicionário português.` };
  }
}
