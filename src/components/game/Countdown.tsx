import { useState, useEffect, useRef } from 'react';
import './Countdown.css';

interface CountdownProps {
  onComplete: () => void;
}

export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (count <= 0) {
      onCompleteRef.current();
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 800);
    return () => clearTimeout(t);
  }, [count]);

  return (
    <div className="countdown-overlay">
      <div key={count} className="countdown-number">
        {count === 0 ? 'Já!' : count}
      </div>
    </div>
  );
}
