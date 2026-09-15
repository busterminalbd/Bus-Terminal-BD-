'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Bus as BusType } from '@/lib/supabase';



export default function BusImageCarousel({ buses }: { buses: BusType[] }) {
  const slides = useMemo(() => {
    const db = buses
      .filter((b) => b.image_url)
      .map((b) => ({ image: b.image_url as string, title: b.name }));
    return db.slice(0, 8);
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
    <section className="w-full m-0 p-0" aria-label="বাসের ছবি">
      <div
        className="relative w-full overflow-hidden bg-slate-950 shadow-md touch-pan-y"
        onTouchStart={(e) => setTouchStart(e.changedTouches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart === null) return;
          const delta = e.changedTouches[0].clientX - touchStart;
          if (Math.abs(delta) > 45) (delta < 0 ? next : prev)();
          setTouchStart(null);
        }}
      >
        <div className="relative h-[210px] sm:h-[330px] lg:h-[460px]">
          {slides.length === 0 ? (
            <div
              className="absolute inset-0 animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"
              aria-label="বাসের ছবি লোড হচ্ছে"
            />
          ) : (
            slides.map((slide, i) => (
            <div key={`${slide.image}-${i}`} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <Image src={slide.image} alt={slide.title} fill priority={i === 0} className="object-cover" sizes="100vw" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            </div>
            ))
          )}

          {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} type="button" onClick={() => setIndex(i)} aria-label={`ছবি ${i + 1}`} className={`h-2 rounded-full transition-all ${i === index ? 'w-7 bg-white' : 'w-2 bg-white/60'}`} />
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
