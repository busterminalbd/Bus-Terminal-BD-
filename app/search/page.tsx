'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Bus, Building2, Route as RouteIcon, MapPin, Compass } from 'lucide-react';
import { supabase, Bus as BusType, BusOperator, Route as RouteType, District, TourPackage, safeQuery, logSupabaseError, attachDistrictsToRoutes, isMissingRelationshipError } from '@/lib/supabase';
import BusCard from '@/components/BusCard';
import OperatorCard from '@/components/OperatorCard';
import RouteCard from '@/components/RouteCard';
import TourCard from '@/components/TourCard';
import EmptyState from '@/components/EmptyState';
import { trackMetaEvent } from '@/lib/metaPixelEvents';

function SearchContent() {
  // Fetches routes with district names embedded; if the embedded
  // districts!routes_*_fkey join can't be resolved by PostgREST (e.g. the live schema's
  // actual foreign-key constraint name differs from what the query assumed), falls back
  // to a plain routes query + a separate districts query merged client-side.
  async function fetchRoutesForSearch(): Promise<RouteType[]> {
    const { data: rData, error: rError } = await safeQuery<RouteType[]>((col) => {
      let q = supabase
        .from('routes')
        .select(`
          *,
          from_district:districts!routes_from_district_id_fkey(id, name),
          to_district:districts!routes_to_district_id_fkey(id, name)
        `);
      if (col) q = q.eq(col, true);
      return q.limit(12);
    });

    if (rError && isMissingRelationshipError(rError)) {
      logSupabaseError('Search routes load error (district join failed, retrying without join):', rError);
      const fallback = await safeQuery<RouteType[]>((col) => {
        let q = supabase.from('routes').select('*');
        if (col) q = q.eq(col, true);
        return q.limit(12);
      });
      if (!fallback.data) return [];
      return (await attachDistrictsToRoutes(fallback.data as RouteType[])) as unknown as RouteType[];
    }

    return (rData as unknown as RouteType[]) || [];
  }

  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);

  const [buses, setBuses] = useState<BusType[]>([]);
  const [operators, setOperators] = useState<BusOperator[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [tours, setTours] = useState<TourPackage[]>([]);

  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setBuses([]);
      setOperators([]);
      setRoutes([]);
      setTours([]);
      return;
    }

    try {
      setLoading(true);

      trackMetaEvent('Search', {
        search_string: term.trim(),
      });

      // Search buses
      const { data: bData } = await safeQuery<BusType[]>((col) => {
        let q = supabase
          .from('buses')
          .select('*, bus_operators(*)')
          .or(`name.ilike.%${term}%,bus_type.ilike.%${term}%,category.ilike.%${term}%`);
        if (col) q = q.eq(col, true);
        return q.limit(6);
      });

      if (bData) setBuses(bData as unknown as BusType[]);

      // Search operators
      const { data: opData } = await safeQuery<BusOperator[]>((col) => {
        let q = supabase
          .from('bus_operators')
          .select('*')
          .ilike('name', `%${term}%`);
        if (col) q = q.eq(col, true);
        return q.limit(6);
      });

      if (opData) setOperators(opData as BusOperator[]);

      // Search routes (by description or district)
      const rData = await fetchRoutesForSearch();

      {
        // filter client-side for district names matching term
        const matchedRoutes = rData.filter(
          (r) =>
            r.from_district?.name?.toLowerCase().includes(term.toLowerCase()) ||
            r.to_district?.name?.toLowerCase().includes(term.toLowerCase()) ||
            (r.description && r.description.toLowerCase().includes(term.toLowerCase()))
        );
        setRoutes(matchedRoutes.slice(0, 6));
      }

      // Search tours
      const { data: tData } = await safeQuery<TourPackage[]>((col) => {
        let q = supabase
          .from('tour_packages')
          .select('*')
          .or(`title.ilike.%${term}%,destination.ilike.%${term}%`);
        if (col) q = q.eq(col, true);
        return q.limit(6);
      });

      if (tData) setTours(tData as TourPackage[]);

    } catch (err) {
      logSupabaseError('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (initialQuery) {
      async function doSearch() {
        try {
          const term = initialQuery.trim();
          if (!term) return;

          trackMetaEvent('Search', {
            search_string: term,
          });

          const { data: bData } = await safeQuery<BusType[]>((col) => {
            let q = supabase
              .from('buses')
              .select('*, bus_operators(*)')
              .or(`name.ilike.%${term}%,bus_type.ilike.%${term}%,category.ilike.%${term}%`);
            if (col) q = q.eq(col, true);
            return q.limit(6);
          });

          if (ignore) return;
          if (bData) setBuses(bData as unknown as BusType[]);

          const { data: opData } = await safeQuery<BusOperator[]>((col) => {
            let q = supabase
              .from('bus_operators')
              .select('*')
              .ilike('name', `%${term}%`);
            if (col) q = q.eq(col, true);
            return q.limit(6);
          });

          if (ignore) return;
          if (opData) setOperators(opData as BusOperator[]);

          const rData = await fetchRoutesForSearch();

          if (ignore) return;
          {
            const matchedRoutes = rData.filter(
              (r) =>
                r.from_district?.name?.toLowerCase().includes(term.toLowerCase()) ||
                r.to_district?.name?.toLowerCase().includes(term.toLowerCase()) ||
                (r.description && r.description.toLowerCase().includes(term.toLowerCase()))
            );
            setRoutes(matchedRoutes.slice(0, 6));
          }

          const { data: tData } = await safeQuery<TourPackage[]>((col) => {
            let q = supabase
              .from('tour_packages')
              .select('*')
              .or(`title.ilike.%${term}%,destination.ilike.%${term}%`);
            if (col) q = q.eq(col, true);
            return q.limit(6);
          });

          if (ignore) return;
          if (tData) setTours(tData as TourPackage[]);
        } catch (err) {
          logSupabaseError('Search error:', err);
        } finally {
          if (!ignore) setLoading(false);
        }
      }

      doSearch();
    }
    return () => {
      ignore = true;
    };
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const totalResults = buses.length + operators.length + routes.length + tours.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Search Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          সার্বজনীন অনুসন্ধান
        </h1>
        <p className="text-sm text-slate-500">
          বাসের নাম, রুট, অপারেটর কোম্পানি, জেলা বা ট্যুর প্যাকেজ সহজে খুঁজুন।
        </p>

        <form onSubmit={handleSearchSubmit} className="pt-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="কী খুঁজতে চান? যেমন: গ্রিন লাইন, ঢাকা, সিলেট, এসি..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition"
          >
            অনুসন্ধান
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : query && totalResults === 0 ? (
        <EmptyState
          title="কোনো ফলাফল মেলেনি"
          description={`"${query}" এর সাথে মিলে এমন কোনো বাস, অপারেটর বা রুট পাওয়া যায়নি।`}
        />
      ) : (
        <div className="space-y-12">
          {/* Operators */}
          {operators.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>অপারেটরসমূহ ({operators.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {operators.map((op) => (
                  <OperatorCard key={op.id} operator={op} />
                ))}
              </div>
            </div>
          )}

          {/* Buses */}
          {buses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Bus className="w-4 h-4 text-red-600" />
                <span>বাসসমূহ ({buses.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {buses.map((bus) => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
              </div>
            </div>
          )}

          {/* Routes */}
          {routes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <RouteIcon className="w-4 h-4 text-red-600" />
                <span>রুটসমূহ ({routes.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {routes.map((route) => (
                  <RouteCard key={route.id} route={route} />
                ))}
              </div>
            </div>
          )}

          {/* Tours */}
          {tours.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-red-600" />
                <span>ট্যুর প্যাকেজসমূহ ({tours.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((t) => (
                  <TourCard key={t.id} tour={t} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
