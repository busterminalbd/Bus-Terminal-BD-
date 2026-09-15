import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, MessageSquare, ShieldCheck, HeartHandshake } from 'lucide-react';

export const metadata = {
  title: 'যোগাযোগ ও হেল্পডেস্ক | BUS TERMINAL BD',
  description: 'বাস টার্মিনাল বিডি হেল্পলাইন ও কাস্টমার সাপোর্ট। যেকোনো প্রশ্ন বা তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।'
};

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>২৪/৭ হেল্পডেস্ক সাপোর্ট</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          যোগাযোগ ও কাস্টমার সার্ভিস
        </h1>
        <p className="text-sm text-slate-500">
          বাসের সময়সূচি, টিকিট বুকিং, ভাড়ার বিবরণ বা যেকোনো তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন।
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phone */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">হটলাইন নম্বর</h3>
          <p className="text-xs text-slate-500">
            যেকোনো তথ্য ও জরুরি সহায়তার জন্য সরাসরি কল করুন।
          </p>
          <div className="pt-2 text-base font-black text-red-700 font-mono">
            <a href="tel:+8801700000000" className="hover:underline block">
              +880 1700-000000
            </a>
            <a href="tel:+8801800000000" className="hover:underline block text-xs text-slate-600 font-normal mt-1">
              +880 1800-000000
            </a>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">ইমেইল যোগাযোগ</h3>
          <p className="text-xs text-slate-500">
            অফিসিয়াল প্রশ্ন, মতামত বা ব্যবসায়িক যোগাযোগের জন্য লিখুন।
          </p>
          <div className="pt-2 text-sm font-bold text-sky-700 font-mono">
            <a href="mailto:support@busterminalbd.com" className="hover:underline block">
              support@busterminalbd.com
            </a>
            <a href="mailto:info@busterminalbd.com" className="hover:underline block text-xs text-slate-600 font-normal mt-1">
              info@busterminalbd.com
            </a>
          </div>
        </div>

        {/* Office */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">প্রধান কার্যালয়</h3>
          <p className="text-xs text-slate-500">
            সায়েদাবাদ বাস টার্মিনাল রোড, ঢাকা-১২০৪, বাংলাদেশ।
          </p>
          <div className="pt-2 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>সকাল ৮:০০ - রাত ১০:০০</span>
          </div>
        </div>
      </div>

      {/* Quick Booking Callout */}
      <div className="bg-linear-to-r from-red-600 to-red-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-black">অনলাইনে টিকিট বা গাড়ি বুকিং করতে চান?</h2>
          <p className="text-xs sm:text-sm text-red-100 max-w-xl">
            কোনো প্রকার ঝামেলা ছাড়াই ঘরে বসে পছন্দের বাসের সিট, মাইক্রোবাস অথবা ট্যুর প্যাকেজের বুকিং রিকোয়েস্ট পাঠান।
          </p>
        </div>
        <Link
          href="/booking"
          className="px-8 py-3.5 bg-white text-red-900 hover:bg-red-50 text-xs sm:text-sm font-black rounded-xl shadow-lg transition active:scale-95 shrink-0"
        >
          বুকিং অনুরোধ পাতা
        </Link>
      </div>
    </div>
  );
}
