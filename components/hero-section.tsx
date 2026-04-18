'use client';

import { useUI } from '@/lib/store-context';
import { translations } from '@/lib/translations';

export default function HeroSection() {
  const { language } = useUI();
  const trans = translations[language];

  return (
    <section className="relative bg-background py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-light tracking-widest mb-6 text-foreground">
          {trans.heroTitle}
        </h1>
        <p className="text-lg md:text-xl font-light text-muted-foreground mb-8 max-w-2xl mx-auto">
          {trans.heroSubtitle}
        </p>
        <button className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 text-sm tracking-widest uppercase font-light transition">
          {trans.shopNow}
        </button>
      </div>
    </section>
  );
}
