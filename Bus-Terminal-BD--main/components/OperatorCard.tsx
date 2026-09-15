import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, Phone, Globe, ChevronRight } from 'lucide-react';
import { BusOperator } from '@/lib/supabase';

interface OperatorCardProps {
  operator: BusOperator;
}

export default function OperatorCard({ operator }: OperatorCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start gap-4">
          <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
            {operator.logo_url ? (
              <Image
                src={operator.logo_url}
                alt={operator.name}
                fill
                className="object-contain p-1"
                sizes="56px"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Building2 className="w-7 h-7 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
              {operator.name}
            </h3>
            {operator.phone && (
              <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono">{operator.phone}</span>
              </div>
            )}
          </div>
        </div>

        {operator.description && (
          <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
            {operator.description}
          </p>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        {operator.website ? (
          <a
            href={operator.website.startsWith('http') ? operator.website : `https://${operator.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>ওয়েবসাইট</span>
          </a>
        ) : (
          <span className="text-xs text-slate-400">ভেরিফায়েড অপারেটর</span>
        )}

        <Link
          href={`/operators/${operator.slug || operator.id}`}
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
        >
          <span>বাস ও রুটসমূহ</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
