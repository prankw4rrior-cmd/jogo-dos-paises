import { useState, useEffect } from 'react';
import './Countdown.css';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [count, onComplete]);

  return (
    <div className="countdown-overlay">
      <div key={count} className="countdown-number">
        {count === 0 ? 'Já!' : count}
      </div>
    </div>
  );
}
