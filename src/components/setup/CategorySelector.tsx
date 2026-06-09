import type { CategoryKey, Difficulty } from '@/types';
import './CategorySelector.css';

const ALL_CATEGORIES: { key: CategoryKey; label: string; emoji: string }[] = [
  { key: 'pais',      label: 'País',       emoji: '🌍' },
  { key: 'nome',      label: 'Nome',       emoji: '👤' },
  { key: 'cor',       label: 'Cor',        emoji: '🎨' },
  { key: 'animal',    label: 'Animal',     emoji: '🐾' },
  { key: 'objeto',    label: 'Objeto',     emoji: '📦' },
  { key: 'fruta',     label: 'Fruta',      emoji: '🍎' },
  { key: 'cidade',    label: 'Cidade',     emoji: '🏙️' },
  { key: 'profissao', label: 'Profissão',  emoji: '💼' },
  { key: 'marca',     label: 'Marca',      emoji: '🏷️' },
  { key: 'filme',     label: 'Filme',      emoji: '🎬' },
];

const DIFFICULTY_PRESETS: Record<Difficulty, CategoryKey[]> = {
  facil:   ['pais', 'nome', 'animal'],
  normal:  ['pais', 'nome', 'cor', 'animal', 'objeto'],
  dificil: ['pais', 'nome', 'cor', 'animal', 'objeto', 'fruta', 'cidade', 'profissao', 'marca', 'filme'],
};

interface CategorySelectorProps {
  selected: CategoryKey[];
  difficulty: Difficulty;
  onSelectedChange: (cats: CategoryKey[]) => void;
  onDifficultyChange: (d: Difficulty) => void;
}

export function CategorySelector({ selected, difficulty, onSelectedChange, onDifficultyChange }: CategorySelectorProps) {

  function handleDifficulty(d: Difficulty) {
    onDifficultyChange(d);
    onSelectedChange(DIFFICULTY_PRESETS[d]);
  }

  function toggleCategory(key: CategoryKey) {
    if (selected.includes(key)) {
      if (selected.length <= 1) return; // mínimo 1
      onSelectedChange(selected.filter(k => k !== key));
    } else {
      onSelectedChange([...selected, key]);
    }
    onDifficultyChange('normal'); // custom
  }

  return (
    <div className="cat-selector">
      {/* Dificuldade */}
      <div className="cat-difficulty">
        {(['facil', 'normal', 'dificil'] as Difficulty[]).map(d => (
          <button
            key={d}
            className={`cat-diff-btn ${difficulty === d ? 'active' : ''}`}
            onClick={() => handleDifficulty(d)}
          >
            {d === 'facil' ? '😊 Fácil' : d === 'normal' ? '😐 Normal' : '🔥 Difícil'}
          </button>
        ))}
      </div>

      {/* Categorias */}
      <div className="cat-grid">
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`cat-chip ${selected.includes(cat.key) ? 'active' : ''}`}
            onClick={() => toggleCategory(cat.key)}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
