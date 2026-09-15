'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bus as BusIcon, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Bus } from '@/lib/supabase';

interface BusImageCarouselProps {
  buses: Bus[];
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1200&auto=format&fit=crop',
];

export default function BusImageCarousel({ buses }: BusImageCarouselProps) {
  const slides = (buses.length ? buses.slice(0, 8) : fallbackImages.map((image, index) => ({
    id: `fallback-${index}`,
    name: 'বাংলাদেশের বাস',
    slug: '',
    image_url: image,
  } as Bus))).map((bus, index) => ({
    ...bus,
    image_url: bus.image_url || fallbackImages[index % fallbackImages.length],
  }));

  const [active, setActive] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    if (active >= slides.length) setActive(0);
  }, [active, slides.length]);

  const previous = () => setActive((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setActive((current) => (current + 1) % slides.length);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
    touchEnd.current = null;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    touchEnd.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = () => {
    if (touchStart.current === null || touchEnd.current === null) return;
    const distance = touchStart.current - touchEnd.current;
    if (Math.abs(distance) > 45) {
      if (distance > 0) next();
      else previous();
    }
    touchStart.current = null;
    touchEnd.current = null;
  };

  const slide = slides[active];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="বাসের ছবি">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
        <div
          className="relative aspect-[16/8] min-h-[230px] w-full overflow-hidden bg-slate-900 sm:aspect-[16/7]"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {slide.image_url ? (
            <Image
              key={`${slide.id}-${active}`}
              src={slide.image_url}
              alt={slide.name}
              fill
              priority={active === 0}
              className="object-cover transition-opacity duration-500"
              sizes="100vw"
              referrerPolicy="no-referrer"
            />
          ) : null}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-7">
            <div className="min-w-0 text-white">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold backdrop-blur-md">
                <BusIcon className="h-3.5 w-3.5" />
                বাস তথ্য
              </div>
              <h2 className="truncate text-xl font-black sm:text-3xl">{slide.name}</h2>
              {slide.bus_type && <p className="mt-1 text-xs text-white/80 sm:text-sm">{slide.bus_type}</p>}
            </div>

            {slide.slug && (
              <Link
                href={`/buses/${slide.slug}`}
                className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-slate-900 shadow-lg sm:inline-flex"
              >
                বিস্তারিত
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={previous}
                aria-label="আগের বাসের ছবি"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 sm:left-5"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="পরের বাসের ছবি"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/55 sm:right-5"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {slides.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 px-4 py-3" role="tablist" aria-label="বাসের ছবি নির্বাচন">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${item.name} দেখুন`}
                aria-selected={index === active}
                role="tab"
                className={`h-1.5 rounded-full transition-all ${index === active ? 'w-7 bg-emerald-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
