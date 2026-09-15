'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Bus, 
  MapPin, 
  Route as RouteIcon, 
  Building2, 
  Calendar, 
  Phone, 
  Search, 
  Menu, 
  X, 
  DollarSign, 
  Compass, 
  Car,
  ChevronRight
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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 block leading-none">
                BUS TERMINAL <span className="text-emerald-600">BD</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-500 font-medium tracking-wide">
                বাংলাদেশের বাস ও ভ্রমণ তথ্য
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50/80 font-bold'
                      : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/search"
              aria-label="অনুসন্ধান"
              className="p-2 sm:p-2.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all hover:shadow-lg active:scale-95"
            >
              <Calendar className="w-4 h-4 hidden sm:inline" />
              <span>বুকিং করুন</span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="মেনু খুলুন"
              className="xl:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer is rendered below the header so it is not clipped by sticky header stacking */}
    </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden" role="dialog" aria-modal="true">
          <button aria-label="মেনু বন্ধ করুন" onClick={() => setMobileMenuOpen(false)} className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />
          <aside className="absolute right-0 top-0 h-full w-[min(88vw,380px)] bg-white shadow-2xl border-l border-slate-200 flex flex-col overflow-y-auto">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
              <span className="font-black text-slate-900">মেনু</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="মেনু বন্ধ করুন" className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"><X className="w-6 h-6" /></button>
            </div>
            <div className="px-4 pt-4 pb-6 space-y-1">
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md text-sm"
            >
              <span>অনলাইন বুকিং ও অনুরোধ</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
