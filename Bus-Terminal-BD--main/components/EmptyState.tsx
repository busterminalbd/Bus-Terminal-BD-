import React from 'react';
import Link from 'next/link';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = 'কোনো তথ্য পাওয়া যায়নি',
  description = 'বর্তমানে এই বিভাগে কোনো তথ্য সংরক্ষিত নেই অথবা ফিল্টারের সাথে মেলেনি।',
  actionText,
  actionHref
}: EmptyStateProps) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
        <SearchX className="w-7 h-7" />
      </div>
      <h3 className="text-slate-900 font-bold text-base mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{description}</p>
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-xs hover:bg-emerald-700 transition shadow-sm"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
}
