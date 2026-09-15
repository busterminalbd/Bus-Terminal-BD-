'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Bus } from 'lucide-react';
import { Bus as BusType } from '@/lib/supabase';

const fallbackImages = [
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557223562-6c77ef16210f?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?q=80&w=1200&auto=format&fit=crop',
];

export default function BusImageCarousel({ buses }: { buses: BusType[] }) {
  const slides = useMemo(() => {
    const db = buses.filter((b) => b.image_url).map((b) => ({ image: b.image_url as string, title: b.name }));
    if (db.length >= 2) return db;
    return fallbackImages.map((image, i) => ({ image, title: buses[i]?.name || `বাংলাদেশের বাস ${i + 1}` }));
  }, [buses]);
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setIndex((v) => (v + 1) % slides.length), 4500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const prev = () => setIndex((v) => (v - 1 + slides.length) % slides.length);
  const next = () => setIndex((v) => (v + 1) % slides.length);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="বাসের ছবি">
      <div
        className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-xl border border-emerald-100 touch-pan-y"
        onTouchStart={(e) => setTouchStart(e.changedTouches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const delta = e.changedTouches[0].clientX - touchStart;
          if (Math.abs(delta) > 45) (delta < 0 ? next : prev)();
          setTouchStart(null);
        }}
      >
        <div className="relative h-56 sm:h-80 lg:h-[420px]">
          {slides.map((slide, i) => (
            <div key={`${slide.image}-${i}`} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <Image src={slide.image} alt={slide.title} fill priority={i === 0} className="object-cover" sizes="100vw" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-600/90 px-3 py-1.5 text-xs font-bold"><Bus className="w-4 h-4" />{slide.title}</div>
              </div>
            </div>
          ))}
          <button type="button" onClick={prev} aria-label="আগের ছবি" className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 text-slate-900 shadow-lg flex items-center justify-center hover:bg-white"><ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>
          <button type="button" onClick={next} aria-label="পরের ছবি" className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 text-slate-900 shadow-lg flex items-center justify-center hover:bg-white"><ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /></button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {slides.map((_, i) => <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`ছবি ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
