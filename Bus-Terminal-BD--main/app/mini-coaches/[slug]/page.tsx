'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Car, Users, Phone, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase, MiniCoach, safeQuery, logSupabaseError } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';

export default function MiniCoachDetailPage() {
  const params = useParams();
  const slugParam = params?.slug as string;

  const [coach, setCoach] = useState<MiniCoach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCoach() {
      if (!slugParam) return;
      try {
        setLoading(true);
        setError(null);

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugParam);

        const { data, error: sbError } = await safeQuery<MiniCoach>((col) => {
          let query = supabase.from('mini_coaches').select('*');
          if (col) query = query.eq(col, true);
          if (isUUID) {
            query = query.eq('id', slugParam);
          } else {
            query = query.eq('slug', slugParam);
          }
          return query.single();
        });

        if (ignore) return;
        if (sbError) throw sbError;
        setCoach(data);
      } catch (err) {
        logSupabaseError('Coach load error:', err);
        if (!ignore) setError('মিনি কোচের তথ্য লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCoach();
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

  if (error || !coach) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'মিনি কোচটি পাওয়া যায়নি।'} />
        <div className="text-center mt-4">
          <Link href="/mini-coaches" className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>মিনি কোচ তালিকায় ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div>
        <Link
          href="/mini-coaches"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল মিনি কোচ তালিকা</span>
        </Link>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[300px] bg-slate-100">
            <Image
              src={coach.image_url || fallbackImage}
              alt={coach.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {coach.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  coach.is_ac ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {coach.is_ac ? 'এসি (AC)' : 'নন-এসি'}
                </span>
                {coach.vehicle_type && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                    {coach.vehicle_type}
                  </span>
                )}
              </div>

              {coach.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {coach.description}
                </p>
              )}

              {/* Rates grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                {coach.per_day_rate && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">দৈনিক রেট</span>
                    <span className="font-bold text-slate-900 text-sm">৳ {coach.per_day_rate}</span>
                  </div>
                )}
                {coach.per_km_rate && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">প্রতি কিমি</span>
                    <span className="font-bold text-slate-900 text-sm">৳ {coach.per_km_rate}</span>
                  </div>
                )}
                {coach.driver_charge && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">ড্রাইভার খরচ</span>
                    <span className="font-bold text-slate-900 text-sm">৳ {coach.driver_charge}</span>
                  </div>
                )}
                {coach.extra_day_rate && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[10px]">অতিরিক্ত দিন</span>
                    <span className="font-bold text-slate-900 text-sm">৳ {coach.extra_day_rate}</span>
                  </div>
                )}
              </div>

              {coach.capacity && (
                <div className="flex items-center gap-2 text-xs text-slate-600 pt-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>ধারণক্ষমতা: <strong>{coach.capacity} জন যাত্রী</strong></span>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4">
              <Link
                href={`/booking?type=mini_coach&mini_coach_id=${coach.id}&name=${encodeURIComponent(coach.name)}`}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
              >
                ভাড়া জানতে / বুকিং করতে যোগাযোগ করুন
              </Link>
              {coach.phone && (
                <a
                  href={`tel:${coach.phone}`}
                  className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 transition"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>{coach.phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
