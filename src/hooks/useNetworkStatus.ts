import { useEffect, useState } from 'react';

/**
 * Hook que monitoriza o estado da ligação à internet.
 * Útil para mostrar avisos no modo online quando a ligação falha.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      // Marcar que esteve offline para mostrar mensagem de "reconectado"
      setWasOffline(prev => prev); // mantém o estado actual até ser limpo manualmente
    }
    function handleOffline() {
      setIsOnline(false);
      setWasOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function clearWasOffline() {
    setWasOffline(false);
  }

  return { isOnline, wasOffline, clearWasOffline };
}
