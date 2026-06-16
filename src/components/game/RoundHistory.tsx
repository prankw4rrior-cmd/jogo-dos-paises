import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import type { CategoryKey } from '@/types';
import './RoundHistory.css';

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  pais: 'País', nome: 'Nome', cor: 'Cor', animal: 'Animal',
  objeto: 'Objeto', fruta: 'Fruta', cidade: 'Cidade',
  profissao: 'Profissão', marca: 'Marca', filme: 'Filme',
};

export function RoundHistory() {
  const { state } = useGame();
  const [open, setOpen] = useState(false);

  if (state.history.length === 0) return null;

  return (
    <div className="round-history-wrapper">
      <button className="round-history-toggle" onClick={() => setOpen(v => !v)}>
        📋 Histórico ({state.history.length} rondas) {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="round-history-list animate-slide-up">
          {[...state.history].reverse().map((h, i) => (
            <div key={i} className="round-history-item">
              <div className="rh-header">
                <span className="rh-letter">{h.letter}</span>
                <span className="rh-player">{h.playerName}</span>
                <span className="rh-round">Ronda {h.round}</span>
              </div>
              <div className="rh-answers">
                {h.categories.map(cat => {
                  const ans = h.answers.find(a => a.category === cat);
                  const ex = h.examples[cat];
                  return (
                    <div key={cat} className="rh-answer-row">
                      <span className="rh-cat">{CATEGORY_LABELS[cat]}</span>
                      {ans ? (
                        <span className={`rh-answer ${ans.valid ? 'rh-valid' : 'rh-invalid'}`}>
                          {ans.valid ? '✓' : '✗'} {ans.answer}
                        </span>
                      ) : (
                        <span className="rh-no-answer">—</span>
                      )}
                      {ex && <span className="rh-example">ex: {ex}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
