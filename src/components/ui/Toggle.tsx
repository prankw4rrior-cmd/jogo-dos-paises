import './Toggle.css';

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, disabled }: ToggleProps) {
  return (
    <div className={`toggle-wrapper ${disabled ? 'toggle-disabled' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!disabled) onChange(!checked); } }}
    >
      <div className="toggle-text">
        {label && <span className="toggle-label">{label}</span>}
        {description && <span className="toggle-desc">{description}</span>}
      </div>
      <div className={`toggle-track ${checked ? 'toggle-on' : ''}`}>
        <div className="toggle-thumb" />
      </div>
    </div>
  );
}
