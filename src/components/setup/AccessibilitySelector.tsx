import type { FontSize } from '@/types';
import { Toggle } from '@/components/ui/Toggle';
import { applyFontSize, applyHighContrast, applyColorBlindMode } from '@/services/accessibilityService';
import { saveSettings } from '@/services/storageService';
import './AccessibilitySelector.css';

const FONT_SIZES: { key: FontSize; label: string; sample: string }[] = [
  { key: 'small',  label: 'Pequena', sample: 'A' },
  { key: 'medium', label: 'Normal',  sample: 'A' },
  { key: 'large',  label: 'Grande',  sample: 'A' },
  { key: 'xlarge', label: 'Enorme',  sample: 'A' },
];

interface AccessibilitySelectorProps {
  fontSize: FontSize;
  highContrast: boolean;
  colorBlindMode: boolean;
  onFontSizeChange: (s: FontSize) => void;
  onHighContrastChange: (v: boolean) => void;
  onColorBlindChange: (v: boolean) => void;
}

export function AccessibilitySelector({
  fontSize, highContrast, colorBlindMode,
  onFontSizeChange, onHighContrastChange, onColorBlindChange,
}: AccessibilitySelectorProps) {

  function handleFontSize(size: FontSize) {
    onFontSizeChange(size);
    applyFontSize(size);
    saveSettings({ fontSize: size });
  }

  function handleHighContrast(v: boolean) {
    onHighContrastChange(v);
    applyHighContrast(v);
    saveSettings({ highContrast: v });
  }

  function handleColorBlind(v: boolean) {
    onColorBlindChange(v);
    applyColorBlindMode(v);
    saveSettings({ colorBlindMode: v });
  }

  return (
    <div className="accessibility-selector">
      <div className="font-size-row">
        {FONT_SIZES.map(fs => (
          <button
            key={fs.key}
            className={`font-size-btn ${fontSize === fs.key ? 'active' : ''}`}
            onClick={() => handleFontSize(fs.key)}
          >
            <span className={`font-size-sample font-size-sample-${fs.key}`}>{fs.sample}</span>
            <span className="font-size-label">{fs.label}</span>
          </button>
        ))}
      </div>

      <div className="option-divider" />
      <Toggle
        checked={highContrast}
        onChange={handleHighContrast}
        label="Alto contraste"
        description="Cores mais fortes, mais fácil de ler"
      />

      <div className="option-divider" />
      <Toggle
        checked={colorBlindMode}
        onChange={handleColorBlind}
        label="Modo daltónico"
        description="Ícones extra nas categorias além da cor"
      />
    </div>
  );
}
