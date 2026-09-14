import React from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function ConfigAlert() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-3 text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Supabase সংযোগ প্রয়োজন:</strong> আপনার Supabase URL ও Publishable Key সেট করতে Settings/Secrets প্যানেলে <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> ও <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> যোগ করুন।
          </span>
        </div>
        <span className="text-xs text-amber-800 font-medium">
          Android Admin App এর সাথে লাইভ সিংক্রোনাইজড
        </span>
      </div>
    </div>
  );
}
