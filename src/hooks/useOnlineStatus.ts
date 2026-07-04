import { useState, useEffect } from 'react';

/**
 * Detecta o estado da ligação à internet.
 * Único hook de rede — usado pelo ConnectionBanner e OnlineGame.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 3000);
    }
    function handleOffline() {
      setIsOnline(false);
      setJustReconnected(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, justReconnected };
}
