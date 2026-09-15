'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Bus, 
  Car, 
  Compass, 
  Search,
  Clock
} from 'lucide-react';
import { supabase, Booking, Bus as BusType, MiniCoach, TourPackage, safeQuery, logSupabaseError } from '@/lib/supabase';
import ErrorMessage from '@/components/ErrorMessage';
import { trackMetaEvent } from '@/lib/metaPixelEvents';

function BookingFormContent() {
  const searchParams = useSearchParams();
  const preType = (searchParams.get('type') as 'bus' | 'mini_coach' | 'tour_package') || 'bus';
  const preBusId = searchParams.get('bus_id') || '';
  const preMiniCoachId = searchParams.get('mini_coach_id') || '';
  const preTourId = searchParams.get('tour_package_id') || '';
  const preName = searchParams.get('name') || '';
  const preFrom = searchParams.get('from') || '';
  const preTo = searchParams.get('to') || searchParams.get('destination') || '';

  // Active tab: 'create' or 'status'
  const [activeTab, setActiveTab] = useState<'create' | 'status'>('create');

  // Form states
  const [bookingType, setBookingType] = useState<'bus' | 'mini_coach' | 'tour_package'>(
    ['bus', 'mini_coach', 'tour_package'].includes(preType) ? preType : 'bus'
  );
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [seatCount, setSeatCount] = useState(1);
  const [pickupLocation, setPickupLocation] = useState(preFrom);
  const [dropoffLocation, setDropoffLocation] = useState(preTo);
  const [notes, setNotes] = useState(preName ? `নির্বাচিত: ${preName}` : '');
  const [busId, setBusId] = useState(preBusId);
  const [miniCoachId, setMiniCoachId] = useState(preMiniCoachId);
  const [tourPackageId, setTourPackageId] = useState(preTourId);

  // Lists for dropdown selection
  const [buses, setBuses] = useState<BusType[]>([]);
  const [miniCoaches, setMiniCoaches] = useState<MiniCoach[]>([]);
  const [tours, setTours] = useState<TourPackage[]>([]);

  // Submission status
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Status check states
  const [searchPhone, setSearchPhone] = useState('');
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadSelectOptions() {
      // Buses
      const { data: bData } = await safeQuery<BusType[]>((col) => {
        let q = supabase.from('buses').select('id, name, is_ac');
        if (col) q = q.eq(col, true);
        return q;
      });
      if (!ignore && bData) setBuses(bData);

      // Mini coaches
      const { data: mData } = await safeQuery<MiniCoach[]>((col) => {
        let q = supabase.from('mini_coaches').select('id, name, is_ac');
        if (col) q = q.eq(col, true);
        return q;
      });
      if (!ignore && mData) setMiniCoaches(mData);

      // Tour packages
      const { data: tData } = await safeQuery<TourPackage[]>((col) => {
        let q = supabase.from('tour_packages').select('id, title, destination');
        if (col) q = q.eq(col, true);
        return q;
      });
      if (!ignore && tData) setTours(tData);
    }
    loadSelectOptions();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    trackMetaEvent('InitiateCheckout', {
      content_type: 'booking',
      booking_type: bookingType,
    });
  }, [bookingType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!userName.trim()) {
      setSubmitError('অনুগ্রহ করে আপনার পুরো নাম লিখুন।');
      return;
    }
    if (!userPhone.trim() || userPhone.trim().length < 11) {
      setSubmitError('অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন (কমপক্ষে ১১ ডিজিট)।');
      return;
    }
    if (!journeyDate) {
      setSubmitError('অনুগ্রহ করে যাত্রার তারিখ নির্বাচন করুন।');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        booking_type: bookingType,
        customer_name: userName.trim(),
        phone: userPhone.trim(),
        email: userEmail.trim() || null,
        travel_date: journeyDate,
        passengers: Number(seatCount) || 1,
        pickup_location: pickupLocation.trim() || null,
        destination: dropoffLocation.trim() || null,
        special_request: notes.trim() || null,
        bus_id: bookingType === 'bus' && busId ? busId : null,
        mini_coach_id: bookingType === 'mini_coach' && miniCoachId ? miniCoachId : null,
        tour_package_id: bookingType === 'tour_package' && tourPackageId ? tourPackageId : null,
        status: 'pending'
      };

      const { error: insertError } = await supabase.from('bookings').insert([payload]);
      if (insertError) throw insertError;

      trackMetaEvent('Lead', {
        content_name: 'Bus Terminal BD Booking',
        content_type: 'booking',
        booking_type: bookingType,
      });

      setSubmitSuccess(true);
    } catch (err: unknown) {
      logSupabaseError('Booking submission error:', err);
      setSubmitError('বুকিং অনুরোধ পাঠাতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি হটলাইনে যোগাযোগ করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPhone.trim()) return;

    try {
      setCheckingStatus(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .ilike('phone', `%${searchPhone.trim()}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyBookings(data || []);
      setStatusChecked(true);
    } catch (err) {
      logSupabaseError('Status check error:', err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">নিশ্চিত হয়েছে (Confirmed)</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">বাতিল হয়েছে (Cancelled)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">অপেক্ষমান (Pending)</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Calendar className="w-3.5 h-3.5" />
          <span>অনলাইন বুকিং পোর্টাল</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          টিকেট ও সিট বুকিং অনুরোধ
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          আপনার পছন্দসই বাস, মিনি কোচ বা ট্যুর প্যাকেজের আসন বুকিংয়ের জন্য নিচের ফর্মটি পূরণ করুন। আমাদের প্রতিনিধি দ্রুত যোগাযোগ করবে।
        </p>

        {/* Tab switch */}
        <div className="flex justify-center pt-4">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'create' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              নতুন বুকিং করুন
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'status' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              বুকিং স্ট্যাটাস চেক করুন
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'status' ? (
        /* Status Checker View */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-6">
          <form onSubmit={handleCheckStatus} className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              আপনার মোবাইল নম্বর দিয়ে বুকিং স্ট্যাটাস দেখুন
            </h2>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="উদাহরণ: 01712345678"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
              <button
                type="submit"
                disabled={checkingStatus}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition"
              >
                {checkingStatus ? 'যাচাই করা হচ্ছে...' : 'খুঁজুন'}
              </button>
            </div>
          </form>

          {statusChecked && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-700">ফলাফল ({myBookings.length})</h3>
              {myBookings.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                  এই নম্বরে কোনো বুকিং অনুরোধ পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {myBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{b.customer_name}</span>
                        {getStatusBadge(b.status)}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 block">ধরন</span>
                          <span className="font-semibold uppercase">{b.booking_type}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">যাত্রার তারিখ</span>
                          <span className="font-semibold">{b.travel_date}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">আসন সংখ্যা</span>
                          <span className="font-semibold">{b.passengers} টি</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">রুট / গন্তব্য</span>
                          <span className="font-semibold">{b.destination || '-'}</span>
                        </div>
                      </div>
                      {b.special_request && (
                        <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                          মন্তব্য: {b.special_request}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : submitSuccess ? (
        /* Success Screen */
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            আপনার বুকিং অনুরোধ সফলভাবে জমা হয়েছে!
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            ধন্যবাদ <strong>{userName}</strong>! আপনার বুকিং অনুরোধটি সিস্টেমে সংরক্ষিত হয়েছে। আমাদের হেল্পডেস্ক টিম শীঘ্রই আপনার দেওয়া ফোন নম্বরে (<strong>{userPhone}</strong>) কল করে সিট কনফার্ম করবে।
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitSuccess(false);
                setUserName('');
                setUserPhone('');
                setUserEmail('');
                setJourneyDate('');
                setNotes('');
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              আরেকটি বুকিং করুন
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchPhone(userPhone);
                setActiveTab('status');
                setSubmitSuccess(false);
              }}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              স্ট্যাটাস চেক করুন
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
          {submitError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Type Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                বুকিং এর ধরন নির্বাচন করুন
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBookingType('bus')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    bookingType === 'bus'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Bus className="w-5 h-5" />
                  <span className="text-xs">বাস টিকেট</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('mini_coach')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    bookingType === 'mini_coach'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Car className="w-5 h-5" />
                  <span className="text-xs">মিনি কোচ রেন্টাল</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingType('tour_package')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                    bookingType === 'tour_package'
                      ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Compass className="w-5 h-5" />
                  <span className="text-xs">ট্যুর প্যাকেজ</span>
                </button>
              </div>
            </div>

            {/* Specific Service Dropdowns */}
            {bookingType === 'bus' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  নির্দিষ্ট বাস (ঐচ্ছিক)
                </label>
                <select
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">কোনো নির্দিষ্ট বাস নেই (পরবর্তীতে নির্ধারিত হবে)</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.is_ac ? 'AC' : 'Non-AC'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {bookingType === 'mini_coach' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মিনি কোচ নির্বাচন করুন (ঐচ্ছিক)
                </label>
                <select
                  value={miniCoachId}
                  onChange={(e) => setMiniCoachId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">উপলব্ধ যেকোনো মিনি কোচ</option>
                  {miniCoaches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.is_ac ? 'AC' : 'Non-AC'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {bookingType === 'tour_package' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ট্যুর প্যাকেজ নির্বাচন করুন (ঐচ্ছিক)
                </label>
                <select
                  value={tourPackageId}
                  onChange={(e) => setTourPackageId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="">প্যাকেজ নির্বাচন করুন</option>
                  {tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} - {t.destination}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="পুরো নাম"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="01XXXXXXXXX"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ইমেইল (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যাত্রার তারিখ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={journeyDate}
                    onChange={(e) => setJourneyDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Travel Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  আসন সংখ্যা
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={seatCount}
                    onChange={(e) => setSeatCount(parseInt(e.target.value) || 1)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  যাত্রার স্থান (Pickup)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="কোথা থেকে উঠবেন"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  গন্তব্য স্থান (Dropoff)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="কোথায় নামবেন"
                    value={dropoffLocation}
                    onChange={(e) => setDropoffLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                বিশেষ অনুরোধ বা মন্তব্য (ঐচ্ছিক)
              </label>
              <textarea
                rows={3}
                placeholder="যেমন: সামনের সারির আসন দরকার, বা কোনো নির্দিষ্ট সময়সূচি..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition disabled:opacity-50"
              >
                {submitting ? 'অনুরোধ পাঠানো হচ্ছে...' : 'বুকিং অনুরোধ জমা দিন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="h-96 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  );
}
