import { useGame } from '@/context/GameContext';
import './LetterHistory.css';

export function LetterHistory() {
  const { state } = useGame();
  const { usedLetters, remainingLetters } = state;

  if (usedLetters.length <= 1) return null;

  return (
    <div className="letter-history">
      <span className="letter-history-label">Letras jogadas:</span>
      <div className="letter-history-chips">
        {usedLetters.map((l, i) => (
          <span
            key={`${l}-${i}`}
            className={`letter-chip ${l === state.currentLetter ? 'letter-chip-current' : 'letter-chip-used'}`}
          >
            {l}
          </span>
        ))}
        {remainingLetters.length > 0 && (
          <span className="letter-chip-remaining">+{remainingLetters.length}</span>
        )}
      </div>
    </div>
  );
}
