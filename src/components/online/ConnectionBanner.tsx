import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import './ConnectionBanner.css';

export function ConnectionBanner() {
  const { isOnline, justReconnected } = useOnlineStatus();

  if (isOnline && !justReconnected) return null;

  return (
    <div className={`connection-banner ${isOnline ? 'connection-ok' : 'connection-bad'} animate-slide-up`}>
      {isOnline ? (
        <>✓ Ligação restabelecida</>
      ) : (
        <>
          <span className="connection-pulse" />
          Sem ligação à internet — a tentar reconectar…
        </>
      )}
    </div>
  );
}
