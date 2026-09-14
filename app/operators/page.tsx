'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Search } from 'lucide-react';
import { supabase, BusOperator, safeQuery } from '@/lib/supabase';
import OperatorCard from '@/components/OperatorCard';
import EmptyState from '@/components/EmptyState';
import ErrorMessage from '@/components/ErrorMessage';

export default function OperatorsPage() {
  const [operators, setOperators] = useState<BusOperator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function loadOperators() {
      try {
        const { data, error: sbError } = await safeQuery<BusOperator[]>((col) => {
          let q = supabase.from('bus_operators').select('*');
          if (col) q = q.eq(col, true);
          return q.order('name');
        });

        if (ignore) return;
        if (sbError) throw sbError;
        setOperators(data || []);
      } catch (err: unknown) {
        console.error('Failed to load operators:', err);
        if (!ignore) setError('বাস অপারেটরদের তালিকা লোড করা সম্ভব হয়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOperators();
    return () => {
      ignore = true;
    };
  }, [retryCount]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  const filtered = operators.filter((op) =>
    op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (op.description && op.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Building2 className="w-4 h-4" />
          <span>পরিবহন সংস্থা</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          বাস অপারেটরসমূহ
        </h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl">
          বাংলাদেশের বিভিন্ন রুটে চলাচলকারী অনুমোদিত ও নির্ভরযোগ্য সকল বাস কোম্পানির তালিকা ও যোগাযোগের তথ্য।
        </p>

        {/* Search bar */}
        <div className="mt-6 max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="অপারেটরের নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden shadow-2xs"
          />
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="কোনো অপারেটর পাওয়া যায়নি"
          description={searchQuery ? `"${searchQuery}" এর সাথে মিলে এমন কোনো অপারেটর নেই।` : 'বর্তমানে কোনো সক্রিয় বাস অপারেটর সংরক্ষিত নেই।'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((op) => (
            <OperatorCard key={op.id} operator={op} />
          ))}
        </div>
      )}
    </div>
  );
}
