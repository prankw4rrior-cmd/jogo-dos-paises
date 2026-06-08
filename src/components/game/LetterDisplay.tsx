import { useRef } from 'react';
import './LetterDisplay.css';

interface LetterDisplayProps {
  letter: string;
  isAnnouncing: boolean;
}

export function LetterDisplay({ letter, isAnnouncing }: LetterDisplayProps) {
  const prevLetterRef = useRef(letter);
  const keyRef = useRef(0);

  // Incrementar key para forçar re-animação quando a letra muda
  if (prevLetterRef.current !== letter) {
    prevLetterRef.current = letter;
    keyRef.current += 1;
  }

  return (
    <div className={`letter-display-wrapper ${isAnnouncing ? 'is-announcing' : ''}`}>
      <div className="letter-glow" />
      <div
        key={keyRef.current}
        className="letter-char"
        aria-live="polite"
        aria-label={`Letra ${letter}`}
      >
        {letter}
      </div>
      {isAnnouncing && (
        <div className="letter-announcing-label animate-fade-in">
          A preparar…
        </div>
      )}
    </div>
  );
}
