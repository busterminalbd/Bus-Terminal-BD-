'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ChevronRight,
  ChevronDown,
  Home,
  Info,
} from 'lucide-react';

// Primary items: the handful of things people look for most often.
const primaryNavItems = [
  { name: 'হোম', href: '/', icon: Home },
  { name: 'বাস ও রুট', href: '/buses', icon: Bus },
  { name: 'কাউন্টার', href: '/counters', icon: MapPin },
  { name: 'ট্যুর ও মিনি কোচ', href: '/tours', icon: Compass },
];

// Everything else lives one tap away under "আরও", instead of crowding the bar.
const moreNavItems = [
  { name: 'অপারেটর', href: '/operators', icon: Building2 },
  { name: 'রুট', href: '/routes', icon: RouteIcon },
  { name: 'ভাড়া তালিকা', href: '/fares', icon: DollarSign },
  { name: 'জেলা', href: '/districts', icon: MapPin },
  { name: 'মিনি কোচ', href: '/mini-coaches', icon: Car },
  { name: 'আমাদের সম্পর্কে', href: '/about', icon: Info },
  { name: 'যোগাযোগ', href: '/contact', icon: Phone },
];

const allNavItemsForMobile = [...primaryNavItems, ...moreNavItems];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const pathname = usePathname();
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isItemActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <header className="btbd-navbar sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/20 group-hover:scale-105 transition-transform duration-200">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-base sm:text-2xl font-black tracking-tight text-slate-900 block leading-none">
                BUS TERMINAL <span className="text-red-600">BD</span>
              </span>
              <span className="text-[9px] sm:text-xs text-slate-500 font-medium tracking-wide">
                বাংলাদেশের বাস ও ভ্রমণ তথ্য
              </span>
            </div>
          </Link>

          {/* Desktop Navigation — kept short on purpose; everything else is under "আরও" */}
          <nav className="btbd-desktop-nav hidden lg:flex items-center space-x-1">
            {primaryNavItems.map((item) => {
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-red-700 bg-red-50 font-bold'
                      : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}

            {/* "More" dropdown groups the less-frequently used links */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((v) => !v)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-1 ${
                  moreMenuOpen || moreNavItems.some((i) => isItemActive(i.href))
                    ? 'text-red-700 bg-red-50 font-bold'
                    : 'text-slate-600 hover:text-red-600 hover:bg-slate-50'
                }`}
              >
                <span>আরও</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="btbd-more-menu absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-black/10 py-2 z-50">
                  {moreNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isItemActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors ${
                          isActive ? 'text-red-700 bg-red-50' : 'text-slate-600 hover:bg-slate-50 hover:text-red-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/search"
              aria-label="অনুসন্ধান"
              className="p-1.5 sm:p-2.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-slate-100 transition-colors"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              href="/booking"
              className="hidden sm:inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/25 transition-all hover:shadow-lg active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>বুকিং করুন</span>
            </Link>

            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="মেনু খুলুন"
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu — slides in from the right, red header like the app's brand */}
      <div
        className={`btbd-mobile-menu fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="মেনু বন্ধ করুন"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-slate-900/50"
        />

        {/* Drawer panel */}
        <div
          className={`btbd-mobile-drawer absolute right-0 top-2 bottom-2 h-auto w-[86%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Red header */}
          <div className="btbd-mobile-head bg-red-600 px-5 py-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center text-white">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-white font-black tracking-tight text-lg">
                BUS TERMINAL BD
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="বন্ধ করুন"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu items */}
          <nav className="btbd-mobile-nav flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {allNavItemsForMobile.map((item) => {
              const Icon = item.icon;
              const isActive = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer CTA */}
          <div className="btbd-mobile-cta p-4 border-t border-slate-100 shrink-0">
            <Link
              href="/booking"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-md text-sm transition-colors"
            >
              <span>অনলাইন বুকিং ও অনুরোধ</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
