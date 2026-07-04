import { useState, useEffect, useRef } from 'react';
import { getAchievementDef } from '@/data/achievements';
import './AchievementToast.css';

interface AchievementToastProps {
  achievementIds: string[];
  onDone: () => void;
}

/** Mostra conquistas desbloqueadas, uma de cada vez */
export function AchievementToast({ achievementIds, onDone }: AchievementToastProps) {
  const [index, setIndex] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (achievementIds.length === 0) { onDoneRef.current(); return; }
    const t = setTimeout(() => {
      if (index < achievementIds.length - 1) {
        setIndex(i => i + 1);
      } else {
        onDoneRef.current();
      }
    }, 2800);
    return () => clearTimeout(t);
  }, [index, achievementIds]);

  if (achievementIds.length === 0) return null;
  const def = getAchievementDef(achievementIds[index]);
  if (!def) return null;

  return (
    <div key={achievementIds[index]} className="achievement-toast animate-slide-up">
      <div className="achievement-toast-emoji">{def.emoji}</div>
      <div className="achievement-toast-text">
        <span className="achievement-toast-label">Conquista desbloqueada!</span>
        <span className="achievement-toast-title">{def.title}</span>
        <span className="achievement-toast-desc">{def.description}</span>
      </div>
    </div>
  );
}
