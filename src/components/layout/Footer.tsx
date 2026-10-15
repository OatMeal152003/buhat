import { Link } from 'react-router-dom';
import { Logo } from '@/components/logo/Logo';

const APP_LINKS = [
  { to: '/app', label: 'Dashboard' },
  { to: '/app/workouts', label: 'Workouts' },
  { to: '/app/exercises', label: 'Exercises' },
  { to: '/app/planner', label: 'Planner' },
  { to: '/app/progress', label: 'Progress' },
  { to: '/app/settings', label: 'Settings' },
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8">
        <div>
          <Link to="/" aria-label="BUHAT home" className="focus-ring inline-block">
            <Logo />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            BUHAT is a training platform for people who show up. Plan it, log it, and move
            forward.
          </p>
          <p className="eyebrow mt-5 text-[0.65rem] text-lime">Train hard. Move forward.</p>
        </div>

        <nav aria-label="Site">
          <h2 className="eyebrow text-[0.65rem] text-faint">Explore</h2>
          <ul className="mt-4 space-y-2.5">
            <li>
              <a href="/#features" className="focus-ring text-sm text-muted transition-colors hover:text-fg">
                Features
              </a>
            </li>
            <li>
              <a href="/#workouts" className="focus-ring text-sm text-muted transition-colors hover:text-fg">
                Workouts
              </a>
            </li>
            <li>
              <a href="/#how" className="focus-ring text-sm text-muted transition-colors hover:text-fg">
                How It Works
              </a>
            </li>
          </ul>
        </nav>

        <nav aria-label="Application">
          <h2 className="eyebrow text-[0.65rem] text-faint">Application</h2>
          <ul className="mt-4 space-y-2.5">
            {APP_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="focus-ring text-sm text-muted transition-colors hover:text-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-faint md:px-8">
          <p>© {year} BUHAT. All rights reserved.</p>
          <p>Workout data stays on this device.</p>
        </div>
      </div>
    </footer>
  );
}
