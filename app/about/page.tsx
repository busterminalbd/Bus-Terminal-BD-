import React from 'react';
import Link from 'next/link';
import { Bus, ShieldCheck, Users, Target, HeartHandshake, Award } from 'lucide-react';

export const metadata = {
  title: 'আমাদের সম্পর্কে | BUS TERMINAL BD',
  description: 'BUS TERMINAL BD - বাংলাদেশের সমন্বিত বাস যোগাযোগ, সময়সূচি, কাউন্টার ও টিকিট সংক্রান্ত জাতীয় প্ল্যাটফর্ম।'
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold">
          <Bus className="w-3.5 h-3.5" />
          <span>জাতীয় বাস যোগাযোগ প্ল্যাটফর্ম</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          BUS TERMINAL BD সম্পর্কে
        </h1>
        <p className="text-sm text-slate-500">
          বাংলাদেশের বাস যাত্রীদের জন্য একটি নির্ভরযোগ্য, নির্ভুল ও আধুনিক তথ্যসেবা পোর্টাল।
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-12 shadow-xs space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>BUS TERMINAL BD</strong> বাংলাদেশের সকল জেলা ও আন্তঃজেলা রুটে চলাচলকারী বাসসমূহের সময়সূচি, সঠিক ভাড়ার তালিকা, সকল কাউন্টারের ফোন নম্বর এবং অনুমোদিত অপারেটরদের তথ্য এক ছাতার নিচে নিয়ে আসার একটি জাতীয় উদ্যোগ।
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              যাত্রীরা যেন ভ্রমণের পূর্বে নির্ভুল তথ্য পেতে পারেন, দালালের খপ্পর থেকে রেহাই পান এবং সহজে সময় বাঁচিয়ে তাদের কাঙ্ক্ষিত বাসের সাথে যোগাযোগ করতে পারেন — এটাই আমাদের মূল প্রত্যয়।
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-red-50 rounded-2xl border border-red-100 space-y-2">
              <ShieldCheck className="w-6 h-6 text-red-600" />
              <h3 className="font-bold text-slate-900 text-sm">যাচাইকৃত তথ্য</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                অ্যান্ড্রয়েড অ্যাডমিন প্যানেল থেকে সরাসরি হালনাগাদকৃত রিয়েল-টাইম ডাটা।
              </p>
            </div>
            <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100 space-y-2">
              <Users className="w-6 h-6 text-sky-600" />
              <h3 className="font-bold text-slate-900 text-sm">৬৪ জেলার নেটওয়ার্ক</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                দেশের প্রতিটি বিভাগের সকল প্রধান ও আঞ্চলিক রুটের বাস কাউন্টার তালিকা।
              </p>
            </div>
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
              <Target className="w-6 h-6 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">সহজ বুকিং সেবা</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                বাস টিকিট, পিকনিকের মিনি কোচ বা পর্যটন প্যাকেজ সরাসরি বুকিং অনুরোধ সুবিধা।
              </p>
            </div>
            <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
              <Award className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">কোনো ভুয়া তথ্য নয়</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                অফিসিয়াল পরিবহন সংস্থা কর্তৃক অনুমোদিত সঠিক ভাড়ার তালিকা ও ফোন নম্বর।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
