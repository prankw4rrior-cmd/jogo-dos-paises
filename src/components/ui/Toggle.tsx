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
    <label className={`toggle-wrapper ${disabled ? 'toggle-disabled' : ''}`}>
      <div className="toggle-text">
        {label && <span className="toggle-label">{label}</span>}
        {description && <span className="toggle-desc">{description}</span>}
      </div>
      <div className={`toggle-track ${checked ? 'toggle-on' : ''}`} onClick={() => !disabled && onChange(!checked)}>
        <div className="toggle-thumb" />
      </div>
    </label>
  );
}
