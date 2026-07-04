import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { playTimeUp, vibrateTimeUp } from '@/services/soundService';

let _display = 0;
let _listeners: Array<(v: number) => void> = [];
let _interval: ReturnType<typeof setInterval> | null = null;
let _endTime: number | null = null;
let _fired = false;
let _dispatchFn: ((action: { type: 'START_SCORING' }) => void) | null = null;
let _paused = false;
let _remainingMs = 0;

function notifyListeners(v: number) {
  _display = v;
  _listeners.forEach(fn => fn(v));
}

function stopInterval() {
  if (_interval !== null) {
    clearInterval(_interval);
    _interval = null;
  }
}

/** Reset completo do timer global — chamar ao sair do jogo ou reiniciar */
export function resetGlobalTimer(): void {
  stopInterval();
  _endTime = null;
  _fired = false;
  _paused = false;
  _remainingMs = 0;
  _display = 0;
}

function startInterval() {
  stopInterval();
  _interval = setInterval(() => {
    if (_paused) return;
    const remaining = Math.ceil((_endTime! - Date.now()) / 1000);
    if (remaining <= 0) {
      stopInterval();
      notifyListeners(0);
      if (!_fired && _dispatchFn) {
        _fired = true;
        playTimeUp();
        vibrateTimeUp();
        _dispatchFn({ type: 'START_SCORING' });
      }
    } else {
      notifyListeners(remaining);
    }
  }, 200);
}

export function useTimer() {
  const { state, dispatch } = useGame();
  const isRunning = state.phase === 'playing';
  const isPaused = state.phase === 'paused';
  const noTimer = state.config.noTimer;
  const duration = state.config.lightningMode ? 10 : state.config.timePerRound;
  const [display, setDisplay] = useState(duration);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const listener = (v: number) => { if (mountedRef.current) setDisplay(v); };
    _listeners.push(listener);
    setDisplay(_display || duration);
    return () => {
      mountedRef.current = false;
      _listeners = _listeners.filter(fn => fn !== listener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    _dispatchFn = dispatch;

    if (noTimer) {
      stopInterval();
      return;
    }

    if (isPaused) {
      // Pausar: guardar tempo restante e parar o intervalo
      _paused = true;
      _remainingMs = Math.max(0, (_endTime ?? 0) - Date.now());
      stopInterval();
    } else if (isRunning) {
      _paused = false;
      if (_endTime === null) {
        // Início de nova ronda
        _endTime = Date.now() + duration * 1000;
        _fired = false;
        notifyListeners(duration);
      } else if (_remainingMs > 0) {
        // Retomar após pausa
        _endTime = Date.now() + _remainingMs;
        _remainingMs = 0;
      }
      startInterval();
    } else {
      // announcing / scoring / countdown — resetar
      stopInterval();
      _endTime = null;
      _fired = false;
      _paused = false;
      _remainingMs = 0;
      notifyListeners(duration);
      setDisplay(duration);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isPaused, state.phase, duration]);

  const percentage = duration > 0 ? (display / duration) * 100 : 100;

  return {
    timeRemaining: display,
    percentage,
    isRunning,
    isDanger: !noTimer && display <= 10 && display > 0,
    isWarning: !noTimer && display <= 20 && display > 10,
    noTimer,
  };
}
