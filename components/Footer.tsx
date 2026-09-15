import React from 'react';
import Link from 'next/link';
import { Bus, Mail, MapPin, ShieldCheck, Heart, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-red-600 to-red-800 text-red-50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/15">

          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white shadow-md">
                <Bus className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                BUS TERMINAL BD
              </span>
            </Link>
            <p className="text-red-100/90 text-sm leading-relaxed max-w-sm">
              বাংলাদেশের সকল জেলা, বাস রুট, অপারেটর, কাউন্টার এবং সময়সূচির নির্ভরযোগ্য অনলাইন ঠিকানা। ভ্রমণ হোক নিরাপদ ও স্বাচ্ছন্দ্যময়।
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-white font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Android Admin App দ্বারা লাইভ পরিচালিত ও হালনাগাদকৃত</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              প্রধান লিংক
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/buses" className="text-red-100/90 hover:text-white transition-colors">
                  বাস তালিকা
                </Link>
              </li>
              <li>
                <Link href="/operators" className="text-red-100/90 hover:text-white transition-colors">
                  বাস অপারেটর
                </Link>
              </li>
              <li>
                <Link href="/routes" className="text-red-100/90 hover:text-white transition-colors">
                  রুট ও সময়সূচি
                </Link>
              </li>
              <li>
                <Link href="/fares" className="text-red-100/90 hover:text-white transition-colors">
                  ভাড়ার তালিকা
                </Link>
              </li>
              <li>
                <Link href="/counters" className="text-red-100/90 hover:text-white transition-colors">
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
                <Link href="/mini-coaches" className="text-red-100/90 hover:text-white transition-colors">
                  মিনি কোচ রেন্টাল
                </Link>
              </li>
              <li>
                <Link href="/tours" className="text-red-100/90 hover:text-white transition-colors">
                  ট্যুর প্যাকেজ
                </Link>
              </li>
              <li>
                <Link href="/districts" className="text-red-100/90 hover:text-white transition-colors">
                  জেলাসমূহ
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-white font-semibold hover:text-red-100 transition-colors">
                  অনলাইন বুকিং অনুরোধ
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-red-100/90 hover:text-white transition-colors">
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
              <li className="flex items-start gap-2.5 text-red-100/90">
                <MapPin className="w-4 h-4 text-white mt-1 shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
              <li className="flex items-center gap-2.5 text-red-100/90">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <span>busterminalbd@gmail.com</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors border border-white/20"
                >
                  যোগাযোগ ফর্ম
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-red-100/80">
          <p>© {new Date().getFullYear()} BUS TERMINAL BD. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            তৈরি করা হয়েছে বাংলাদেশের সকল ভ্রমণপিপাসুদের জন্য
            <Heart className="w-3.5 h-3.5 text-white inline fill-white" />
          </p>
        </div>
      </div>
    </footer>
  );
}
