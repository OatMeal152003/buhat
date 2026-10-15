import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { animate, stagger } from 'animejs';
import { Logo } from '@/components/logo/Logo';
import { ButtonLink, buttonClasses } from '@/components/ui/Button';
import { EASE, motionEnabled } from '@/lib/motion';
import { cn } from '@/lib/cn';

const SECTIONS = [
  { href: '/#features', label: 'Features' },
  { href: '/#workouts', label: 'Workouts' },
  { href: '/#how', label: 'How It Works' },
  { href: '/#progress', label: 'Progress' },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close the mobile menu whenever navigation happens. */
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const menuRef = useRef<HTMLDivElement | null>(null);

  /* Menu entrance: panel settles, then items stagger in. A real ref + effect so
     unrelated re-renders (scroll state) can never replay the animation. */
  useEffect(() => {
    if (!open) return;
    const node = menuRef.current;
    if (!node || !motionEnabled()) return;
    const panelAnim = animate(node, {
      opacity: [0, 1],
      translateY: [-8, 0],
      duration: 280,
      ease: EASE.out,
    });
    const itemsAnim = animate(node.querySelectorAll('[data-menu-item]'), {
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 380,
      delay: stagger(55),
      ease: EASE.out,
    });
    return () => {
      panelAnim.revert();
      itemsAnim.revert();
    };
  }, [open]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-colors duration-200',
        scrolled || open ? 'border-line bg-bg/95 backdrop-blur-md' : 'border-transparent bg-transparent',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-lime focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink"
      >
        Skip to content
      </a>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" aria-label="BUHAT home" className="focus-ring">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {SECTIONS.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                className="nav-link focus-ring text-xs font-semibold uppercase tracking-[0.16em] text-muted transition-colors hover:text-fg"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <ButtonLink to="/app/workouts" size="sm">
            Start Training
          </ButtonLink>
        </div>

        <button
          type="button"
          className={cn('focus-ring p-2 text-fg lg:hidden', buttonClasses('ghost', 'sm', 'p-2'))}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </nav>

      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          data-menu-panel
          className="border-t border-line bg-bg px-4 pb-6 pt-2 lg:hidden"
        >
          <ul className="flex flex-col">
            {SECTIONS.map((s) => (
              <li key={s.href} data-menu-item className="border-b border-line/60">
                <a
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="focus-ring block py-4 text-sm font-semibold uppercase tracking-[0.16em] text-fg"
                >
                  {s.label}
                </a>
              </li>
            ))}
            <li data-menu-item className="pt-5">
              <ButtonLink to="/app/workouts" className="w-full">
                Start Training
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
