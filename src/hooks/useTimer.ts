import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/context/GameContext';

// Singleton: guarda o estado do timer fora do React
// para que múltiplos componentes partilhem o mesmo valor
// sem criar múltiplos intervalos.
let _display = 0;
let _listeners: Array<(v: number) => void> = [];

function notifyListeners(v: number) {
  _display = v;
  _listeners.forEach(fn => fn(v));
}

let _interval: ReturnType<typeof setInterval> | null = null;
let _endTime: number | null = null;
let _fired = false;
let _dispatchFn: ((action: { type: 'START_SCORING' }) => void) | null = null;

function startTimer(duration: number) {
  stopTimer();
  _endTime = Date.now() + duration * 1000;
  _fired = false;
  notifyListeners(duration);

  _interval = setInterval(() => {
    const remaining = Math.ceil((_endTime! - Date.now()) / 1000);
    if (remaining <= 0) {
      stopTimer();
      notifyListeners(0);
      if (!_fired && _dispatchFn) {
        _fired = true;
        _dispatchFn({ type: 'START_SCORING' });
      }
    } else {
      notifyListeners(remaining);
    }
  }, 200);
}

function stopTimer() {
  if (_interval !== null) {
    clearInterval(_interval);
    _interval = null;
  }
}

/**
 * Hook do timer — usa um singleton global para que
 * múltiplos componentes partilhem o mesmo intervalo.
 */
export function useTimer() {
  const { state, dispatch } = useGame();
  const isRunning = state.phase === 'playing';
  const duration = state.config.timePerRound;
  const [display, setDisplay] = useState(duration);
  const mountedRef = useRef(false);

  // Registar este componente como listener
  useEffect(() => {
    mountedRef.current = true;
    const listener = (v: number) => {
      if (mountedRef.current) setDisplay(v);
    };
    _listeners.push(listener);
    setDisplay(_display || duration);

    return () => {
      mountedRef.current = false;
      _listeners = _listeners.filter(fn => fn !== listener);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlar start/stop
  useEffect(() => {
    _dispatchFn = dispatch;

    if (isRunning) {
      startTimer(duration);
    } else {
      stopTimer();
      if (state.phase === 'announcing') {
        notifyListeners(duration);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, state.phase]);

  const percentage = duration > 0 ? (display / duration) * 100 : 0;

  return {
    timeRemaining: display,
    percentage,
    isRunning,
    isDanger: display <= 10 && display > 0,
    isWarning: display <= 20 && display > 10,
  };
}
