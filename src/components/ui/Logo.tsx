import './Logo.css';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

export function Logo({ size = 'md', showName = true }: LogoProps) {
  return (
    <div className={`logo logo-${size}`}>
      <svg
        className="logo-svg"
        viewBox="0 0 280 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Letra a Letra"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6c63ff"/>
            <stop offset="100%" stopColor="#ff6b9d"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="280" height="100" rx="50"
          fill="url(#logoGrad)" fillOpacity="0.15"
          stroke="url(#logoGrad)" strokeWidth="2"/>
        <text x="85" y="77" textAnchor="middle"
          fontFamily="Georgia, serif" fontSize="75" fontWeight="700"
          fill="#6c63ff">A</text>
        <text x="140" y="62" textAnchor="middle"
          fontFamily="Georgia, serif" fontSize="22" fontWeight="400"
          fill="#9090b0">—</text>
        <text x="197" y="77" textAnchor="middle"
          fontFamily="Georgia, serif" fontSize="75" fontWeight="700"
          fill="#ff6b9d">z</text>
      </svg>
      {showName && <span className="logo-name">Letra a Letra</span>}
    </div>
  );
}
