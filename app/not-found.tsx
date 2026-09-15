import Link from 'next/link';
import { Bus, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-16 h-16 bg-red-100 text-red-700 rounded-full flex items-center justify-center mx-auto">
          <Bus className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900">৪০৪</h1>
        <h2 className="text-xl font-bold text-slate-800">কাঙ্ক্ষিত পাতাটি খুঁজে পাওয়া যায়নি</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          আপনি যে রুট বা পেজে যাওয়ার চেষ্টা করছেন তা হয়তো সরানো হয়েছে বা মুছে ফেলা হয়েছে।
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>মূল পাতায় ফিরুন</span>
          </Link>
          <Link
            href="/buses"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            <span>বাস তালিকা</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
