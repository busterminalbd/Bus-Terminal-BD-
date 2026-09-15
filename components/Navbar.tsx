'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bus, MapPin, Route as RouteIcon, Building2, Calendar, Phone, Search, Menu, X,
  DollarSign, Compass, Car, ChevronDown, ChevronRight
} from 'lucide-react';

const navItems = [
  { name: 'হোম', href: '/', icon: Bus },
  { name: 'বাস', href: '/buses', icon: Bus },
  { name: 'অপারেটর', href: '/operators', icon: Building2 },
  { name: 'রুট', href: '/routes', icon: RouteIcon },
  { name: 'কাউন্টার', href: '/counters', icon: MapPin },
  { name: 'ভাড়া', href: '/fares', icon: DollarSign },
  { name: 'জেলা', href: '/districts', icon: MapPin },
  { name: 'মিনি কোচ', href: '/mini-coaches', icon: Car },
  { name: 'ট্যুর প্যাকেজ', href: '/tours', icon: Compass },
  { name: 'যোগাযোগ', href: '/contact', icon: Phone },
];

const desktopPrimary = navItems.slice(0, 5);
const desktopMore = navItems.slice(5);

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-3 sm:h-20">

            <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="BUS TERMINAL BD - হোম">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 sm:h-11 sm:w-11">
                <Bus className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-base font-black leading-none tracking-tight text-slate-900 sm:text-xl">
                  BUS TERMINAL <span className="text-emerald-600">BD</span>
                </span>
                <span className="mt-1 hidden text-[11px] font-medium tracking-wide text-slate-500 sm:block">
                  বাংলাদেশের বাস ও ভ্রমণ তথ্য
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="প্রধান মেনু">
              {desktopPrimary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMoreOpen((open) => !open)}
                  aria-expanded={moreOpen}
                  className={`flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    desktopMore.some((item) => isActive(item.href))
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                >
                  আরও
                  <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>

                {moreOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10">
                    {desktopMore.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMoreOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                            isActive(item.href)
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <Link
                href="/search"
                aria-label="অনুসন্ধান"
                className="rounded-xl p-2.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-600"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                href="/booking"
                className="hidden items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 sm:inline-flex"
              >
                <Calendar className="h-4 w-4" />
                বুকিং করুন
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="মোবাইল মেনু খুলুন"
                aria-expanded={mobileMenuOpen}
                className="rounded-xl p-2.5 text-slate-700 transition hover:bg-slate-100 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="মোবাইল নেভিগেশন"
        >
          <button
            type="button"
            aria-label="মেনু বন্ধ করুন"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"
          />

          <aside className="absolute right-0 top-0 flex h-[100dvh] w-[88%] max-w-sm flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between bg-emerald-600 px-5 py-5 text-white shadow-md sm:px-6">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                  <Bus className="h-6 w-6" />
                </span>
                <span className="text-lg font-black tracking-tight">BUS TERMINAL BD</span>
              </Link>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="মেনু বন্ধ করুন"
                className="rounded-full bg-white/15 p-2.5 transition hover:bg-white/25"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5" aria-label="মোবাইল মেনু">
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span className="flex-1">{item.name}</span>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="shrink-0 border-t border-slate-100 bg-white p-4 sm:p-5">
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <Calendar className="h-4 w-4" />
                অনলাইন বুকিং ও অনুরোধ
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
