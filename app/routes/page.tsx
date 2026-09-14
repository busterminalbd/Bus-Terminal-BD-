'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Route as RouteIcon, MapPin, Search, ArrowRight, Clock } from 'lucide-react';
import { supabase, Route, District, safeQuery, logSupabaseError } from '@/lib/supabase';
import RouteCard from '@/components/RouteCard';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

function RoutesContent() {
  const searchParams = useSearchParams();
  const initialFrom = searchParams.get('from') || '';
  const initialTo = searchParams.get('to') || '';

  const [routes, setRoutes] = useState<Route[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [fromFilter, setFromFilter] = useState(initialFrom);
  const [toFilter, setToFilter] = useState(initialTo);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        // Fetch districts
        const { data: distData } = await safeQuery<District[]>((col) => {
          let q = supabase.from('districts').select('*');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });

        if (!ignore && distData) setDistricts(distData);

        // Fetch routes
        const { data: routeData, error: rError } = await safeQuery<Route[]>((col) => {
          let q = supabase
            .from('routes')
            .select(`
              id,
              from_district_id,
              to_district_id,
              distance_km,
              estimated_duration,
              description,
              from_district:districts!routes_from_district_id_fkey(id, name),
              to_district:districts!routes_to_district_id_fkey(id, name)
            `);
          if (col) q = q.eq(col, true);
          if (fromFilter) {
            q = q.eq('from_district_id', fromFilter);
          }
          if (toFilter) {
            q = q.eq('to_district_id', toFilter);
          }
          return q;
        });

        if (ignore) return;
        if (rError) throw rError;

        setRoutes((routeData as unknown as Route[]) || []);
      } catch (err) {
        logSupabaseError('Routes load error:', err);
        if (!ignore) setError('রুটের তথ্য লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [fromFilter, toFilter, retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <RouteIcon className="w-4 h-4" />
          <span>যোগাযোগ নেটওয়ার্ক</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          বাস রুট ও যাতায়াত তথ্য
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          বাংলাদেশের বিভিন্ন জেলার মধ্যে চলাচলকারী সকল অনুমোদিত রুটের দূরত্ব, সময়সূচি ও ভাড়ার বিবরণ।
        </p>

        {/* Filter Selection */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              যাত্রার জেলা (From)
            </label>
            <select
              value={fromFilter}
              onChange={(e) => setFromFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">সকল জেলা থেকে</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.division ? `(${d.division})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              গন্তব্য জেলা (To)
            </label>
            <select
              value={toFilter}
              onChange={(e) => setToFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">সকল গন্তব্যে</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.division ? `(${d.division})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(fromFilter || toFilter) && (
              <button
                type="button"
                onClick={() => {
                  setFromFilter('');
                  setToFilter('');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <EmptyState
          title="কোনো রুট পাওয়া যায়নি"
          description="নির্বাচিত জেলাসমূহের মধ্যে বর্তমানে কোনো সক্রিয় রুট ডাটাবেসে তালিকাভুক্ত নেই।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoutesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    }>
      <RoutesContent />
    </Suspense>
  );
}
