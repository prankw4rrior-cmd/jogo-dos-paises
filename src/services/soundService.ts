/**
 * Serviço de som e vibração.
 * Usa Web Audio API para gerar sons sem ficheiros externos.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioCtx) {
    try { audioCtx = new AudioContext(); } catch { return null; }
  }
  return audioCtx;
}

/** Toca um beep simples */
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.3): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gainNode.gain.setValueAtTime(gain, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

/** Som de tempo esgotado — beep duplo descendente */
export function playTimeUp(): void {
  playTone(880, 0.15, 'square', 0.2);
  setTimeout(() => playTone(440, 0.3, 'square', 0.2), 150);
}

/** Som de ponto adicionado — ding agradável */
export function playPoint(): void {
  playTone(880, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.2), 80);
}

/** Som de próxima letra — transição suave */
export function playNext(): void {
  playTone(660, 0.12, 'sine', 0.2);
}

/** Vibração (apenas dispositivos que suportam) */
export function vibrate(pattern: number | number[] = 200): void {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
}

/** Vibração de tempo esgotado — padrão duplo */
export function vibrateTimeUp(): void {
  vibrate([150, 100, 150]);
}

/** Sons diferentes por categoria */
export function playCategorySound(category: string): void {
  switch (category) {
    case 'animal':
      playTone(523, 0.08, 'sine', 0.2);
      setTimeout(() => playTone(659, 0.1, 'sine', 0.18), 80);
      setTimeout(() => playTone(523, 0.12, 'sine', 0.15), 180);
      break;
    case 'pais':
    case 'cidade':
      playTone(392, 0.1, 'square', 0.15);
      setTimeout(() => playTone(523, 0.1, 'square', 0.15), 120);
      setTimeout(() => playTone(659, 0.15, 'square', 0.15), 240);
      break;
    case 'cor':
      playTone(880, 0.08, 'sine', 0.18);
      setTimeout(() => playTone(1046, 0.1, 'sine', 0.15), 100);
      break;
    case 'fruta':
      playTone(784, 0.06, 'sine', 0.2);
      setTimeout(() => playTone(1046, 0.06, 'sine', 0.2), 70);
      setTimeout(() => playTone(1318, 0.1, 'sine', 0.18), 140);
      break;
    case 'filme':
    case 'marca':
      playTone(220, 0.15, 'sawtooth', 0.12);
      setTimeout(() => playTone(277, 0.15, 'sawtooth', 0.12), 150);
      break;
    case 'profissao':
      playTone(1046, 0.05, 'sine', 0.25);
      setTimeout(() => playTone(1318, 0.08, 'sine', 0.2), 60);
      setTimeout(() => playTone(1568, 0.12, 'sine', 0.15), 120);
      break;
    default:
      playTone(660, 0.1, 'sine', 0.2);
      setTimeout(() => playTone(880, 0.12, 'sine', 0.18), 100);
  }
}
