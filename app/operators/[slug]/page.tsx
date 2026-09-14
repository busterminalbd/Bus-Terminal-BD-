'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Phone, 
  Globe, 
  Facebook, 
  Bus, 
  ArrowLeft, 
  ShieldCheck, 
  Route as RouteIcon 
} from 'lucide-react';
import { supabase, BusOperator, Bus as BusType, safeQuery } from '@/lib/supabase';
import BusCard from '@/components/BusCard';
import ErrorMessage from '@/components/ErrorMessage';
import EmptyState from '@/components/EmptyState';

export default function OperatorDetailPage() {
  const params = useParams();
  const slugParam = params?.slug as string;

  const [operator, setOperator] = useState<BusOperator | null>(null);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadOperatorDetails() {
      if (!slugParam) return;
      try {
        setLoading(true);
        setError(null);

        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugParam);

        // Try searching by slug or by id with safeQuery
        const { data: opData, error: opError } = await safeQuery<BusOperator>((col) => {
          let query = supabase.from('bus_operators').select('*');
          if (col) query = query.eq(col, true);
          if (isUUID) {
            query = query.eq('id', slugParam);
          } else {
            query = query.eq('slug', slugParam);
          }
          return query.single();
        });

        if (ignore) return;
        if (opError) throw opError;
        setOperator(opData);

        if (opData) {
          // Fetch buses operated by this operator
          const { data: busData } = await safeQuery<BusType[]>((col) => {
            let q = supabase
              .from('buses')
              .select('*')
              .eq('operator_id', opData.id);
            if (col) q = q.eq(col, true);
            return q;
          });

          if (!ignore && busData) {
            // attach operator to buses for BusCard rendering
            const enriched = busData.map((b) => ({
              ...b,
              bus_operators: opData
            }));
            setBuses(enriched as unknown as BusType[]);
          }
        }
      } catch (err) {
        console.error('Operator detail fetch error:', err);
        if (!ignore) setError('অপারেটরের তথ্য লোড করা সম্ভব হয়নি।');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadOperatorDetails();
    return () => {
      ignore = true;
    };
  }, [slugParam]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !operator) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ErrorMessage message={error || 'অপারেটরটি পাওয়া যায়নি।'} />
        <div className="text-center mt-4">
          <Link href="/operators" className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>অপারেটর তালিকায় ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Breadcrumb / Back */}
      <div>
        <Link
          href="/operators"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>সকল অপারেটর</span>
        </Link>
      </div>

      {/* Operator Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {operator.logo_url ? (
              <Image
                src={operator.logo_url}
                alt={operator.name}
                fill
                className="object-contain p-2"
                sizes="112px"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Building2 className="w-12 h-12 text-slate-400" />
            )}
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {operator.name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>অনুমোদিত পরিবহন</span>
              </span>
            </div>

            {operator.description && (
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {operator.description}
              </p>
            )}

            {/* Contact chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-600">
              {operator.phone && (
                <a
                  href={`tel:${operator.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono">{operator.phone}</span>
                </a>
              )}
              {operator.website && (
                <a
                  href={operator.website.startsWith('http') ? operator.website : `https://${operator.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>ওয়েবসাইট ভিজিট করুন</span>
                </a>
              )}
              {operator.facebook_url && (
                <a
                  href={operator.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg transition"
                >
                  <Facebook className="w-3.5 h-3.5 text-sky-600" />
                  <span>ফেসবুক পেজ</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buses operated */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {operator.name} এর সক্রিয় বাসসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              এই অপারেটরের সকল এসি ও নন-এসি ক্যাটাগরির বাস
            </p>
          </div>
          <Link
            href={`/booking?type=bus`}
            className="text-xs font-bold px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
          >
            বুকিং অনুরোধ
          </Link>
        </div>

        {buses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {buses.map((bus) => (
              <BusCard key={bus.id} bus={bus} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="কোনো বাস তালিকাভুক্ত নেই"
            description="এই অপারেটরের অধীনে বর্তমানে কোনো সক্রিয় বাস ডাটাবেসে পাওয়া যায়নি।"
          />
        )}
      </div>
    </div>
  );
}
