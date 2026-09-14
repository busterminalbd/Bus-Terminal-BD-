'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Route as RouteIcon, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Bus as BusIcon, 
  ArrowLeft, 
  DollarSign, 
  Calendar,
  Phone
} from 'lucide-react';
import { supabase, Route, BusRoute, Fare, safeQuery, logSupabaseError, attachDistrictsToRoutes, isMissingRelationshipError } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

export default function RouteDetailPage() {
  const params = useParams();
  const routeId = params?.id as string;

  const [route, setRoute] = useState<Route | null>(null);
  const [busSchedules, setBusSchedules] = useState<BusRoute[]>([]);
  const [fares, setFares] = useState<Fare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadRouteDetails() {
      if (!routeId) return;
      try {
        setLoading(true);
        setError(null);

        // Fetch Route with districts
        const { data: routeData, error: rError } = await supabase
          .from('routes')
          .select(`
            *,
            from_district:districts!routes_from_district_id_fkey(id, name),
            to_district:districts!routes_to_district_id_fkey(id, name)
          `)
          .eq('id', routeId)
          .single();

        if (ignore) return;

        if (rError && isMissingRelationshipError(rError)) {
          logSupabaseError('Route detail error (district join failed, retrying without join):', rError);

          const { data: plainRoute, error: plainError } = await supabase
            .from('routes')
            .select('*')
            .eq('id', routeId)
            .single();

          if (plainError) throw plainError;
          const [withDistrict] = await attachDistrictsToRoutes([plainRoute as Route]);
          if (!ignore) setRoute(withDistrict as unknown as Route);
        } else {
          if (rError) throw rError;
          setRoute(routeData as unknown as Route);
        }

        // Fetch bus schedules running on this route
        const { data: schedData } = await safeQuery<BusRoute[]>((col) => {
          let q = supabase
            .from('bus_routes')
            .select(`
              *,
              buses(
                id,
                name,
                slug,
                is_ac,
                bus_type,
                phone,
                bus_operators(id, name, slug)
              )
            `)
            .eq('route_id', routeId);
          if (col) q = q.eq(col, true);
          return q;
        });

        if (!ignore && schedData) setBusSchedules(schedData as unknown as BusRoute[]);

        // Fetch fares on this route
        const { data: fareData } = await safeQuery<Fare[]>((col) => {
          let q = supabase
            .from('fares')
            .select(`
              *,
              buses(
                id,
                name,
                is_ac,
                bus_operators(id, name)
              )
            `)
            .eq('route_id', routeId);
          if (col) q = q.eq(col, true);
          return q;
        });

        if (!ignore && fareData) setFares(fareData as unknown as Fare[]);

      } catch (err) {
        logSupabaseError('Route detail error:', err);
        if (!ignore) setError('রুটের বিস্তারিত তথ্য লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadRouteDetails();
    return () => {
      ignore = true;
    };
  }, [routeId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !route) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'রুটটি পাওয়া যায়নি।'} />
        <div className="text-center mt-4">
          <Link href="/routes" className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>সকল রুটে ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  const fromName = route.from_district?.name || 'স্থান';
  const toName = route.to_district?.name || 'গন্তব্য';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/routes"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল রুটসমূহ</span>
        </Link>
      </div>

      {/* Route Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">
            <span>{fromName}</span>
            <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 shrink-0" />
            <span>{toName}</span>
          </div>

          <Link
            href={`/booking?type=route&from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition self-start sm:self-auto"
          >
            এই রুটে বুকিং করুন
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm text-slate-600">
          {route.distance_km && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>দূরত্ব: <strong>{route.distance_km} কিলোমিটার</strong></span>
            </div>
          )}
          {route.estimated_duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>আনুমানিক সময়: <strong>{route.estimated_duration}</strong></span>
            </div>
          )}
        </div>

        {route.description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl pt-2 border-t border-slate-100">
            {route.description}
          </p>
        )}
      </div>

      {/* Available Buses and Schedules */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>এই রুটের বাস ও সময়সূচি ({busSchedules.length})</span>
        </h2>

        {busSchedules.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">বাসের নাম</th>
                  <th className="py-3.5 px-4">অপারেটর</th>
                  <th className="py-3.5 px-4">টাইপ</th>
                  <th className="py-3.5 px-4">ছাড়ার সময়</th>
                  <th className="py-3.5 px-4">পৌঁছানোর সময়</th>
                  <th className="py-3.5 px-4">ভাড়া</th>
                  <th className="py-3.5 px-4">বুকিং</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {busSchedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.buses?.slug ? (
                        <Link href={`/buses/${item.buses.slug}`} className="hover:text-emerald-700 underline">
                          {item.buses?.name}
                        </Link>
                      ) : (
                        item.buses?.name || 'বাস'
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.buses?.bus_operators?.name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        item.buses?.is_ac ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.buses?.is_ac ? 'AC' : 'Non-AC'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-700">
                      {item.departure_time || 'নিয়মিত'}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {item.arrival_time || '-'}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {item.fare ? `৳ ${item.fare}` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/booking?type=bus&bus_id=${item.bus_id}`}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold"
                      >
                        বুকিং
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="কোনো শিডিউল সংরক্ষিত নেই"
            description="এই রুটে বর্তমানে নির্দিষ্ট সময়সূচি ডাটাবেসে পাওয়া যায়নি।"
          />
        )}
      </div>

      {/* Official Fares on this Route */}
      {fares.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span>ভাড়ার বিবরণী</span>
          </h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-x-auto shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">বাসের নাম</th>
                  <th className="py-3.5 px-4">ক্লাস</th>
                  <th className="py-3.5 px-4">ভাড়া</th>
                  <th className="py-3.5 px-4">ভাড়ার ধরন</th>
                  <th className="py-3.5 px-4">মন্তব্য</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {fares.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {f.buses?.name || 'বাস'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        f.buses?.is_ac ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {f.buses?.is_ac ? 'AC' : 'Non-AC'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-700">
                      ৳ {f.fare}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {f.fare_type || 'নিয়মিত'}
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
