import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Dashboard } from '@/pages/Dashboard';
import { WorkoutLibrary } from '@/pages/WorkoutLibrary';
import { WorkoutDetail } from '@/pages/WorkoutDetail';
import { ExerciseLibrary } from '@/pages/ExerciseLibrary';
import { ExerciseDetail } from '@/pages/ExerciseDetail';
import { Planner } from '@/pages/Planner';
import { ProgressPage } from '@/pages/Progress';
import { AchievementsPage } from '@/pages/Achievements';
import { SettingsPage } from '@/pages/Settings';
import { ActiveWorkoutPage } from '@/pages/ActiveWorkoutPage';
import { ToastHost } from '@/components/ui/Toasts';
import { useApp } from '@/store/AppStore';

const TITLES: Record<string, string> = {
  '/': 'BUHAT — TRAIN HARD. MOVE FORWARD.',
  '/app': 'Dashboard · BUHAT',
  '/app/workouts': 'Workout Library · BUHAT',
  '/app/exercises': 'Exercise Library · BUHAT',
  '/app/planner': 'Workout Planner · BUHAT',
  '/app/progress': 'Progress · BUHAT',
  '/app/achievements': 'Achievements · BUHAT',
  '/app/settings': 'Settings · BUHAT',
  '/app/active': 'Active Workout · BUHAT',
};

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (TITLES[pathname]) {
      document.title = TITLES[pathname];
    } else if (pathname.startsWith('/app/workouts/')) {
      document.title = 'Workout · BUHAT';
    } else if (pathname.startsWith('/app/exercises/')) {
      document.title = 'Exercise · BUHAT';
    } else {
      document.title = 'BUHAT — TRAIN HARD. MOVE FORWARD.';
    }

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  const { toasts, dismissToast } = useApp();

  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="workouts" element={<WorkoutLibrary />} />
          <Route path="workouts/:id" element={<WorkoutDetail />} />
          <Route path="exercises" element={<ExerciseLibrary />} />
          <Route path="exercises/:id" element={<ExerciseDetail />} />
          <Route path="planner" element={<Planner />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/app/active" element={<ActiveWorkoutPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
