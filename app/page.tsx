'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Search, 
  Route as RouteIcon, 
  Building2, 
  ShieldCheck, 
  Clock, 
  PhoneCall, 
  Compass, 
  Car, 
  ChevronRight, 
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { supabase, isSupabaseConfigured, District, Bus as BusType, BusOperator, Route, TourPackage, MiniCoach, safeQuery, logSupabaseError, attachDistrictsToRoutes, isMissingRelationshipError } from '@/lib/supabase';
import ConfigAlert from '@/components/ConfigAlert';
import BusCard from '@/components/BusCard';
import OperatorCard from '@/components/OperatorCard';
import RouteCard from '@/components/RouteCard';
import TourCard from '@/components/TourCard';
import MiniCoachCard from '@/components/MiniCoachCard';

export default function HomePage() {
  const router = useRouter();

  // Search state
  const [districts, setDistricts] = useState<District[]>([]);
  const [fromDistrictId, setFromDistrictId] = useState('');
  const [toDistrictId, setToDistrictId] = useState('');
  const [travelDate, setTravelDate] = useState('');

  // Data state
  const [popularRoutes, setPopularRoutes] = useState<Route[]>([]);
  const [operators, setOperators] = useState<BusOperator[]>([]);
  const [featuredBuses, setFeaturedBuses] = useState<BusType[]>([]);
  const [miniCoaches, setMiniCoaches] = useState<MiniCoach[]>([]);
  const [tourPackages, setTourPackages] = useState<TourPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadHomeData() {
      try {
        // Fetch active districts for search dropdowns
        const { data: districtsData } = await safeQuery<District[]>((col) => {
          let q = supabase.from('districts').select('id, name, division, slug');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });

        if (!ignore && districtsData) setDistricts(districtsData);

        // Fetch active routes with district names
        const { data: routesData, error: routesError } = await safeQuery<Route[]>((col) => {
          let q = supabase
            .from('routes')
            .select(`
              id,
              from_district_id,
              to_district_id,
              distance_km,
              estimated_duration,
              description,
              from_district:districts!routes_from_district_id_fkey(id, name),
              to_district:districts!routes_to_district_id_fkey(id, name)
            `);
          if (col) q = q.eq(col, true);
          return q.limit(6);
        });

        if (routesError && isMissingRelationshipError(routesError)) {
          logSupabaseError('Home routes load error (district join failed, retrying without join):', routesError);
          const fallback = await safeQuery<Route[]>((col) => {
            let q = supabase
              .from('routes')
              .select('id, from_district_id, to_district_id, distance_km, estimated_duration, description');
            if (col) q = q.eq(col, true);
            return q.limit(6);
          });
          if (!ignore && fallback.data) {
            const withDistricts = await attachDistrictsToRoutes(fallback.data as Route[]);
            setPopularRoutes(withDistricts as unknown as Route[]);
          }
        } else if (!ignore && routesData) {
          setPopularRoutes(routesData as unknown as Route[]);
        }

        // Fetch bus operators
        const { data: operatorsData } = await safeQuery<BusOperator[]>((col) => {
          let q = supabase
            .from('bus_operators')
            .select('id, name, slug, logo_url, description, phone, website, facebook_url');
          if (col) q = q.eq(col, true);
          return q.limit(8);
        });

        if (!ignore && operatorsData) setOperators(operatorsData);

        // Fetch featured buses with operator joined
        const { data: busesData } = await safeQuery<BusType[]>((col) => {
          let q = supabase
            .from('buses')
            .select(`
              id,
              operator_id,
              name,
              slug,
              category,
              bus_type,
              description,
              image_url,
              phone,
              is_ac,
              seat_count,
              bus_operators(id, name, slug, logo_url)
            `);
          if (col) q = q.eq(col, true);
          return q.limit(6);
        });

        if (!ignore && busesData) setFeaturedBuses(busesData as unknown as BusType[]);

        // Fetch mini coaches
        const { data: miniCoachData } = await safeQuery<MiniCoach[]>((col) => {
          let q = supabase.from('mini_coaches').select('*');
          if (col) q = q.eq(col, true);
          return q.limit(3);
        });

        if (!ignore && miniCoachData) setMiniCoaches(miniCoachData);

        // Fetch tour packages
        const { data: toursData } = await safeQuery<TourPackage[]>((col) => {
          let q = supabase.from('tour_packages').select('*');
          if (col) q = q.eq(col, true);
          return q.limit(3);
        });

        if (!ignore && toursData) setTourPackages(toursData);

      } catch (err) {
        logSupabaseError('Home data load error:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadHomeData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromDistrictId) params.set('from', fromDistrictId);
    if (toDistrictId) params.set('to', toDistrictId);
    if (travelDate) params.set('date', travelDate);
    router.push(`/routes?${params.toString()}`);
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      <ConfigAlert />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50 via-rose-50/60 to-white pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Decorative skyline strip */}
        <div className="absolute inset-x-0 bottom-0 h-24 sm:h-32 opacity-70 pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0 160 V90 h30 V60 h20 V90 h40 V40 h20 V90 h50 V70 h30 V90 h60 V50 h20 V90 h70 V30 h25 V90 h55 V65 h35 V90 h60 V45 h20 V90 h80 V75 h30 V90 h90 V55 h20 V90 h70 V35 h25 V90 h60 V90 H0Z" fill="#EF4444" fillOpacity="0.08" />
          </svg>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-red-200 text-red-600 text-xs sm:text-sm font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>লাইভ বাস ডাটাবেস ও অনলাইন বুকিং সিস্টেম</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            আপনার <span className="text-red-600">পারফেক্ট যাত্রা</span> খুঁজুন
          </h1>

          <p className="text-sm sm:text-lg text-slate-500 max-w-2xl mx-auto font-normal leading-relaxed">
            &quot;বাংলাদেশের বাস ও ভ্রমণ তথ্যের সহজ ঠিকানা&quot; — অনলাইনে বাস খুঁজুন এবং বুকিং করুন
          </p>

          {/* Search Box */}
          <div className="pt-2 max-w-3xl mx-auto text-left">
            <form
              onSubmit={handleSearch}
              className="bg-white p-4 sm:p-6 rounded-3xl shadow-xl shadow-red-900/5 text-slate-900 border-2 border-red-500 space-y-4"
            >
              {/* From */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <MapPin className="w-5 h-5 text-red-600 shrink-0" />
                <select
                  value={fromDistrictId}
                  onChange={(e) => setFromDistrictId(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium focus:outline-hidden"
                >
                  <option value="">কোথা থেকে (Select From)</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.division ? `(${d.division})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {/* To */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <RouteIcon className="w-5 h-5 text-red-600 shrink-0" />
                <select
                  value={toDistrictId}
                  onChange={(e) => setToDistrictId(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium focus:outline-hidden"
                >
                  <option value="">কোথায় যাবেন (Select To)</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.division ? `(${d.division})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </div>

              {/* Date */}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Calendar className="w-5 h-5 text-red-600 shrink-0" />
                <input
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-12 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-sm uppercase tracking-wide shadow-md shadow-red-600/30 transition-all active:scale-[0.98]"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4 text-xs text-slate-400">
              <span className="font-semibold text-slate-500">জনপ্রিয় রুট:</span>
              <Link href="/routes" className="hover:text-red-600 underline underline-offset-4">
                ঢাকা ➔ চট্টগ্রাম
              </Link>
              <span>•</span>
              <Link href="/routes" className="hover:text-red-600 underline underline-offset-4">
                ঢাকা ➔ কক্সবাজার
              </Link>
              <span>•</span>
              <Link href="/routes" className="hover:text-red-600 underline underline-offset-4">
                ঢাকা ➔ সিলেট
              </Link>
              <span>•</span>
              <Link href="/routes" className="hover:text-red-600 underline underline-offset-4">
                ঢাকা ➔ রাজশাহী
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-step process */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            মাত্র <span className="text-red-600">৩ ধাপে</span> বুকিং করুন
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            সহজ ও দ্রুত পদ্ধতিতে আপনার যাত্রার বাস খুঁজে বুকিং অনুরোধ পাঠান
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {[
            { icon: Search, title: 'বাস খুঁজুন', desc: 'যাত্রার স্থান, গন্তব্য ও তারিখ দিয়ে উপযুক্ত বাস খুঁজে বের করুন।' },
            { icon: Bus, title: 'বাস নির্বাচন করুন', desc: 'সময়সূচি, ভাড়া ও সুবিধা দেখে পছন্দের বাস বেছে নিন।' },
            { icon: CheckCircle2, title: 'বুকিং অনুরোধ পাঠান', desc: 'নাম ও ফোন নম্বর দিয়ে অনুরোধ পাঠান, আমরা যোগাযোগ করব।' },
          ].map((step, i) => {
            const StepIcon = step.icon;
            return (
              <div key={i} className="text-center">
                <div className="relative w-20 h-20 mx-auto rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
                  <StepIcon className="w-8 h-8 text-red-600" />
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed max-w-[220px] mx-auto">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 1: Popular Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">জনপ্রিয় রুটসমূহ</h2>
            <p className="text-sm text-slate-500 mt-1">নিয়মিত চলাচলকারী প্রধান জেলাসমূহের বাস রুট</p>
          </div>
          <Link
            href="/routes"
            className="text-xs sm:text-sm font-bold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
          >
            <span>সব রুট দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {popularRoutes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            {loading ? 'রুট লোড হচ্ছে...' : 'শীঘ্রই রুট তালিকা প্রকাশিত হবে।'}
          </div>
        )}
      </section>

      {/* Section 2: Bus Operators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">বাস অপারেটর</h2>
            <p className="text-sm text-slate-500 mt-1">দেশের শীর্ষস্থানীয় ও বিশ্বস্ত পরিবহন কোম্পানিগুলো</p>
          </div>
          <Link
            href="/operators"
            className="text-xs sm:text-sm font-bold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
          >
            <span>সকল অপারেটর</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {operators.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {operators.map((op) => (
              <OperatorCard key={op.id} operator={op} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            {loading ? 'অপারেটর লোড হচ্ছে...' : 'কোনো অপারেটর সংরক্ষিত নেই।'}
          </div>
        )}
      </section>

      {/* Section 3: Featured Buses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">বাস তালিকা ও সেবা</h2>
            <p className="text-sm text-slate-500 mt-1">প্রিমিয়াম এসি ও নন-এসি স্লিপার/হায়ার ক্লাস বাস</p>
          </div>
          <Link
            href="/buses"
            className="text-xs sm:text-sm font-bold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
          >
            <span>সকল বাস দেখুন</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredBuses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBuses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            {loading ? 'বাসের তথ্য লোড হচ্ছে...' : 'বাসের তথ্য শীঘ্রই যুক্ত করা হবে।'}
          </div>
        )}
      </section>

      {/* Section 4: Mini Coach Rental */}
      <section className="bg-red-900/5 py-12 border-y border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">রেন্টাল সেবা</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">মিনি কোচ ও মাইক্রোবাস ভাড়া</h2>
              <p className="text-sm text-slate-500 mt-0.5">পারিবারিক বা অফিস ট্যুরের জন্য সুবিধাজনক বাহন</p>
            </div>
            <Link
              href="/mini-coaches"
              className="text-xs sm:text-sm font-bold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
            >
              <span>সকল মিনি কোচ</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {miniCoaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {miniCoaches.map((coach) => (
                <MiniCoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              {loading ? 'মিনি কোচের তথ্য লোড হচ্ছে...' : 'মিনি কোচের তালিকা প্রস্তুত হচ্ছে।'}
            </div>
          )}
        </div>
      </section>

      {/* Section 5: Tour Packages */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">ভ্রমণ ও পর্যটন</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">ট্যুর প্যাকেজ</h2>
            <p className="text-sm text-slate-500 mt-0.5">কক্সবাজার, সাজেক, সুন্দরবন সহ সব জনপ্রিয় পর্যটন স্পট</p>
          </div>
          <Link
            href="/tours"
            className="text-xs sm:text-sm font-bold text-red-700 hover:text-red-800 inline-flex items-center gap-1"
          >
            <span>সকল প্যাকেজ</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {tourPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tourPackages.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
            {loading ? 'ট্যুর প্যাকেজ লোড হচ্ছে...' : 'নতুন ট্যুর প্যাকেজ শীঘ্রই আসছে।'}
          </div>
        )}
      </section>

      {/* Section 6: Why Bus Terminal BD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-red-600 uppercase tracking-wider">আমাদের সুবিধা</span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            কেন বাস টার্মিনাল বিডি ব্যবহার করবেন?
          </h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            যাত্রীদের হয়রানিমুক্ত সেবা এবং সঠিক তথ্য নিশ্চিত করতে আমরা প্রতিশ্রুতিবদ্ধ।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: ShieldCheck, title: 'নির্ভরযোগ্য তথ্য', desc: 'অপারেটরদের অনুমোদিত সঠিক তথ্য ও কাউন্টার লোকেশন সরাসরি সরবরাহ করা হয়।' },
            { icon: Clock, title: 'রিয়েল-টাইম আপডেট', desc: 'Android Admin App থেকে নিয়মিত হালনাগাদকৃত ভাড়া ও সময়সূচি দেখা যায়।' },
            { icon: RouteIcon, title: 'সমগ্র বাংলাদেশ', desc: '৬৪ জেলার আন্তঃজেলা এবং আঞ্চলিক সকল রুটের সংযোগ ও কাউন্টার ঠিকানা।' },
            { icon: PhoneCall, title: 'সহজ যোগাযোগ', desc: 'সরাসরি কাউন্টারে ফোন করুন অথবা অনলাইনে বুকিং অনুরোধ পাঠিয়ে আসন নিশ্চিত করুন।' },
          ].map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-xs hover:shadow-md transition-shadow">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                  <ItemIcon className="w-7 h-7" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">{item.title}</h3>
                <div className="w-10 h-0.5 bg-slate-200 mx-auto my-3" />
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 7: Booking CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg shadow-red-700/20">
          <div className="max-w-xl space-y-3 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-black">
              বাস, মিনি কোচ বা ট্যুর বুকিং করতে চান?
            </h2>
            <p className="text-sm text-red-100 leading-relaxed">
              কোনো অ্যাকাউন্ট খোলার ঝামেলা নেই! শুধুমাত্র নাম ও মোবাইল নম্বর দিয়ে মুহূর্তেই অনুরোধ পাঠিয়ে দিন।
            </p>
          </div>
          <Link
            href="/booking"
            className="px-8 py-3.5 bg-white text-red-900 hover:bg-red-50 font-black rounded-2xl text-sm shadow-md transition-all active:scale-95 shrink-0"
          >
            অনলাইন বুকিং ফর্ম
          </Link>
        </div>
      </section>

      {/* Section 8: Contact Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">সহায়তা কেন্দ্র</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                আপনার কোনো জিজ্ঞাসা আছে?
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                বাস টার্মিনাল বিডি সম্পর্কিত যেকোনো মতামত, কাউন্টার তথ্য সংশোধন বা পার্টনারশিপের জন্য আমাদের সাথে যোগাযোগ করতে পারেন।
              </p>

              <div className="mt-6 space-y-3 text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>ভেরিফায়েড কাউন্টার ও এজেন্টদের অফিসিয়াল যোগাযোগ নম্বর</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>লাইভ ডাটাবেস ভিত্তিক সঠিক ভাড়া ও শিডিউল নিশ্চিতকরণ</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition"
                >
                  <span>যোগাযোগ পাতা দেখুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-slate-900">জরুরি নির্দেশনা</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ভ্রমণের আগে টিকিট সংগ্রহের জন্য সংশ্লিষ্ট বাসের কাউন্টারে ফোন দিয়ে বুকিং নিশ্চিত করার অনুরোধ করা হচ্ছে। ঈদের সময় বা ছুটির দিনে ভাড়ার তালিকা কিছুটা পরিবর্তনশীল হতে পারে।
              </p>
              <div className="pt-2">
                <Link
                  href="/counters"
                  className="text-xs font-bold text-red-700 hover:text-red-800 flex items-center gap-1"
                >
                  <span>নিকটস্থ বাস কাউন্টার খুঁজুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
