import { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('out'), 1800);
    const t3 = setTimeout(() => onDone(), 2300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className={`splash-screen splash-${phase}`}>
      <div className="splash-content">
        {/* Badge A—z animado */}
        <div className="splash-badge">
          <svg viewBox="0 0 280 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="splashGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6c63ff"/>
                <stop offset="100%" stopColor="#ff6b9d"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="280" height="100" rx="50"
              fill="url(#splashGrad)" fillOpacity="0.18"
              stroke="url(#splashGrad)" strokeWidth="2"/>
            <text x="85" y="77" textAnchor="middle"
              fontFamily="Fredoka, sans-serif" fontSize="75" fontWeight="700"
              fill="#6c63ff">A</text>
            <text x="140" y="62" textAnchor="middle"
              fontFamily="Fredoka, sans-serif" fontSize="22" fontWeight="400"
              fill="#9090b0">—</text>
            <text x="197" y="77" textAnchor="middle"
              fontFamily="Fredoka, sans-serif" fontSize="75" fontWeight="700"
              fill="#ff6b9d">z</text>
          </svg>
        </div>
        <h1 className="splash-title">Letra a Letra</h1>
        <p className="splash-subtitle">Com família e amigos</p>
      </div>
    </div>
  );
}
