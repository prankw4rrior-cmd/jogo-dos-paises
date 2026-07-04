/**
 * Serviço de reconhecimento de voz usando Web Speech API.
 * Usa any para compatibilidade com webkitSpeechRecognition.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export function isRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

type RecognitionCallback = (transcript: string, isFinal: boolean) => void;
type ErrorCallback = (error: string) => void;

let recognition: any = null;

export function startRecognition(
  onResult: RecognitionCallback,
  onError: ErrorCallback,
  onEnd: () => void
): void {
  if (!isRecognitionSupported()) {
    onError('Reconhecimento de voz não suportado neste browser.');
    return;
  }

  // Parar qualquer reconhecimento anterior antes de iniciar novo
  if (recognition) {
    try { recognition.abort(); } catch { /* ignorar */ }
    recognition = null;
  }

  const SR = ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  recognition = new SR();
  recognition.lang = 'pt-PT';
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;

  recognition.onresult = (event: any) => {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim();
    const isFinal = result.isFinal;
    onResult(transcript, isFinal);
  };

  recognition.onerror = (event: any) => {
    onError(event.error as string);
  };

  recognition.onend = () => {
    recognition = null;
    onEnd();
  };

  recognition.start();
}

export function stopRecognition(): void {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}
