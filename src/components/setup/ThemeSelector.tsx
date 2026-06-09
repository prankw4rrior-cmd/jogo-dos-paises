import type { AccentColor, ThemeOption } from '@/types';
import { applyTheme } from '@/context/GameContext';
import { saveSettings } from '@/services/storageService';
import './ThemeSelector.css';

const ACCENTS: { key: AccentColor; color: string; label: string }[] = [
  { key: 'purple', color: '#6c63ff', label: 'Roxo' },
  { key: 'blue',   color: '#3b82f6', label: 'Azul' },
  { key: 'green',  color: '#22c55e', label: 'Verde' },
  { key: 'orange', color: '#f97316', label: 'Laranja' },
  { key: 'pink',   color: '#ec4899', label: 'Rosa' },
];

const ACCENT_VARS: Record<AccentColor, { accent: string; light: string; glow: string }> = {
  purple: { accent: '#6c63ff', light: '#8b84ff', glow: 'rgba(108,99,255,0.3)' },
  blue:   { accent: '#3b82f6', light: '#60a5fa', glow: 'rgba(59,130,246,0.3)' },
  green:  { accent: '#22c55e', light: '#4ade80', glow: 'rgba(34,197,94,0.3)'  },
  orange: { accent: '#f97316', light: '#fb923c', glow: 'rgba(249,115,22,0.3)' },
  pink:   { accent: '#ec4899', light: '#f472b6', glow: 'rgba(236,72,153,0.3)' },
};

export function applyAccent(color: AccentColor): void {
  const v = ACCENT_VARS[color];
  const root = document.documentElement;
  root.style.setProperty('--accent', v.accent);
  root.style.setProperty('--accent-light', v.light);
  root.style.setProperty('--accent-glow', v.glow);
  root.style.setProperty('--border-active', v.accent + '80');
  root.style.setProperty('--shadow-accent', `0 4px 24px ${v.glow}`);
}

interface ThemeSelectorProps {
  accent: AccentColor;
  theme: ThemeOption;
  onAccentChange: (a: AccentColor) => void;
  onThemeChange: (t: ThemeOption) => void;
}

export function ThemeSelector({ accent, theme, onAccentChange, onThemeChange }: ThemeSelectorProps) {
  function handleAccent(a: AccentColor) {
    onAccentChange(a);
    applyAccent(a);
    saveSettings({ accentColor: a });
  }

  function handleTheme(t: ThemeOption) {
    onThemeChange(t);
    applyTheme(t);
    saveSettings({ theme: t });
  }

  return (
    <div className="theme-selector">
      {/* Tema claro/escuro */}
      <div className="theme-modes">
        {(['system', 'light', 'dark'] as ThemeOption[]).map(t => (
          <button key={t} className={`theme-mode-btn ${theme === t ? 'active' : ''}`} onClick={() => handleTheme(t)}>
            {t === 'system' ? '⚙️ Auto' : t === 'light' ? '☀️ Claro' : '🌙 Escuro'}
          </button>
        ))}
      </div>

      {/* Cor de destaque */}
      <div className="accent-colors">
        {ACCENTS.map(a => (
          <button
            key={a.key}
            className={`accent-dot ${accent === a.key ? 'active' : ''}`}
            style={{ background: a.color }}
            onClick={() => handleAccent(a.key)}
            aria-label={a.label}
          >
            {accent === a.key && <span className="accent-check">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
