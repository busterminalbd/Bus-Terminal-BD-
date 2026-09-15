import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bus as BusIcon, Phone, Users, Sparkles, ChevronRight } from 'lucide-react';
import { Bus } from '@/lib/supabase';

interface BusCardProps {
  bus: Bus;
}

export default function BusCard({ bus }: BusCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Bus Image */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Image
          src={bus.image_url || fallbackImage}
          alt={bus.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs ${
            bus.is_ac 
              ? 'bg-sky-600 text-white' 
              : 'bg-slate-800/90 text-white'
          }`}>
            {bus.is_ac ? 'এসি (AC)' : 'নন-এসি (Non-AC)'}
          </span>
          {bus.category && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-slate-800 shadow-xs">
              {bus.category}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {bus.bus_operators && (
            <p className="text-xs font-semibold text-emerald-600 mb-1">
              {bus.bus_operators.name}
            </p>
          )}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {bus.name}
          </h3>
          {bus.bus_type && (
            <p className="text-xs text-slate-500 mt-0.5">
              টাইপ: {bus.bus_type}
            </p>
          )}
          {bus.description && (
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
              {bus.description}
            </p>
          )}

          {/* Quick Specs */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            {bus.seat_count ? (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>{bus.seat_count} টি আসন</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-400">
                <BusIcon className="w-3.5 h-3.5" />
                <span>মানসম্মত আসন</span>
              </div>
            )}
            {bus.phone && (
              <div className="flex items-center gap-1.5 truncate">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate font-mono">{bus.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            href={`/buses/${bus.id}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>বিস্তারিত তথ্য</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href={`/booking?type=bus&bus_id=${bus.id}`}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition"
          >
            বুকিং অনুরোধ
          </Link>
        </div>
      </div>
    </div>
  );
}
