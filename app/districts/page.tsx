'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Search, ChevronRight, Bus } from 'lucide-react';
import { supabase, District, safeQuery, logSupabaseError } from '@/lib/supabase';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadDistricts() {
      try {
        const { data, error: dError } = await safeQuery<District[]>((col) => {
          let q = supabase.from('districts').select('*');
          if (col) q = q.eq(col, true);
          return q.order('division').order('name');
        });

        if (ignore) return;
        if (dError) throw dError;
        setDistricts(data || []);
      } catch (err) {
        logSupabaseError('Districts load error:', err);
        if (!ignore) setError('জেলাসমূহের তথ্য লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDistricts();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  // Filter
  const filtered = districts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.division && d.division.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group by division
  const groupedByDivision: Record<string, District[]> = {};
  filtered.forEach((d) => {
    const div = d.division || 'অন্যান্য';
    if (!groupedByDivision[div]) {
      groupedByDivision[div] = [];
    }
    groupedByDivision[div].push(d);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <MapPin className="w-4 h-4" />
          <span>ভৌগোলিক পরিধি</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          বাংলাদেশের জেলাসমূহ
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          বিভাগ ভিত্তিক জেলাসমূহ অন্বেষণ করুন এবং প্রতিটি জেলার বাস রুট, কাউন্টার ও পরিবহন সেবা সম্পর্কে জানুন।
        </p>

        {/* Search */}
        <div className="mt-6 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="জেলার নাম বা বিভাগ দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো জেলা পাওয়া যায়নি"
          description={searchQuery ? `"${searchQuery}" এর সাথে কোনো জেলা মেলেনি।` : 'বর্তমানে কোনো সক্রিয় জেলা ডাটাবেসে নেই।'}
        />
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedByDivision).map(([division, distList]) => (
            <div key={division} className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">
                  {division} বিভাগ
                </h2>
                <span className="text-xs text-slate-400 font-semibold">({distList.length} টি জেলা)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {distList.map((d) => (
                  <Link
                    key={d.id}
                    href={`/districts/${d.slug || d.id}`}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs transition group flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors block truncate">
                        {d.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        বাস ও কাউন্টার
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
