import { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import {
  announceRound,
  cancelSpeech,
  isSpeechSupported,
  preloadVoices,
} from '@/services/speechService';

/**
 * Anuncia automaticamente a letra e categoria quando phase='announcing'.
 * Quando termina, despacha START_PLAYING para iniciar o timer.
 */
export function useSpeech() {
  const { state, dispatch } = useGame();
  const hasAnnouncedRef = useRef(false);
  const currentLetterRef = useRef('');

  useEffect(() => {
    void preloadVoices();
  }, []);

  useEffect(() => {
    const { phase, config, currentLetter } = state;

    if (phase !== 'announcing') {
      hasAnnouncedRef.current = false;
      return;
    }

    // Evitar duplo anúncio na mesma letra (React StrictMode)
    if (currentLetterRef.current === currentLetter && hasAnnouncedRef.current) return;
    currentLetterRef.current = currentLetter;
    hasAnnouncedRef.current = true;

    let cancelled = false;

    const run = async () => {
      if (config.voiceEnabled && isSpeechSupported()) {
        await announceRound(currentLetter);
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      if (!cancelled) {
        dispatch({ type: 'START_PLAYING' });
      }
    };

    void run();

    return () => {
      cancelled = true;
      cancelSpeech();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.currentLetter]);
}
