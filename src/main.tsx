import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GameProvider } from '@/context/GameContext';
import { App } from './App';
import './index.css';

// Registar Service Worker via vite-plugin-pwa
// (feito automaticamente pelo plugin com registerType: 'autoUpdate')

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado');

createRoot(root).render(
  <StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </StrictMode>
);
