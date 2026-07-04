import { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';
import {
  announceRound, cancelSpeech, isSpeechSupported, preloadVoices,
} from '@/services/speechService';

export function useSpeech() {
  const { state, dispatch } = useGame();
  const hasAnnouncedRef = useRef(false);
  const lastRoundRef = useRef(-1);

  useEffect(() => { void preloadVoices(); }, []);

  useEffect(() => {
    const { phase, config, currentLetter, round } = state;

    if (phase !== 'announcing') {
      hasAnnouncedRef.current = false;
      return;
    }

    if (lastRoundRef.current === round && hasAnnouncedRef.current) return;
    lastRoundRef.current = round;
    hasAnnouncedRef.current = true;

    let cancelled = false;

    const run = async () => {
      if (config.voiceEnabled && isSpeechSupported()) {
        await announceRound(currentLetter);
      } else {
        await new Promise((r) => setTimeout(r, 400));
      }
      if (!cancelled) dispatch({ type: 'START_PLAYING' });
    };

    void run();

    return () => {
      cancelled = true;
      cancelSpeech();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.round]);
}
