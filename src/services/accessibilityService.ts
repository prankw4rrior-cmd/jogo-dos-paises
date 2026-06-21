import type { FontSize } from '@/types';

/** Aplica o tamanho de fonte ao documento */
export function applyFontSize(size: FontSize): void {
  document.documentElement.setAttribute('data-font-size', size);
}

/** Aplica o modo de alto contraste ao documento */
export function applyHighContrast(enabled: boolean): void {
  document.documentElement.setAttribute('data-high-contrast', String(enabled));
}

/** Aplica o modo daltónico ao documento */
export function applyColorBlindMode(enabled: boolean): void {
  document.documentElement.setAttribute('data-colorblind', String(enabled));
}
