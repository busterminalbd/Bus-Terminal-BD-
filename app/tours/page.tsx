'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, Search, MapPin, Clock, Users } from 'lucide-react';
import { supabase, TourPackage, safeQuery } from '@/lib/supabase';
import TourCard from '@/components/TourCard';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

export default function ToursPage() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadTours() {
      try {
        const { data, error: sbError } = await safeQuery<TourPackage[]>((col) => {
          let q = supabase.from('tour_packages').select('*');
          if (col) q = q.eq(col, true);
          return q.order('price');
        });

        if (ignore) return;
        if (sbError) throw sbError;
        setTours(data || []);
      } catch (err) {
        console.error('Tours load error:', err);
        if (!ignore) setError('ট্যুর প্যাকেজ লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadTours();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  const filtered = tours.filter((t) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDest = t.destination?.toLowerCase().includes(q);
      if (!matchTitle && !matchDest) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Compass className="w-4 h-4" />
          <span>ভ্রমণ ও পর্যটন</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          ট্যুর প্যাকেজসমূহ
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          কক্সবাজার, সাজেক, সুন্দরবন, শ্রীমঙ্গল সহ দেশের জনপ্রিয় পর্যটন স্থানগুলোতে সাশ্রয়ী ও আরামদায়ক বাস ট্যুর প্যাকেজ।
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="গন্তব্য বা প্যাকেজের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো ট্যুর প্যাকেজ পাওয়া যায়নি"
          description="বর্তমানে কোনো সক্রিয় ট্যুর প্যাকেজ উপলব্ধ নেই।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
}
