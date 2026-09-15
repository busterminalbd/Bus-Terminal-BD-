'use client';

import React, { useState, useEffect } from 'react';
import { Bus as BusIcon, Search, Filter, Sparkles } from 'lucide-react';
import { supabase, Bus, BusOperator, safeQuery, isSupabaseConfigured, logSupabaseError } from '@/lib/supabase';
import BusCard from '@/components/BusCard';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [operators, setOperators] = useState<BusOperator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOperatorId, setSelectedOperatorId] = useState('');
  const [acFilter, setAcFilter] = useState<'all' | 'ac' | 'non-ac'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadBuses() {
      try {
        if (!isSupabaseConfigured) {
          console.error(
            'Buses load error: Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
          );
        }

        // Fetch active operators for filter dropdown (also used below to
        // attach operator info to buses if the joined query needs a fallback)
        const { data: opData, error: opError } = await safeQuery<BusOperator[]>((col) => {
          let q = supabase.from('bus_operators').select('id, name, slug, logo_url');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });

        if (opError) logSupabaseError('Operators load error:', opError);
        if (!ignore && opData) setOperators(opData);

        // Fetch active buses with operators joined
        let { data: busData, error: sbError } = await safeQuery<Bus[]>((col) => {
          let q = supabase.from('buses').select(`
            *,
            bus_operators(id, name, slug, logo_url)
          `);
          if (col) q = q.eq(col, true);
          return q.order('name');
        });

        // If the joined query fails (e.g. the bus_operators relationship
        // isn't recognized by PostgREST's schema cache), fall back to a
        // plain query on the buses table and attach operator info on the
        // client so real data still loads instead of showing an error.
        if (sbError) {
          logSupabaseError('Buses load error (joined query failed, retrying without join):', sbError);

          const fallback = await safeQuery<Bus[]>((col) => {
            let q = supabase.from('buses').select('*');
            if (col) q = q.eq(col, true);
            return q.order('name');
          });

          busData = fallback.data;
          sbError = fallback.error;

          if (!sbError && busData && opData) {
            const opMap = new Map(opData.map((o) => [o.id, o]));
            busData = busData.map((b: Bus) => ({
              ...b,
              bus_operators: opMap.get(b.operator_id) || null,
            })) as unknown as Bus[];
          }
        }

        if (ignore) return;
        if (sbError) throw sbError;
        setBuses((busData as unknown as Bus[]) || []);
      } catch (err) {
        logSupabaseError('Buses load error:', err);
        if (!ignore) setError('বাসের তালিকা লোড করতে সমস্যা হয়েছে।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadBuses();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  // Filter logic
  const filteredBuses = buses.filter((b) => {
    if (b.is_active === false || b.active === false) return false;
    // text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchOp = b.bus_operators?.name.toLowerCase().includes(q);
      const matchType = b.bus_type?.toLowerCase().includes(q);
      if (!matchName && !matchOp && !matchType) return false;
    }

    // operator filter
    if (selectedOperatorId && b.operator_id !== selectedOperatorId) {
      return false;
    }

    // AC filter
    if (acFilter === 'ac' && !b.is_ac) return false;
    if (acFilter === 'non-ac' && b.is_ac) return false;

    // category filter
    if (categoryFilter && b.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  // Extract distinct categories
  const categories = Array.from(new Set(buses.map((b) => b.category).filter(Boolean))) as string[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <BusIcon className="w-4 h-4" />
          <span>পরিবহন ফ্লিট</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          বাস তালিকা ও ক্যাটাগরি
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          বাংলাদেশের বিভিন্ন রুটে চলাচলকারী সকল নির্ভরযোগ্য এসি, নন-এসি, স্লিপার ও বিজনেস ক্লাস বাসের তথ্য।
        </p>

        {/* Filters Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Search text */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="বাসের নাম বা টাইপ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Operator filter */}
          <div>
            <select
              value={selectedOperatorId}
              onChange={(e) => setSelectedOperatorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            >
              <option value="">সকল অপারেটর</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          {/* AC / Non-AC filter */}
          <div>
            <select
              value={acFilter}
              onChange={(e) => setAcFilter(e.target.value as 'all' | 'ac' | 'non-ac')}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            >
              <option value="all">এসি ও নন-এসি উভয়</option>
              <option value="ac">শুধুমাত্র এসি (AC)</option>
              <option value="non-ac">শুধুমাত্র নন-এসি (Non-AC)</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            >
              <option value="">সকল ক্যাটাগরি</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredBuses.length === 0 ? (
        <EmptyState
          title="কোনো বাস পাওয়া যায়নি"
          description="আপনার দেওয়া ফিল্টারের সাথে মিলে এমন কোনো সক্রিয় বাস খুঁজে পাওয়া যায়নি।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      )}
    </div>
  );
}
