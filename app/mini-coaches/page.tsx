'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Car, Search, Phone, ShieldCheck, Users } from 'lucide-react';
import { supabase, MiniCoach, safeQuery } from '@/lib/supabase';
import MiniCoachCard from '@/components/MiniCoachCard';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

export default function MiniCoachesPage() {
  const [coaches, setCoaches] = useState<MiniCoach[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [acFilter, setAcFilter] = useState<'all' | 'ac' | 'non-ac'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadCoaches() {
      try {
        const { data, error: sbError } = await safeQuery<MiniCoach[]>((col) => {
          let q = supabase.from('mini_coaches').select('*');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });

        if (ignore) return;
        if (sbError) throw sbError;
        setCoaches(data || []);
      } catch (err) {
        console.error('Mini coaches error:', err);
        if (!ignore) setError('মিনি কোচের তথ্য লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCoaches();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  const filtered = coaches.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchType = c.vehicle_type?.toLowerCase().includes(q);
      if (!matchName && !matchType) return false;
    }
    if (acFilter === 'ac' && !c.is_ac) return false;
    if (acFilter === 'non-ac' && c.is_ac) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Car className="w-4 h-4" />
          <span>রেন্ট-এ-কার ও মিনি কোচ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          মিনি কোচ ও মাইক্রোবাস রেন্টাল
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          পারিবারিক পিকনিক, প্রাতিষ্ঠানিক ভ্রমণ, ইভেন্ট বা গ্রুপ ট্যুরের জন্য সাশ্রয়ী ভাড়ায় আধুনিক এসি/নন-এসি মিনি কোচ ভাড়া নিন।
        </p>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="গাড়ির নাম বা ধরন দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={acFilter}
              onChange={(e) => setAcFilter(e.target.value as 'all' | 'ac' | 'non-ac')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="all">এসি ও নন-এসি উভয়</option>
              <option value="ac">শুধুমাত্র এসি</option>
              <option value="non-ac">শুধুমাত্র নন-এসি</option>
            </select>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/booking?type=mini_coach"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              সরাসরি ভাড়া অনুরোধ
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো মিনি কোচ পাওয়া যায়নি"
          description="বর্তমানে কোনো সক্রিয় মিনি কোচ ডাটাবেসে অন্তর্ভুক্ত নেই।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((coach) => (
            <MiniCoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      )}
    </div>
  );
}
