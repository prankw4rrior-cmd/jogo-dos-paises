import { useState } from 'react';
import './TimeSelector.css';

const PRESETS = [30, 60, 90];

interface TimeSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function TimeSelector({ value, onChange }: TimeSelectorProps) {
  const isCustom = !PRESETS.includes(value);
  const [customValue, setCustomValue] = useState(isCustom ? String(value) : '');
  const [showCustom, setShowCustom] = useState(isCustom);

  function handlePreset(seconds: number) {
    setShowCustom(false);
    onChange(seconds);
  }

  function handleCustomInput(raw: string) {
    setCustomValue(raw);
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 10 && n <= 300) {
      onChange(n);
    }
  }

  function handleCustomToggle() {
    setShowCustom(true);
    setCustomValue(String(value));
  }

  return (
    <div className="time-selector">
      <div className="time-presets">
        {PRESETS.map((s) => (
          <button
            key={s}
            className={`time-preset-btn ${!showCustom && value === s ? 'active' : ''}`}
            onClick={() => handlePreset(s)}
          >
            {s}s
          </button>
        ))}
        <button
          className={`time-preset-btn ${showCustom ? 'active' : ''}`}
          onClick={handleCustomToggle}
        >
          Outro
        </button>
      </div>

      {showCustom && (
        <div className="time-custom animate-slide-up">
          <input
            type="number"
            className="time-custom-input"
            value={customValue}
            onChange={(e) => handleCustomInput(e.target.value)}
            min={10}
            max={300}
            placeholder="Ex: 45"
          />
          <span className="time-custom-unit">segundos (10–300)</span>
        </div>
      )}
    </div>
  );
}
