/**
 * Serviço de voz usando Web Speech API.
 * Anuncia a letra em português de Portugal.
 */

/** Detecta se o browser suporta síntese de voz */
export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** Encontra a melhor voz disponível em português */
function getPortugueseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();

  // Preferência: pt-PT → pt-BR → pt genérico
  const ptPT = voices.find((v) => v.lang === 'pt-PT');
  if (ptPT) return ptPT;

  const ptBR = voices.find((v) => v.lang === 'pt-BR');
  if (ptBR) return ptBR;

  const pt = voices.find((v) => v.lang.startsWith('pt'));
  if (pt) return pt;

  return null;
}

/**
 * Faz o browser dizer uma frase.
 * Devolve uma Promise que resolve quando o utterance termina.
 */
function speak(text: string, rate = 0.9, pitch = 1.0): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // cancelar qualquer fala em curso

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-PT';
    utterance.rate = rate;
    utterance.pitch = pitch;

    const voice = getPortugueseVoice();
    if (voice) utterance.voice = voice;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve(); // não bloquear em caso de erro

    window.speechSynthesis.speak(utterance);
  });
}

/** Pausa curta entre anúncios (em ms) */
const SHORT_PAUSE_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Anuncia a letra actual.
 * A categoria é mostrada visualmente — não é lida em voz alta
 * para dar suspense ao jogador.
 */
export async function announceRound(letter: string): Promise<void> {
  if (!isSpeechSupported()) return;
  await speak(`Letra: ${letter}`, 0.85, 1.1);
  await delay(SHORT_PAUSE_MS);
}

/** Apenas anuncia a letra */
export async function announceLetter(letter: string): Promise<void> {
  if (!isSpeechSupported()) return;
  await speak(`Letra: ${letter}`, 0.85, 1.1);
}

/** Anuncia o fim do tempo */
export async function announceTimeUp(): Promise<void> {
  if (!isSpeechSupported()) return;
  await speak('Tempo esgotado!', 0.9, 1.0);
}

/** Anuncia o vencedor */
export async function announceWinner(name: string): Promise<void> {
  if (!isSpeechSupported()) return;
  await speak(`O vencedor é ${name}! Parabéns!`, 0.85, 1.05);
}

/** Para qualquer fala em curso */
export function cancelSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Carrega as vozes disponíveis.
 * Necessário em alguns browsers onde getVoices() começa vazio.
 */
export function preloadVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve();
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve();
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => resolve();
    // Timeout de segurança
    setTimeout(resolve, 1500);
  });
}
