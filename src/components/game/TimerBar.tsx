import { useTimer } from '@/hooks/useTimer';
import './TimerBar.css';

export function TimerBar() {
  const { timeRemaining, percentage, isDanger, isWarning } = useTimer();

  const colorClass = isDanger ? 'timer-danger' : isWarning ? 'timer-warning' : 'timer-ok';

  return (
    <div className={`timer-wrapper animate-fade-in ${colorClass}`}>
      <div className="timer-track">
        <div
          className="timer-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className={`timer-value ${isDanger ? 'timer-value-danger' : ''}`}>
        {timeRemaining}
        <span className="timer-unit">s</span>
      </div>
    </div>
  );
}
