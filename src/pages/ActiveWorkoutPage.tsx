import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import type { CompletedSession } from '@/types';
import { useApp } from '@/store/AppStore';
import { ActiveWorkout } from '@/components/session/ActiveWorkout';
import { CompletionScreen } from '@/components/session/CompletionScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { ButtonLink } from '@/components/ui/Button';

/**
 * Full-screen session route, outside the application chrome so nothing
 * competes with the workout. Survives refresh: the session lives in storage.
 */
export function ActiveWorkoutPage() {
  const { data } = useApp();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<CompletedSession | null>(null);

  if (summary) {
    return <CompletionScreen summary={summary} onDone={() => navigate('/app')} />;
  }

  if (!data.activeSession || data.activeSession.exercises.length === 0) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg px-4">
        <div className="w-full max-w-md">
          <EmptyState
            icon={Dumbbell}
            title="No workout in progress"
            body="Pick a session from the workout library or your plan and it will open here with live set tracking."
            action={<ButtonLink to="/app/workouts">Browse workouts</ButtonLink>}
          />
        </div>
      </div>
    );
  }

  return <ActiveWorkout onFinished={setSummary} />;
}
