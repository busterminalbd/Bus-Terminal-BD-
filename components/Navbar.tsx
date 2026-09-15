'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bus, MapPin, Route as RouteIcon, Building2, Calendar, Phone,
  Search, Menu, X, DollarSign, Compass, Car, ChevronRight
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

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 sm:min-h-20 gap-3">
            {/* Brand — no separate logo icon */}
            <Link href="/" className="min-w-0 flex-1 group">
              <div className="flex items-baseline gap-1.5 whitespace-nowrap">
                <span className="text-[19px] sm:text-2xl lg:text-[27px] font-black tracking-tight text-slate-900 leading-none">
                  BUS TERMINAL
                </span>
                <span className="text-[19px] sm:text-2xl lg:text-[27px] font-black tracking-tight text-emerald-600 leading-none">
                  BD
                </span>
              </div>
              <span className="mt-1 block text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide truncate">
                বাংলাদেশের বাস ও ভ্রমণ তথ্য
              </span>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden xl:flex items-center gap-0.5 shrink-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-2.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <Link href="/search" aria-label="অনুসন্ধান" className="p-2 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100">
                <Search className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link href="/booking" className="inline-flex items-center justify-center px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 whitespace-nowrap">
                <Calendar className="w-4 h-4 hidden sm:inline mr-1.5" />
                <span>বুকিং করুন</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="মেনু খুলুন"
                className="xl:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden" role="dialog" aria-modal="true">
          <button aria-label="মেনু বন্ধ করুন" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/45" />
          <aside className="absolute right-0 top-0 h-full w-[min(88vw,380px)] bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-y-auto">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 shrink-0">
              <span className="text-xl font-black text-slate-900">মেনু</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="মেনু বন্ধ করুন" className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* One vertical list — no two-column menu */}
            <nav className="px-4 py-4 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-base font-bold transition-colors ${
                      isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="px-4 pb-6 mt-auto">
              <Link
                href="/booking"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md"
              >
                <span>অনলাইন বুকিং ও অনুরোধ</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
