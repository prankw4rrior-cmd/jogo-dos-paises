import { useState, useEffect } from 'react';
import './InstallBanner.css';

/**
 * Banner de instalação para iOS (Safari não suporta beforeinstallprompt).
 * Mostra instruções "Adicionar ao ecrã principal" apenas em iOS Safari.
 */
export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Detectar iOS Safari
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = localStorage.getItem('jdp_install_dismissed');

    if (isIOS && isSafari && !isStandalone && !dismissed) {
      // Mostrar após 3 segundos
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem('jdp_install_dismissed', '1');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="install-banner animate-slide-up">
      <div className="install-banner-content">
        <span className="install-banner-icon">📲</span>
        <div className="install-banner-text">
          <strong>Instalar app</strong>
          <span>Toca em <strong>Partilhar</strong> → <strong>Adicionar ao ecrã principal</strong></span>
        </div>
      </div>
      <button className="install-banner-close" onClick={dismiss} aria-label="Fechar">×</button>
    </div>
  );
}
