import { useState, useEffect, useRef } from 'react';
import './UpdatePrompt.css';

/**
 * Detecta quando há uma nova versão da PWA disponível
 * (Service Worker actualizado) e mostra um aviso ao utilizador.
 */
export function UpdatePrompt() {
  const [show, setShow] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let cancelled = false;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg || cancelled) return;
      registrationRef.current = reg;

      // Se já há um worker à espera, mostrar logo
      if (reg.waiting) {
        waitingWorkerRef.current = reg.waiting;
        setShow(true);
        return;
      }

      // Se há um worker a instalar, observar o seu estado
      if (reg.installing) {
        const newWorker = reg.installing;
        const onStateChange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorkerRef.current = newWorker;
            setShow(true);
          }
        };
        newWorker.addEventListener('statechange', onStateChange);
      }

      // Detectar quando um novo worker é encontrado no futuro
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        const onStateChange = () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorkerRef.current = newWorker;
            setShow(true);
          }
        };
        newWorker.addEventListener('statechange', onStateChange);
      });
    });

    // Verificar updates periodicamente (a cada 30 min)
    const interval = setInterval(() => {
      registrationRef.current?.update();
    }, 30 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  function handleUpdate() {
    const worker = waitingWorkerRef.current;
    if (!worker) {
      window.location.reload();
      return;
    }
    const onStateChange = () => {
      if (worker.state === 'activated') {
        worker.removeEventListener('statechange', onStateChange);
        window.location.reload();
      }
    };
    worker.addEventListener('statechange', onStateChange);
    worker.postMessage({ type: 'SKIP_WAITING' });
  }

  if (!show) return null;

  return (
    <div className="update-prompt animate-slide-up">
      <div className="update-prompt-content">
        <span className="update-prompt-icon">🔄</span>
        <div className="update-prompt-text">
          <strong>Nova versão disponível</strong>
          <span>Actualiza para teres as últimas novidades</span>
        </div>
      </div>
      <div className="update-prompt-actions">
        <button className="update-prompt-later" onClick={() => setShow(false)}>Depois</button>
        <button className="update-prompt-now" onClick={handleUpdate}>Actualizar</button>
      </div>
    </div>
  );
}
