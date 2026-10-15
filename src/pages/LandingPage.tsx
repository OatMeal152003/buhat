import { useState } from 'react';
import { LandingNav } from '@/components/layout/LandingNav';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Showcase } from '@/components/landing/Showcase';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Motivation } from '@/components/landing/Motivation';
import { FinalCta } from '@/components/landing/FinalCta';
import { Loader, bootingThisSession } from '@/components/landing/Loader';
import { useApp } from '@/store/AppStore';

export function LandingPage() {
  const { data } = useApp();
  /* One boot sequence per session — skipped for reduced-motion users — and the
     hero entrance starts the moment the curtain lifts. */
  const [booting, setBooting] = useState(() => bootingThisSession() && !data.prefs.reducedMotion);

  return (
    <div className="min-h-dvh bg-bg">
      <Loader open={booting} onDone={() => setBooting(false)} />
      <LandingNav />
      <main id="main">
        <Hero start={!booting} />
        <Features />
        <Showcase />
        <HowItWorks />
        <Motivation />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
