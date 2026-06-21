import { useGame, HINTS_PER_GAME, EXTRA_TIME_PER_GAME } from '@/context/GameContext';
import { getRandomExample } from '@/data/examples';
import './PowerUps.css';

interface PowerUpsProps {
  isPlaying: boolean;
}

export function PowerUps({ isPlaying }: PowerUpsProps) {
  const { state, dispatch } = useGame();
  const { config, currentPlayerIndex, hintUsedThisRound, hintUses, extraTimeUses, currentLetter, currentCategories } = state;

  if (!config.powerUpsEnabled || !isPlaying) return null;

  const currentPlayer = config.players[currentPlayerIndex];
  if (!currentPlayer) return null;

  const hintsLeft = HINTS_PER_GAME - (hintUses[currentPlayer.id] ?? 0);
  const extraTimeLeft = EXTRA_TIME_PER_GAME - (extraTimeUses[currentPlayer.id] ?? 0);

  function handleHint() {
    dispatch({ type: 'USE_HINT', payload: { playerId: currentPlayer.id } });
  }

  function handleExtraTime() {
    dispatch({ type: 'USE_EXTRA_TIME', payload: { playerId: currentPlayer.id } });
  }

  // Calcular a dica (primeira letra da resposta de exemplo)
  const example = getRandomExample(currentLetter);
  const hintCategory = currentCategories[0];
  const hintWord = example?.[hintCategory];
  const hintText = hintWord ? `${hintWord.slice(0, 2)}…` : null;

  return (
    <div className="power-ups">
      <button
        className="power-up-btn"
        onClick={handleHint}
        disabled={hintsLeft <= 0 || hintUsedThisRound}
      >
        <span className="power-up-icon">💡</span>
        <span className="power-up-label">Dica</span>
        <span className="power-up-count">{hintsLeft}</span>
      </button>

      <button
        className="power-up-btn"
        onClick={handleExtraTime}
        disabled={extraTimeLeft <= 0 || config.noTimer}
      >
        <span className="power-up-icon">⏱️</span>
        <span className="power-up-label">+15s</span>
        <span className="power-up-count">{extraTimeLeft}</span>
      </button>

      {hintUsedThisRound && hintText && (
        <div className="power-up-hint-display animate-scale-in">
          💡 Começa por: <strong>{hintText}</strong>
        </div>
      )}
    </div>
  );
}
