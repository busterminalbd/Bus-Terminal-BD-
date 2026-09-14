'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Bus as BusIcon, 
  Building2, 
  Phone, 
  Users, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { supabase, Bus, BusOperator, BusRoute, Counter, Fare, District, safeQuery, logSupabaseError, isMissingRelationshipError } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

export default function BusDetailPage() {
  // Attaches from_district/to_district onto each item's nested `routes` object via a
  // separate districts query — the fallback shape for schedules/fares when the embedded
  // routes -> districts!routes_*_fkey join can't be resolved by PostgREST.
  async function attachDistrictsToNestedRoutes<T extends { routes?: { from_district_id?: string | null; to_district_id?: string | null } | null }>(
    items: T[]
  ): Promise<T[]> {
    const ids = Array.from(
      new Set(
        items
          .flatMap((i) => [i.routes?.from_district_id, i.routes?.to_district_id])
          .filter((id): id is string => Boolean(id))
      )
    );
    if (ids.length === 0) return items;

    const { data } = await supabase.from('districts').select('id, name').in('id', ids);
    const map = new Map<string, District>((((data as District[]) || [])).map((d) => [d.id, d]));

    return items.map((item) => ({
      ...item,
      routes: item.routes
        ? {
            ...item.routes,
            from_district: item.routes.from_district_id ? map.get(item.routes.from_district_id) ?? null : null,
            to_district: item.routes.to_district_id ? map.get(item.routes.to_district_id) ?? null : null,
          }
        : item.routes,
    }));
  }

  const params = useParams();
  const slugParam = params?.slug as string;

  const [bus, setBus] = useState<Bus | null>(null);
  const [operator, setOperator] = useState<BusOperator | null>(null);
  const [schedules, setSchedules] = useState<BusRoute[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [fares, setFares] = useState<Fare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadBusData() {
      if (!slugParam) return;
      try {
        setLoading(true);
        setError(null);

        const decodedParam = decodeURIComponent(slugParam);
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedParam);

        // Prefer the immutable bus ID for details URLs. Slugs can be changed
        // by an admin edit, so the details page must not depend on a mutable slug.
        let { data: busData, error: bError } = await safeQuery<Bus>((col) => {
          let q = supabase
            .from('buses')
            .select(`
              *,
              bus_operators(*)
            `);
          if (col) q = q.eq(col, true);
          if (isUUID) {
            q = q.eq('id', decodedParam);
          } else {
            q = q.eq('slug', decodedParam);
          }
          return q.maybeSingle();
        });

        // If the URL slug no longer matches after an admin edit, try the bus name
        // as a compatibility fallback. This keeps an existing details URL usable
        // when the record's slug was changed accidentally.
        if (!bError && !busData && !isUUID) {
          const fallbackByName = await safeQuery<Bus>((col) => {
            let q = supabase
              .from('buses')
              .select(`*, bus_operators(*)`)
              .eq('name', decodeURIComponent(slugParam));
            if (col) q = q.eq(col, true);
            return q.maybeSingle();
          });
          if (fallbackByName.data) busData = fallbackByName.data;
        }

        // If the joined query fails (e.g. the bus_operators relationship
        // isn't recognized by PostgREST's schema cache), fall back to a
        // plain query on the buses table and fetch the operator separately.
        if (bError) {
          logSupabaseError('Bus detail load error (joined query failed, retrying without join):', bError);

          const fallback = await safeQuery<Bus>((col) => {
            let q = supabase.from('buses').select('*');
            if (col) q = q.eq(col, true);
            if (isUUID) {
              q = q.eq('id', decodedParam);
            } else {
              q = q.eq('slug', decodeURIComponent(slugParam));
            }
            return q.maybeSingle();
          });

          busData = fallback.data;
          bError = fallback.error;

          if (!bError && busData?.operator_id) {
            const { data: opRow } = await supabase
              .from('bus_operators')
              .select('*')
              .eq('id', busData.operator_id)
              .maybeSingle();
            if (opRow) busData = { ...busData, bus_operators: opRow };
          }
        }

        if (ignore) return;
        if (bError) throw bError;
        setBus(busData);

        if (busData) {
          if (busData.bus_operators) {
            setOperator(busData.bus_operators);
          }

          // Fetch schedules (bus_routes)
          const { data: scheduleData, error: scheduleError } = await safeQuery<BusRoute[]>((col) => {
            let q = supabase
              .from('bus_routes')
              .select(`
                *,
                routes(
                  id,
                  from_district:districts!routes_from_district_id_fkey(id, name),
                  to_district:districts!routes_to_district_id_fkey(id, name)
                )
              `)
              .eq('bus_id', busData.id);
            if (col) q = q.eq(col, true);
            return q;
          });

          if (scheduleError && isMissingRelationshipError(scheduleError)) {
            logSupabaseError('Bus schedules load error (district join failed, retrying without join):', scheduleError);
            const fallback = await safeQuery<BusRoute[]>((col) => {
              let q = supabase
                .from('bus_routes')
                .select('*, routes(id, from_district_id, to_district_id)')
                .eq('bus_id', busData.id);
              if (col) q = q.eq(col, true);
              return q;
            });
            if (!ignore && fallback.data) {
              const withDistricts = await attachDistrictsToNestedRoutes(fallback.data as BusRoute[]);
              setSchedules(withDistricts as unknown as BusRoute[]);
            }
          } else if (!ignore && scheduleData) {
            setSchedules(scheduleData as unknown as BusRoute[]);
          }

          // Fetch counters for this bus
          const { data: counterData } = await safeQuery<Counter[]>((col) => {
            let q = supabase
              .from('counters')
              .select(`
                *,
                districts(id, name)
              `)
              .eq('bus_id', busData.id);
            if (col) q = q.eq(col, true);
            return q;
          });

          if (!ignore && counterData) setCounters(counterData as unknown as Counter[]);

          // Fetch fares for this bus
          const { data: fareData, error: fareError } = await safeQuery<Fare[]>((col) => {
            let q = supabase
              .from('fares')
              .select(`
                *,
                routes(
                  id,
                  from_district:districts!routes_from_district_id_fkey(id, name),
                  to_district:districts!routes_to_district_id_fkey(id, name)
                )
              `)
              .eq('bus_id', busData.id);
            if (col) q = q.eq(col, true);
            return q;
          });

          if (fareError && isMissingRelationshipError(fareError)) {
            logSupabaseError('Bus fares load error (district join failed, retrying without join):', fareError);
            const fallback = await safeQuery<Fare[]>((col) => {
              let q = supabase
                .from('fares')
                .select('*, routes(id, from_district_id, to_district_id)')
                .eq('bus_id', busData.id);
              if (col) q = q.eq(col, true);
              return q;
            });
            if (!ignore && fallback.data) {
              const withDistricts = await attachDistrictsToNestedRoutes(fallback.data as Fare[]);
              setFares(withDistricts as unknown as Fare[]);
            }
          } else if (!ignore && fareData) {
            setFares(fareData as unknown as Fare[]);
          }
        }
      } catch (err) {
        logSupabaseError('Bus details load error:', err);
        if (!ignore) setError('বাসের বিস্তারিত তথ্য লোড করা সম্ভব হয়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadBusData();
    return () => {
      ignore = true;
    };
  }, [slugParam]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-72 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'বাসটি পাওয়া যায়নি।'} />
        <div className="text-center mt-4">
          <Link href="/buses" className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>বাস তালিকায় ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/buses"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল বাস তালিকা</span>
        </Link>
      </div>

      {/* Main Bus Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Image */}
          <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[280px] bg-slate-100">
            <Image
              src={bus.image_url || fallbackImage}
              alt={bus.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Details */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              {operator && (
                <Link
                  href={`/operators/${operator.slug || operator.id}`}
                  className="text-xs font-bold text-emerald-600 hover:underline inline-flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{operator.name}</span>
                </Link>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {bus.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  bus.is_ac ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {bus.is_ac ? 'এসি (AC)' : 'নন-এসি (Non-AC)'}
                </span>
                {bus.category && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {bus.category}
                  </span>
                )}
              </div>

              {bus.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {bus.description}
                </p>
              )}

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
                {bus.bus_type && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">টাইপ</span>
                    <span className="font-bold text-slate-800">{bus.bus_type}</span>
                  </div>
                )}
                {bus.seat_count && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">মোট আসন</span>
                    <span className="font-bold text-slate-800">{bus.seat_count} টি</span>
                  </div>
                )}
                {bus.phone && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">হেল্পলাইন</span>
                    <span className="font-bold text-emerald-700 font-mono">{bus.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <Link
                href={`/booking?type=bus&bus_id=${bus.id}&name=${encodeURIComponent(bus.name)}`}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition active:scale-95"
              >
                আসন বুকিং অনুরোধ পাঠান
              </Link>
              {bus.phone && (
                <a
                  href={`tel:${bus.phone}`}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>কল করুন</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedules (bus_routes) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>সময়সূচি ও রুটসমূহ</span>
        </h2>

        {schedules.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">রুট</th>
                  <th className="py-3.5 px-4">ছাড়ার সময়</th>
                  <th className="py-3.5 px-4">পৌঁছানোর সময়</th>
                  <th className="py-3.5 px-4">বোর্ডিং পয়েন্ট</th>
                  <th className="py-3.5 px-4">ভাড়া</th>
                  <th className="py-3.5 px-4">সার্ভিসের দিন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {schedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.routes?.from_district?.name || 'স্থান'} ➔ {item.routes?.to_district?.name || 'গন্তব্য'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700">
                      {item.departure_time || 'নির্ধারিত নয়'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.arrival_time || 'নির্ধারিত নয়'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.boarding_point || 'কাউন্টার'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.fare ? `৳ ${item.fare}` : 'যোগাযোগ করুন'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {Array.isArray(item.service_days) ? item.service_days.join(', ') : item.service_days || 'প্রতিদিন'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
            এই বাসের জন্য কোনো নির্দিষ্ট সময়সূচি ডাটাবেসে পাওয়া যায়নি।
          </div>
        )}
      </div>

      {/* Counters for this Bus */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-600" />
          <span>কাউন্টার ও টিকিট বুথ</span>
        </h2>

        {counters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {counters.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{c.counter_name}</h3>
                  {c.districts && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {c.districts.name}
                    </span>
                  )}
                </div>
                {c.address && (
                  <p className="text-xs text-slate-600 leading-relaxed">{c.address}</p>
                )}
                {c.phone && (
                  <div className="flex items-center gap-1 text-xs text-emerald-700 font-mono pt-1">
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
            বর্তমানে কোনো কাউন্টার তথ্য ডাটাবেসে সংরক্ষিত নেই।
          </div>
        )}
      </div>

      {/* Fares Table */}
      {fares.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>ভাড়ার তালিকা</span>
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">রুট</th>
                  <th className="py-3.5 px-4">ভাড়ার পরিমাণ</th>
                  <th className="py-3.5 px-4">ভাড়ার ধরন</th>
                  <th className="py-3.5 px-4">কার্যকর তারিখ</th>
                  <th className="py-3.5 px-4">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fares.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {f.routes?.from_district?.name || 'স্থান'} ➔ {f.routes?.to_district?.name || 'গন্তব্য'}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      ৳ {f.fare}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {f.fare_type || 'নিয়মিত'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {f.effective_from ? new Date(f.effective_from).toLocaleDateString('bn-BD') : 'চলতি'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {f.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
