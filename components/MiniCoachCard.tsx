import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Car, Users, Phone, ChevronRight } from 'lucide-react';
import { MiniCoach } from '@/lib/supabase';

interface MiniCoachCardProps {
  coach: MiniCoach;
}

export default function MiniCoachCard({ coach }: MiniCoachCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Image
          src={coach.image_url || fallbackImage}
          alt={coach.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs ${
            coach.is_ac ? 'bg-sky-600 text-white' : 'bg-slate-800 text-white'
          }`}>
            {coach.is_ac ? 'এসি (AC)' : 'নন-এসি (Non-AC)'}
          </span>
          {coach.vehicle_type && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 text-slate-800 shadow-xs">
              {coach.vehicle_type}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors">
            {coach.name}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
            {coach.capacity && (
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>ধারণক্ষমতা: {coach.capacity} জন</span>
              </div>
            )}
            {coach.phone && (
              <div className="flex items-center gap-1.5 font-mono">
                <Phone className="w-3.5 h-3.5 text-red-600" />
                <span>{coach.phone}</span>
              </div>
            )}
          </div>

          {/* Pricing points */}
          <div className="mt-3 p-2.5 bg-slate-50 rounded-xl grid grid-cols-2 gap-2 text-xs">
            {coach.per_day_rate ? (
              <div>
                <span className="text-slate-400 block text-[10px]">দৈনিক রেট</span>
                <span className="font-bold text-slate-800">৳ {coach.per_day_rate}</span>
              </div>
            ) : null}
            {coach.per_km_rate ? (
              <div>
                <span className="text-slate-400 block text-[10px]">প্রতি কিমি</span>
                <span className="font-bold text-slate-800">৳ {coach.per_km_rate}</span>
              </div>
            ) : null}
            {coach.driver_charge ? (
              <div>
                <span className="text-slate-400 block text-[10px]">ড্রাইভার খরচ</span>
                <span className="font-bold text-slate-800">৳ {coach.driver_charge}</span>
              </div>
            ) : null}
            {coach.extra_day_rate ? (
              <div>
                <span className="text-slate-400 block text-[10px]">অতিরিক্ত দিন</span>
                <span className="font-bold text-slate-800">৳ {coach.extra_day_rate}</span>
              </div>
            ) : null}
          </div>

          {coach.description && (
            <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
              {coach.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            href={`/mini-coaches/${coach.slug || coach.id}`}
            className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
          >
            <span>বিস্তারিত</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/booking?type=mini_coach&mini_coach_id=${coach.id}&name=${encodeURIComponent(coach.name)}`}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition"
          >
            ভাড়া অনুরোধ
          </Link>
        </div>
      </div>
    </div>
  );
}
