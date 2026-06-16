import { useMemo } from 'react';
import type { CategoryKey } from '@/types';
import { getRandomExample } from '@/data/examples';
import { useGame } from '@/context/GameContext';
import './CategoryDisplay.css';

interface CategoryDisplayProps {
  categories: CategoryKey[];
  isAnnouncing: boolean;
  isScoring: boolean;
  currentLetter: string;
}

const CATEGORY_INFO: Record<CategoryKey, { label: string; emoji: string; color: string }> = {
  pais:      { label: 'País',      emoji: '🌍', color: '#6c63ff' },
  nome:      { label: 'Nome',      emoji: '👤', color: '#ff6b9d' },
  cor:       { label: 'Cor',       emoji: '🎨', color: '#4ade80' },
  animal:    { label: 'Animal',    emoji: '🐾', color: '#fbbf24' },
  objeto:    { label: 'Objeto',    emoji: '📦', color: '#60a5fa' },
  fruta:     { label: 'Fruta',     emoji: '🍎', color: '#f87171' },
  cidade:    { label: 'Cidade',    emoji: '🏙️', color: '#a78bfa' },
  profissao: { label: 'Profissão', emoji: '💼', color: '#34d399' },
  marca:     { label: 'Marca',     emoji: '🏷️', color: '#fb923c' },
  filme:     { label: 'Filme',     emoji: '🎬', color: '#e879f9' },
};

export function CategoryDisplay({ categories, isAnnouncing, isScoring, currentLetter }: CategoryDisplayProps) {
  const { state } = useGame();

  // Gerar exemplos uma vez por ronda
  const examples = useMemo(() => {
    const ex = getRandomExample(currentLetter);
    if (!ex) return {};
    const result: Partial<Record<CategoryKey, string>> = {};
    for (const cat of categories) result[cat] = ex[cat];
    return result;
  }, [currentLetter, categories]);

  // Uma categoria: mostrar em destaque
  if (categories.length === 1) {
    const cat = categories[0];
    const info = CATEGORY_INFO[cat];
    return (
      <div
        key={cat}
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
        {!isScoring && (
          <div className="category-display-hint">Diz uma palavra com a letra acima</div>
        )}
        {isScoring && state.config.examplesEnabled && examples[cat] && (
          <div className="category-display-example animate-slide-up">
            <span className="category-display-example-label">Podia ser:</span>
            <span className="category-display-example-value">{examples[cat]}</span>
          </div>
        )}
      </div>
    );
  }

  // Múltiplas categorias: mostrar lista
  return (
    <div className={`category-multi ${isAnnouncing ? 'category-announcing' : ''}`}>
      {categories.map((cat, i) => {
        const info = CATEGORY_INFO[cat];
        return (
          <div
            key={cat}
            className="category-multi-item animate-slide-up"
            style={{ '--cat-color': info.color, animationDelay: `${i * 60}ms` } as React.CSSProperties}
          >
            <span className="category-multi-emoji">{info.emoji}</span>
            <span className="category-multi-label">{info.label}</span>
            {isScoring && state.config.examplesEnabled && examples[cat] && (
              <span className="category-multi-example">ex: {examples[cat]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
