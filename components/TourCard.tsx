import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Calendar, Users, ChevronRight, Phone } from 'lucide-react';
import { TourPackage } from '@/lib/supabase';

interface TourCardProps {
  tour: TourPackage;
}

export default function TourCard({ tour }: TourCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Image
          src={tour.image_url || fallbackImage}
          alt={tour.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          referrerPolicy="no-referrer"
        />
        {tour.price_per_person && (
          <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-xs font-bold shadow-md">
            ৳ {tour.price_per_person} <span className="text-[10px] font-normal text-slate-300">/ জন</span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 mb-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{tour.destination}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-red-700 transition-colors line-clamp-1">
            {tour.title}
          </h3>

          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500">
            {(tour.duration_days || tour.duration_nights) && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{tour.duration_days || 0} দিন / {tour.duration_nights || 0} রাত</span>
              </div>
            )}
            {tour.minimum_people && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>সর্বনিম্ন {tour.minimum_people} জন</span>
              </div>
            )}
          </div>

          {tour.description && (
            <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
              {tour.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Link
            href={`/tours/${tour.slug || tour.id}`}
            className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
          >
            <span>প্যাকেজ বিবরণ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/booking?type=tour&tour_package_id=${tour.id}&title=${encodeURIComponent(tour.title)}`}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition"
          >
            বুকিং অনুরোধ
          </Link>
        </div>
      </div>
    </div>
  );
}
