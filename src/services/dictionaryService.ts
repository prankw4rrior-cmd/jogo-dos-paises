/**
 * Valida palavras usando a API do Wiktionary em português.
 * Gratuita, sem chave de API necessária.
 */

const CACHE = new Map<string, boolean>();

/**
 * Verifica se uma palavra existe no Wiktionary em português.
 * Usa cache para evitar pedidos repetidos.
 */
export async function validateWord(word: string): Promise<boolean> {
  const clean = word.trim().toLowerCase();
  if (clean.length < 2) return false;

  // Verificar cache primeiro
  if (CACHE.has(clean)) return CACHE.get(clean)!;

  try {
    const encoded = encodeURIComponent(clean);
    const url = `https://pt.wiktionary.org/api/rest_v1/page/summary/${encoded}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });

    if (res.status === 404) {
      CACHE.set(clean, false);
      return false;
    }

    if (!res.ok) {
      // Em caso de erro de rede, aceitar a palavra (benefício da dúvida)
      return true;
    }

    const data = await res.json() as { type?: string; title?: string };

    // Wiktionary devolve 'disambiguation' para páginas de desambiguação
    // e tem o conteúdo para palavras reais
    const exists = data.type !== 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found'
      && !!data.title;

    CACHE.set(clean, exists);
    return exists;

  } catch {
    // Timeout ou sem internet — aceitar a palavra
    return true;
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
