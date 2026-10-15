import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import {
  Activity,
  Award,
  CalendarRange,
  ChartNoAxesColumnIncreasing,
  Dumbbell,
  LayoutDashboard,
  Menu,
  Settings,
  X,
} from 'lucide-react';
import { Logo } from '@/components/logo/Logo';
import { cn } from '@/lib/cn';
import { EASE, motionEnabled } from '@/lib/motion';
import { useApp } from '@/store/AppStore';

const NAV = [
  { to: '/app', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/app/exercises', label: 'Exercises', icon: Activity },
  { to: '/app/planner', label: 'Planner', icon: CalendarRange },
  { to: '/app/progress', label: 'Progress', icon: ChartNoAxesColumnIncreasing },
  { to: '/app/achievements', label: 'Achievements', icon: Award },
  { to: '/app/settings', label: 'Settings', icon: Settings },
];

function NavItems({ onNavigate, dataMenu }: { onNavigate?: () => void; dataMenu?: boolean }) {
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map(({ to, end, label, icon: Icon }) => (
        <li key={to} {...(dataMenu ? { 'data-menu-item': true } : {})}>
          <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'focus-ring relative flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition-colors duration-150',
                isActive ? 'bg-lime/5 text-lime' : 'text-muted hover:bg-surface2 hover:text-fg',
              )
            }
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

function SessionChip() {
  const { data } = useApp();
  if (!data.activeSession) return null;
  return (
    <Link
      to="/app/active"
      aria-label="Workout in progress — resume session"
      className="focus-ring panel-2 flex min-h-11 min-w-0 max-w-[55vw] items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-lime transition-colors hover:border-lime sm:max-w-none"
    >
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-lime" />
      </span>
      <span className="truncate whitespace-nowrap sm:hidden">Active</span>
      <span className="hidden whitespace-nowrap sm:inline">Workout in progress</span>
    </Link>
  );
}

/**
 * Application shell: fixed sidebar on desktop, slide-in menu on mobile,
 * with an Anime.js indicator that tracks the active route.
 */
export function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const mobileNavRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLElement | null>(null);

  /* Slide the active indicator to the current route. */
  useEffect(() => {
    setMenuOpen(false);
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) return;
    const y =
      active.getBoundingClientRect().top -
      nav.getBoundingClientRect().top +
      active.offsetHeight / 2 -
      12;
    if (!motionEnabled()) {
      indicator.style.opacity = '1';
      indicator.style.transform = `translateY(${y}px)`;
      return;
    }
    const anim = animate(indicator, { translateY: y, opacity: 1, duration: 360, ease: EASE.out });
    return () => {
      anim.revert();
    };
  }, [location.pathname]);

  /* Coordinated page entrance: CSS pre-hides [data-page-enter] so freshly
     routed content never flashes; the fade plays on every route change. */
  useEffect(() => {
    const el = mainRef.current;
    if (!el || !motionEnabled()) return;
    const anim = animate(el, {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 440,
      ease: EASE.out,
      onComplete: () => el.style.removeProperty('transform'),
    });
    return () => {
      anim.revert();
    };
  }, [location.pathname]);

  /* Mobile menu entrance + escape handling + scroll lock. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const anims: { revert(): void }[] = [];
    if (motionEnabled()) {
      const backdrop = backdropRef.current;
      const panel = mobileNavRef.current;
      if (backdrop) anims.push(animate(backdrop, { opacity: [0, 1], duration: 260, ease: EASE.out }));
      if (panel) {
        anims.push(
          animate(panel, {
            translateX: ['-100%', '0%'],
            opacity: [0, 1],
            duration: 380,
            ease: EASE.out,
          }),
        );
      }
      const items = panel?.querySelectorAll('[data-menu-item]');
      if (items && items.length > 0) {
        anims.push(
          animate(items, {
            opacity: [0, 1],
            translateX: [-16, 0],
            duration: 340,
            delay: stagger(45),
            ease: EASE.out,
          }),
        );
      }
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      anims.forEach((a) => a.revert());
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:bg-lime focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-ink lg:flex">
        <div className="flex h-16 items-center border-b border-line px-4">
          <Link to="/" aria-label="BUHAT home" className="focus-ring">
            <Logo />
          </Link>
        </div>
        <nav ref={navRef} aria-label="Application" className="relative flex-1 overflow-y-auto py-4">
          <div
            ref={indicatorRef}
            aria-hidden="true"
            className="absolute left-0 top-0 h-6 w-[3px] bg-lime opacity-0"
          />
          <NavItems />
        </nav>
        <div className="border-t border-line p-4">
          <p className="eyebrow text-[0.6rem] text-faint">Train hard. Move forward.</p>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-bg/95 px-4 backdrop-blur-md lg:hidden">
        <Link to="/" aria-label="BUHAT home" className="focus-ring">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <SessionChip />
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="app-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="focus-ring flex min-h-11 min-w-11 items-center justify-center text-fg"
          >
            {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            ref={backdropRef}
            data-drawer-backdrop
            className="absolute inset-0 bg-ink/80"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            id="app-menu"
            ref={mobileNavRef}
            data-drawer-panel
            role="dialog"
            aria-modal="true"
            aria-label="Application menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-line bg-ink"
          >
            <div className="flex h-16 items-center justify-between border-b border-line px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="focus-ring flex min-h-11 min-w-11 items-center justify-center text-fg"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Application" className="flex-1 overflow-y-auto p-3">
              <NavItems onNavigate={() => setMenuOpen(false)} dataMenu />
            </nav>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="lg:pl-60">
        <div className="hidden h-16 items-center justify-end border-b border-line px-8 lg:flex">
          <SessionChip />
        </div>
        <main id="main" ref={mainRef} data-page-enter className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
