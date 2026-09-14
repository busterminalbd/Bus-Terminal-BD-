'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  MapPin, 
  ArrowLeft, 
  Bus as BusIcon, 
  Route as RouteIcon, 
  Building2, 
  Phone, 
  ChevronRight,
  Navigation
} from 'lucide-react';
import { supabase, District, Route, Counter, safeQuery } from '@/lib/supabase';
import RouteCard from '@/components/RouteCard';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

export default function DistrictDetailPage() {
  const params = useParams();
  const slugParam = params?.slug as string;

  const [district, setDistrict] = useState<District | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadDistrictInfo() {
      if (!slugParam) return;
      try {
        setLoading(true);
        setError(null);

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugParam);

        // Fetch District by slug or id with safeQuery
        const { data: dData, error: dError } = await safeQuery<District>((col) => {
          let query = supabase.from('districts').select('*');
          if (col) query = query.eq(col, true);
          if (isUUID) {
            query = query.eq('id', slugParam);
          } else {
            query = query.eq('slug', slugParam);
          }
          return query.single();
        });

        if (ignore) return;
        if (dError) throw dError;
        setDistrict(dData);

        if (dData) {
          // Fetch routes originating or ending in this district
          const { data: rData } = await safeQuery<Route[]>((col) => {
            let q = supabase
              .from('routes')
              .select(`
                *,
                from_district:districts!routes_from_district_id_fkey(id, name),
                to_district:districts!routes_to_district_id_fkey(id, name)
              `)
              .or(`from_district_id.eq.${dData.id},to_district_id.eq.${dData.id}`);
            if (col) q = q.eq(col, true);
            return q;
          });

          if (!ignore && rData) setRoutes(rData as unknown as Route[]);

          // Fetch counters in this district
          const { data: cData } = await safeQuery<Counter[]>((col) => {
            let q = supabase
              .from('counters')
              .select(`
                *,
                buses(id, name, is_ac)
              `)
              .eq('district_id', dData.id);
            if (col) q = q.eq(col, true);
            return q;
          });

          if (!ignore && cData) setCounters(cData as unknown as Counter[]);
        }

      } catch (err) {
        console.error('District detail error:', err);
        if (!ignore) setError('জেলার তথ্য লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDistrictInfo();
    return () => {
      ignore = true;
    };
  }, [slugParam]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !district) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'জেলাটি পাওয়া যায়নি।'} />
        <div className="text-center mt-4">
          <Link href="/districts" className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>জেলা তালিকায় ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/districts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল জেলাসমূহ</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
              <MapPin className="w-4 h-4" />
              <span>{district.division ? `${district.division} বিভাগ` : 'বাংলাদেশ'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              {district.name} জেলা
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {district.name} থেকে দেশের যেকোনো প্রান্তে বাস চলাচল, টিকিট ও কাউন্টার সংক্রান্ত সকল তথ্য।
            </p>
          </div>

          <Link
            href={`/booking?destination=${encodeURIComponent(district.name)}`}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition"
          >
            {district.name} এর জন্য বুকিং
          </Link>
        </div>
      </div>

      {/* Routes connected to this district */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <RouteIcon className="w-5 h-5 text-emerald-600" />
            <span>{district.name} জেলার সংযুক্ত রুটসমূহ ({routes.length})</span>
          </h2>
        </div>

        {routes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {routes.map((r) => (
              <RouteCard key={r.id} route={r} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="কোনো রুট সংরক্ষিত নেই"
            description="এই জেলার সাথে সংযুক্ত কোনো সক্রিয় রুট এখনো ডাটাবেসে যুক্ত হয়নি।"
          />
        )}
      </div>

      {/* Counters in this District */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          <span>{district.name} জেলার সকল বাস কাউন্টার ({counters.length})</span>
        </h2>

        {counters.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {counters.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{c.counter_name}</h3>
                  {c.buses && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {c.buses.name}
                    </span>
                  )}
                </div>
                {c.address && (
                  <p className="text-xs text-slate-600 leading-relaxed">{c.address}</p>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono pt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a>
                  </div>
                )}
                {c.latitude && c.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${c.latitude},${c.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-sky-600 font-semibold pt-1 hover:underline"
                  >
                    <span>ম্যাপে দেখুন</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="কোনো কাউন্টার সংরক্ষিত নেই"
            description="এই জেলার কোনো কাউন্টার নম্বর এখনো সিস্টেমে হালনাগাদ করা হয়নি।"
          />
        )}
      </div>
    </div>
  );
}
