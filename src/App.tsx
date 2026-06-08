import { useGame } from '@/context/GameContext';
import { SetupScreen } from '@/components/setup/SetupScreen';
import { GameScreen } from '@/components/game/GameScreen';
import { ResultsScreen } from '@/components/results/ResultsScreen';
import { StatsScreen } from '@/components/stats/StatsScreen';
import { InstallBanner } from '@/components/ui/InstallBanner';

export function App() {
  const { state } = useGame();

  return (
    <>
      <InstallBanner />
      {state.screen === 'setup'   && <SetupScreen />}
      {state.screen === 'game'    && <GameScreen />}
      {state.screen === 'results' && <ResultsScreen />}
      {state.screen === 'stats'   && <StatsScreen />}
    </>
  );
}
