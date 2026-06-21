import { useEffect, useState, type ReactNode } from 'react';
import './PageTransition.css';

interface PageTransitionProps {
  children: ReactNode;
  transitionKey: string;
}

export function PageTransition({ children, transitionKey }: PageTransitionProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Pequeno delay para garantir que o CSS de entrada corre
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, [transitionKey]);

  return (
    <div className={`page-transition ${visible ? 'page-visible' : 'page-hidden'}`}>
      {children}
    </div>
  );
}
