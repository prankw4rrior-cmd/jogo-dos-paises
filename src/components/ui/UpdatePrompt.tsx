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

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      registrationRef.current = reg;

      // Se já há um worker à espera, mostrar logo
      if (reg.waiting) {
        waitingWorkerRef.current = reg.waiting;
        setShow(true);
      }

      // Detectar quando um novo worker é encontrado
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorkerRef.current = newWorker;
            setShow(true);
          }
        });
      });
    });

    // Verificar updates periodicamente (a cada 30 min)
    const interval = setInterval(() => {
      registrationRef.current?.update();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  function handleUpdate() {
    const worker = waitingWorkerRef.current;
    if (!worker) {
      window.location.reload();
      return;
    }
    worker.postMessage({ type: 'SKIP_WAITING' });
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        window.location.reload();
      }
    });
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
