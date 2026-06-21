import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameProvider } from '@/context/GameContext';
import { App } from './App';
import { loadSettings } from '@/services/storageService';
import { applyAccent } from '@/components/setup/ThemeSelector';
import { applyFontSize, applyHighContrast, applyColorBlindMode } from '@/services/accessibilityService';
import './index.css';

// Aplicar definições guardadas
const settings = loadSettings();
applyAccent(settings.accentColor ?? 'purple');
applyFontSize(settings.fontSize ?? 'medium');
applyHighContrast(settings.highContrast ?? false);
applyColorBlindMode(settings.colorBlindMode ?? false);

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');

createRoot(root).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>
);
