import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import MetaPixel from '@/components/MetaPixel';
export const metadata: Metadata = {
  title: 'BUS TERMINAL BD | বাংলাদেশের বাস ও ভ্রমণ তথ্যের সহজ ঠিকানা',
  description: 'বাংলাদেশের সকল বাস, অপারেটর, রুট, কাউন্টার নম্বর, ভাড়া তালিকা, মিনি কোচ ও ট্যুর প্যাকেজ বুকিং তথ্য।',
  openGraph: {
    title: 'BUS TERMINAL BD | বাংলাদেশের বাস ও ভ্রমণ তথ্যের সহজ ঠিকানা',
    description: 'বাংলাদেশের সকল বাস, অপারেটর, রুট, কাউন্টার নম্বর, ভাড়া তালিকা, মিনি কোচ ও ট্যুর প্যাকেজ বুকিং তথ্য।',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BUS TERMINAL BD | বাংলাদেশের বাস ও ভ্রমণ তথ্যের সহজ ঠিকানা',
    description: 'বাংলাদেশের সকল বাস, অপারেটর, রুট, কাউন্টার নম্বর, ভাড়া তালিকা, মিনি কোচ ও ট্যুর প্যাকেজ বুকিং তথ্য।',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans" suppressHydrationWarning>
        <MetaPixel />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
