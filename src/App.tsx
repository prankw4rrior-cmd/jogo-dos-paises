import { useState, useCallback } from 'react';
import { useGame } from '@/context/GameContext';
import { SetupScreen } from '@/components/setup/SetupScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { ResultsScreen } from '@/components/results/ResultsScreen';
import { StatsScreen } from '@/components/stats/StatsScreen';
import { AboutScreen } from '@/components/about/AboutScreen';
import { OnlineLobby } from '@/components/online/OnlineLobby';
import { InstallBanner } from '@/components/ui/InstallBanner';
import { UpdatePrompt } from '@/components/ui/UpdatePrompt';
import { SplashScreen } from '@/components/ui/SplashScreen';
import { PageTransition } from '@/components/ui/PageTransition';

export function App() {
  const { state } = useGame();
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <UpdatePrompt />
      <InstallBanner />
      <PageTransition transitionKey={state.screen}>
        {state.screen === 'setup'   && <SetupScreen />}
        {state.screen === 'game'    && <GameScreen />}
        {state.screen === 'results' && <ResultsScreen />}
        {state.screen === 'stats'   && <StatsScreen />}
        {state.screen === 'about'   && <AboutScreen />}
        {state.screen === 'online'  && <OnlineLobby />}
      </PageTransition>
    </>
  );
}
