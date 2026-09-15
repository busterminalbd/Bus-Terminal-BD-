'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Users, 
  DollarSign, 
  Check, 
  X, 
  Phone, 
  ArrowLeft, 
  AlertCircle 
} from 'lucide-react';
import { supabase, TourPackage, safeQuery, logSupabaseError } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';

export default function TourDetailPage() {
  const params = useParams();
  const slugParam = params?.slug as string;

  const [tour, setTour] = useState<TourPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadTour() {
      if (!slugParam) return;
      try {
        setLoading(true);
        setError(null);

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugParam);

        const { data, error: sbError } = await safeQuery<TourPackage>((col) => {
          let query = supabase.from('tour_packages').select('*');
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
        setTour(data);
      } catch (err) {
        logSupabaseError('Tour load error:', err);
        if (!ignore) setError('ট্যুর প্যাকেজের তথ্য লোড করা যায়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadTour();
    return () => {
      ignore = true;
    };
  }, [slugParam]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-80 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'ট্যুর প্যাকেজটি পাওয়া যায়নি।'} />
        <div className="text-center mt-4">
          <Link href="/tours" className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>ট্যুর তালিকায় ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div>
        <Link
          href="/tours"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল ট্যুর প্যাকেজ</span>
        </Link>
      </div>

      {/* Hero card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="relative h-64 sm:h-96 w-full bg-slate-900">
          <Image
            src={tour.image_url || fallbackImage}
            alt={tour.title}
            fill
            className="object-cover opacity-85"
            sizes="100vw"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
            <div className="space-y-2 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                {tour.destination && (
                  <span className="bg-emerald-600/90 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{tour.destination}</span>
                  </span>
                )}
                {tour.duration && (
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{tour.duration}</span>
                  </span>
                )}
                {tour.minimum_people && (
                  <span className="bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>সর্বনিম্ন {tour.minimum_people} জন</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black">{tour.title}</h1>
            </div>
          </div>
        </div>

        {/* Pricing & CTA Banner */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block">প্যাকেজ মূল্য (জনপ্রতি)</span>
            <div className="text-3xl font-black text-emerald-700">
              ৳ {tour.price}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {tour.phone && (
              <a
                href={`tel:${tour.phone}`}
                className="px-4 py-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs sm:text-sm font-bold rounded-xl transition inline-flex items-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{tour.phone}</span>
              </a>
            )}
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-10 space-y-8">
          {/* Itinerary */}
          {tour.itinerary && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
                ভ্রমণ পরিকল্পনা ও বিস্তারিত (Itinerary)
              </h2>
              <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {tour.itinerary}
              </div>
            </div>
          )}

          {/* Included / Excluded */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tour.included && (
              <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-2">
                <h3 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>প্যাকেজে যা অন্তর্ভুক্ত</span>
                </h3>
                <p className="text-xs text-emerald-800 whitespace-pre-line leading-relaxed">
                  {tour.included}
                </p>
              </div>
            )}

            {tour.excluded && (
              <div className="p-5 bg-rose-50/60 rounded-2xl border border-rose-100 space-y-2">
                <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-600" />
                  <span>প্যাকেজে অন্তর্ভুক্ত নয়</span>
                </h3>
                <p className="text-xs text-rose-800 whitespace-pre-line leading-relaxed">
                  {tour.excluded}
                </p>
              </div>
            )}
          </div>

          {/* Terms */}
          {tour.terms && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-600">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-slate-500" />
                <span>শর্তাবলী ও বুকিং পলিসি</span>
              </h3>
              <p className="whitespace-pre-line leading-relaxed">{tour.terms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
