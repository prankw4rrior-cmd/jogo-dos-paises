import { useMemo } from 'react';
import type { CategoryKey } from '@/types';
import { getRandomExample } from '@/data/examples';
import './CategoryDisplay.css';

interface CategoryDisplayProps {
  categoryKey: CategoryKey;
  isAnnouncing: boolean;
  isScoring: boolean;
  currentLetter: string;
}

const CATEGORY_INFO: Record<CategoryKey, { label: string; emoji: string; color: string }> = {
  pais:   { label: 'País',   emoji: '🌍', color: '#6c63ff' },
  nome:   { label: 'Nome',   emoji: '👤', color: '#ff6b9d' },
  cor:    { label: 'Cor',    emoji: '🎨', color: '#4ade80' },
  animal: { label: 'Animal', emoji: '🐾', color: '#fbbf24' },
  objeto: { label: 'Objeto', emoji: '📦', color: '#60a5fa' },
};

export function CategoryDisplay({ categoryKey, isAnnouncing, isScoring, currentLetter }: CategoryDisplayProps) {
  const info = CATEGORY_INFO[categoryKey];

  // Gerar exemplo uma vez por ronda (memoizado por letra+categoria)
  const example = useMemo(() => {
    const ex = getRandomExample(currentLetter);
    return ex ? ex[categoryKey] : null;
  }, [currentLetter, categoryKey]);

  return (
    <div
      key={categoryKey}
      className={`category-display animate-scale-in ${isAnnouncing ? 'category-announcing' : ''}`}
      style={{ '--cat-color': info.color } as React.CSSProperties}
    >
      <div className="category-display-inner">
        <span className="category-display-emoji">{info.emoji}</span>
        <div className="category-display-text">
          <span className="category-display-label">Categoria</span>
          <span className="category-display-name">{info.label}</span>
        </div>
      </div>

      {/* Durante o jogo: dica */}
      {!isScoring && (
        <div className="category-display-hint">
          Diz uma palavra com a letra acima
        </div>
      )}

      {/* No fim da ronda: exemplo */}
      {isScoring && example && (
        <div className="category-display-example animate-slide-up">
          <span className="category-display-example-label">Podia ser:</span>
          <span className="category-display-example-value">{example}</span>
        </div>
      )}
    </div>
  );
}
