'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Search, Phone, ExternalLink, Building2, Filter } from 'lucide-react';
import { supabase, Counter, District, safeQuery, logSupabaseError } from '@/lib/supabase';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

export default function CountersPage() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadCounters() {
      try {
        // Load districts
        const { data: distData } = await safeQuery<District[]>((col) => {
          let q = supabase.from('districts').select('id, name, division');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });
        if (!ignore && distData) setDistricts(distData as District[]);

        // Load counters
        const { data: cData, error: cError } = await safeQuery<Counter[]>((col) => {
          let q = supabase
            .from('counters')
            .select(`
              *,
              buses(
                id,
                name,
                is_ac,
                bus_operators(id, name)
              ),
              districts(id, name, division)
            `);
          if (col) q = q.eq(col, true);
          return q.order('counter_name');
        });

        if (ignore) return;
        if (cError) throw cError;
        setCounters((cData as unknown as Counter[]) || []);
      } catch (err) {
        logSupabaseError('Counters load error:', err);
        if (!ignore) setError('কাউন্টারের তথ্য লোড করা সম্ভব হয়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCounters();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  const filtered = counters.filter((c) => {
    if (selectedDistrictId && c.district_id !== selectedDistrictId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = c.counter_name.toLowerCase().includes(q);
      const matchBus = c.buses?.name.toLowerCase().includes(q);
      const matchDist = c.districts?.name.toLowerCase().includes(q);
      const matchAddr = c.address?.toLowerCase().includes(q);
      if (!matchName && !matchBus && !matchDist && !matchAddr) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
          <MapPin className="w-4 h-4" />
          <span>টিকিট ও স্টেশন</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          বাস কাউন্টার ও যোগাযোগের ঠিকানা
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          বাংলাদেশের বিভিন্ন জেলার সকল বাস কাউন্টারের অফিসিয়াল ফোন নম্বর, ঠিকানা এবং গুগল ম্যাপ লোকেশন।
        </p>

        {/* Filter Bar */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="কাউন্টার নাম বা এলাকা..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="">সকল জেলা</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.division ? `(${d.division})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              মোট: <strong>{filtered.length}</strong> টি কাউন্টার
            </span>
            {(selectedDistrictId || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrictId('');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-red-700 hover:underline"
              >
                রিসেট
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো কাউন্টার পাওয়া যায়নি"
          description="আপনার সার্চ বা নির্বাচিত জেলার সাথে মিলে এমন কোনো সক্রিয় কাউন্টার পাওয়া যায়নি।"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {c.counter_name}
                    </h3>
                    {c.buses && (
                      <p className="text-xs font-semibold text-red-600 mt-0.5">
                        {c.buses.name} {c.buses.bus_operators?.name ? `(${c.buses.bus_operators.name})` : ''}
                      </p>
                    )}
                  </div>
                  {c.districts && (
                    <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0">
                      {c.districts.name}
                    </span>
                  )}
                </div>

                {c.address && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {c.address}
                  </p>
                )}

                {c.description && (
                  <p className="text-xs text-slate-500 italic">
                    {c.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                {/* Phones */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="flex items-center gap-1 text-red-700 font-bold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{c.phone}</span>
                    </a>
                  )}
                  {c.alternate_phone && (
                    <a
                      href={`tel:${c.alternate_phone}`}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800"
                    >
                      <span>বিকল্প: {c.alternate_phone}</span>
                    </a>
                  )}
                </div>

                {/* Map Link */}
                {c.latitude && c.longitude && (
                  <div className="pt-1">
                    <a
                      href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-sky-600 font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ম্যাপে দেখুন</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
