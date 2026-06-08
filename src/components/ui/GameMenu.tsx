import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { cancelSpeech } from '@/services/speechService';
import './GameMenu.css';

export function GameMenu() {
  const { dispatch } = useGame();
  const [open, setOpen] = useState(false);

  function handleRestart() {
    cancelSpeech();
    dispatch({ type: 'RESET' });
    setOpen(false);
  }

  function handleSetup() {
    cancelSpeech();
    dispatch({ type: 'GO_TO_SETUP' });
    setOpen(false);
  }

  return (
    <>
      {/* Botão discreto no canto */}
      <button
        className="game-menu-btn"
        onClick={() => setOpen(true)}
        aria-label="Menu do jogo"
      >
        ⋯
      </button>

      {/* Overlay */}
      {open && (
        <div className="game-menu-overlay" onClick={() => setOpen(false)}>
          <div className="game-menu-panel animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="game-menu-title">Menu</div>

            <button className="game-menu-item" onClick={handleRestart}>
              <span className="game-menu-item-icon">🔄</span>
              <div>
                <div className="game-menu-item-label">Recomeçar jogo</div>
                <div className="game-menu-item-desc">Mantém os jogadores e configuração</div>
              </div>
            </button>

            <button className="game-menu-item" onClick={handleSetup}>
              <span className="game-menu-item-icon">⚙️</span>
              <div>
                <div className="game-menu-item-label">Alterar configuração</div>
                <div className="game-menu-item-desc">Volta ao ecrã inicial</div>
              </div>
            </button>

            <button className="game-menu-cancel" onClick={() => setOpen(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
