import type { ReactNode, HTMLAttributes } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glass?: boolean;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  glass = false,
  glow = false,
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`card card-p-${padding} ${glass ? 'card-glass' : ''} ${glow ? 'card-glow' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
