import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ 
  message = 'তথ্য লোড করা যায়নি। কিছুক্ষণ পরে আবার চেষ্টা করুন।', 
  onRetry 
}: ErrorMessageProps) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-slate-900 font-bold text-base mb-1">তথ্য লোড করতে সমস্যা হয়েছে</h3>
      <p className="text-slate-600 text-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-medium rounded-xl text-xs hover:bg-rose-700 transition shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>পুনরায় চেষ্টা করুন</span>
        </button>
      )}
    </div>
  );
}
