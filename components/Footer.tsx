import React from 'react';
import Link from 'next/link';
import { Bus, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Bus className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                BUS TERMINAL <span className="text-emerald-500">BD</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              বাংলাদেশের সকল জেলা, বাস রুট, অপারেটর, কাউন্টার এবং সময়সূচির নির্ভরযোগ্য অনলাইন ঠিকানা। ভ্রমণ হোক নিরাপদ ও স্বাচ্ছন্দ্যময়।
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Android Admin App দ্বারা লাইভ পরিচালিত ও হালনাগাদকৃত</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              প্রধান লিংক
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/buses" className="hover:text-emerald-400 transition-colors">
                  বাস তালিকা
                </Link>
              </li>
              <li>
                <Link href="/operators" className="hover:text-emerald-400 transition-colors">
                  বাস অপারেটর
                </Link>
              </li>
              <li>
                <Link href="/routes" className="hover:text-emerald-400 transition-colors">
                  রুট ও সময়সূচি
                </Link>
              </li>
              <li>
                <Link href="/fares" className="hover:text-emerald-400 transition-colors">
                  ভাড়ার তালিকা
                </Link>
              </li>
              <li>
                <Link href="/counters" className="hover:text-emerald-400 transition-colors">
                  কাউন্টার খুঁজুন
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              সেবাসমূহ
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/mini-coaches" className="hover:text-emerald-400 transition-colors">
                  মিনি কোচ রেন্টাল
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-emerald-400 transition-colors">
                  ট্যুর প্যাকেজ
                </Link>
              </li>
              <li>
                <Link href="/districts" className="hover:text-emerald-400 transition-colors">
                  জেলাসমূহ
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-emerald-400 transition-colors font-medium text-emerald-400">
                  অনলাইন বুকিং অনুরোধ
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  আমাদের সম্পর্কে
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              সহায়তা ও যোগাযোগ
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">busterminalbd@gmail.com</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors border border-slate-700"
                >
                  যোগাযোগ ফর্ম
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BUS TERMINAL BD. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            তৈরি করা হয়েছে বাংলাদেশের সকল ভ্রমণপিপাসুদের জন্য
            <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
