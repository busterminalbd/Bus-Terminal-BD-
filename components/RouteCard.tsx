import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, ChevronRight, Bus } from 'lucide-react';
import { Route } from '@/lib/supabase';

interface RouteCardProps {
  route: Route;
  fareAmount?: number | null;
}

export default function RouteCard({ route, fareAmount }: RouteCardProps) {
  const fromName = route.from_district?.name || 'স্থান';
  const toName = route.to_district?.name || 'গন্তব্য';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* From -> To */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-black text-slate-900">{fromName}</span>
            <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-base font-black text-slate-900">{toName}</span>
          </div>
          {fareAmount ? (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
              ৳ {fareAmount}
            </span>
          ) : null}
        </div>

        {/* Details: distance & duration */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
          {route.distance_km && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{route.distance_km} কি.মি.</span>
            </span>
          )}
          {route.estimated_duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>আনুমানিক {route.estimated_duration}</span>
            </span>
          )}
        </div>

        {route.description && (
          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {route.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/routes/${route.id}`}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
        >
          <Bus className="w-3.5 h-3.5" />
          <span>বাস ও সময়সূচি দেখুন</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
        <Link
          href={`/booking?type=route&from=${encodeURIComponent(fromName)}&to=${encodeURIComponent(toName)}`}
          className="text-xs font-semibold text-slate-600 hover:text-emerald-600"
        >
          বুকিং
        </Link>
      </div>
    </div>
  );
}
