'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, Search, Filter, Bus as BusIcon, ArrowRight, Calendar } from 'lucide-react';
import { supabase, Fare, District, Bus, safeQuery, logSupabaseError, isMissingRelationshipError } from '@/lib/supabase';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

export default function FaresPage() {
  const [fares, setFares] = useState<Fare[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [fromDistrictId, setFromDistrictId] = useState('');
  const [toDistrictId, setToDistrictId] = useState('');
  const [selectedBusId, setSelectedBusId] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadFares() {
      try {
        // Load districts
        const { data: distData } = await safeQuery<District[]>((col) => {
          let q = supabase.from('districts').select('id, name, division');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });
        if (!ignore && distData) setDistricts(distData as District[]);

        // Load buses
        const { data: busData } = await safeQuery<Bus[]>((col) => {
          let q = supabase.from('buses').select('id, name, is_ac');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });
        if (!ignore && busData) setBuses(busData as Bus[]);

        // Load fares with relations
        const { data: fareData, error: fError } = await safeQuery<Fare[]>((col) => {
          let q = supabase
            .from('fares')
            .select(`
              *,
              buses(
                id,
                name,
                slug,
                is_ac,
                bus_operators(id, name)
              ),
              routes(
                id,
                from_district_id,
                to_district_id,
                from_district:districts!routes_from_district_id_fkey(id, name),
                to_district:districts!routes_to_district_id_fkey(id, name)
              )
            `);
          if (col) q = q.eq(col, true);
          return q.order('fare');
        });

        if (ignore) return;

        // If the nested routes -> districts!routes_*_fkey join can't be resolved (e.g.
        // the live schema's actual foreign-key constraint name differs from what the
        // query assumed), retry with a simpler embed (no district names) and attach
        // district names to each fare's route separately.
        if (fError && isMissingRelationshipError(fError)) {
          logSupabaseError('Fares load error (district join failed, retrying without join):', fError);

          const fallback = await safeQuery<Fare[]>((col) => {
            let q = supabase
              .from('fares')
              .select(`
                *,
                buses(
                  id,
                  name,
                  slug,
                  is_ac,
                  bus_operators(id, name)
                ),
                routes(
                  id,
                  from_district_id,
                  to_district_id
                )
              `);
            if (col) q = q.eq(col, true);
            return q.order('fare');
          });

          if (fallback.error) throw fallback.error;

          const plainFares = (fallback.data as Fare[]) || [];
          const districtIds = Array.from(
            new Set(
              plainFares
                .flatMap((f) => [f.routes?.from_district_id, f.routes?.to_district_id])
                .filter((id): id is string => Boolean(id))
            )
          );
          let districtsMap = new Map<string, District>();
          if (districtIds.length > 0) {
            const { data: districtRows } = await supabase.from('districts').select('id, name').in('id', districtIds);
            districtsMap = new Map((districtRows || []).map((d: District) => [d.id, d]));
          }

          const faresWithDistricts = plainFares.map((f) => ({
            ...f,
            routes: f.routes
              ? {
                  ...f.routes,
                  from_district: f.routes.from_district_id ? districtsMap.get(f.routes.from_district_id) ?? null : null,
                  to_district: f.routes.to_district_id ? districtsMap.get(f.routes.to_district_id) ?? null : null,
                }
              : null,
          }));

          if (!ignore) setFares(faresWithDistricts as unknown as Fare[]);
          return;
        }

        if (fError) throw fError;
        setFares((fareData as unknown as Fare[]) || []);
      } catch (err) {
        logSupabaseError('Fares load error:', err);
        if (!ignore) setError('ভাড়ার তালিকা লোড করা সম্ভব হয়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadFares();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((c) => c + 1);
  };

  // Filtered
  const filtered = fares.filter((f) => {
    if (fromDistrictId && f.routes?.from_district_id !== fromDistrictId) return false;
    if (toDistrictId && f.routes?.to_district_id !== toDistrictId) return false;
    if (selectedBusId && f.bus_id !== selectedBusId) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider mb-1">
          <DollarSign className="w-4 h-4" />
          <span>ভাড়ার তালিকা ও তথ্য</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          বাস ভাড়ার তালিকা
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          বাংলাদেশের বিভিন্ন রুটের বাসের অফিসিয়াল ভাড়ার তালিকা। যাত্রার স্থান ও গন্তব্য নির্বাচন করে সঠিক ভাড়া যাচাই করুন।
        </p>

        {/* Filter controls */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              কোথা থেকে (From)
            </label>
            <select
              value={fromDistrictId}
              onChange={(e) => setFromDistrictId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="">সকল জেলা</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              গন্তব্য (To)
            </label>
            <select
              value={toDistrictId}
              onChange={(e) => setToDistrictId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="">সকল গন্তব্য</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              নির্দিষ্ট বাস (Bus)
            </label>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            >
              <option value="">সকল বাস</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.is_ac ? 'AC' : 'Non-AC'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(fromDistrictId || toDistrictId || selectedBusId) && (
              <button
                type="button"
                onClick={() => {
                  setFromDistrictId('');
                  setToDistrictId('');
                  setSelectedBusId('');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                ফিল্টার মুছুন
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো ভাড়া পাওয়া যায়নি"
          description="নির্বাচিত রুট বা বাসের জন্য বর্তমানে কোনো ভাড়ার তথ্য ডাটাবেসে নেই।"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-4 px-4">রুট (স্থান ➔ গন্তব্য)</th>
                <th className="py-4 px-4">বাসের নাম ও অপারেটর</th>
                <th className="py-4 px-4">ক্লাস</th>
                <th className="py-4 px-4">ভাড়া (টাকা)</th>
                <th className="py-4 px-4">ভাড়ার ধরন</th>
                <th className="py-4 px-4">কার্যকর তারিখ</th>
                <th className="py-4 px-4">মন্তব্য</th>
                <th className="py-4 px-4 text-right">বুকিং</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((f) => {
                const fromName = f.routes?.from_district?.name || 'স্থান';
                const toName = f.routes?.to_district?.name || 'গন্তব্য';
                return (
                  <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{fromName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <span>{toName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{f.buses?.name || 'বাস'}</div>
                      <div className="text-[11px] text-slate-400">{f.buses?.bus_operators?.name}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        f.buses?.is_ac ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {f.buses?.is_ac ? 'AC' : 'Non-AC'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-red-700 text-base">
                      ৳ {f.fare}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {f.fare_type || 'নিয়মিত'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {f.effective_from ? new Date(f.effective_from).toLocaleDateString('bn-BD') : 'চলতি'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {f.notes || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/booking?type=bus&bus_id=${f.bus_id}&from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`}
                        className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-800 rounded-lg text-xs font-bold inline-block"
                      >
                        বুকিং অনুরোধ
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
