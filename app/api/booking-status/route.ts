import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে মোবাইল নম্বর প্রদান করুন।' },
        { status: 400 }
      );
    }

    const rawPhone = phone.trim();
    const digitsOnly = rawPhone.replace(/\D/g, '');

    if (digitsOnly.length < 10) {
      return NextResponse.json(
        { error: 'অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন (কমপক্ষে ১১ ডিজিট)।' },
        { status: 400 }
      );
    }

    // Standardize Bangladesh phone formats
    let phoneStandard = digitsOnly;
    if (digitsOnly.startsWith('8801') && digitsOnly.length >= 13) {
      phoneStandard = digitsOnly.substring(2);
    } else if (digitsOnly.startsWith('1') && digitsOnly.length === 10) {
      phoneStandard = '0' + digitsOnly;
    }

    const searchPhones = Array.from(
      new Set([
        rawPhone,
        phoneStandard,
        `+88${phoneStandard}`,
        `88${phoneStandard}`,
        phoneStandard.startsWith('0') ? phoneStandard.substring(1) : phoneStandard
      ])
    );

    // 1. Check if a secure Supabase Edge Function is deployed
    if (supabaseUrl && anonKey) {
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/booking-status`;
      try {
        const edgeRes = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`
          },
          body: JSON.stringify({ phone: phoneStandard, search_phones: searchPhones })
        });
        if (edgeRes.ok) {
          const edgeData = await edgeRes.json();
          const list = Array.isArray(edgeData) ? edgeData : (edgeData.bookings || []);
          return NextResponse.json({ bookings: list });
        }
      } catch {
        // Edge function not reachable, fallback to next server-side mechanism
      }
    }

    // 2. Server-side Supabase verification
    // Uses Service Role Key (securely held on server) or fallback to secure RPC
    const clientKey = serviceRoleKey || anonKey;
    if (supabaseUrl && clientKey) {
      const supabaseAdmin = createClient(supabaseUrl, clientKey, {
        auth: { persistSession: false }
      });

      // Try secure RPC function if created in Postgres (e.g. get_booking_status)
      try {
        const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_booking_status', {
          search_phone: phoneStandard
        });
        if (!rpcError && Array.isArray(rpcData)) {
          return NextResponse.json({ bookings: rpcData });
        }
      } catch {
        // RPC not defined, continue to table query
      }

      // Query bookings table using server-side client with exact phone match only
      // This strictly prevents exposing other customers' data
      const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(
          'id, booking_type, customer_name, travel_date, return_date, passengers, pickup_location, destination, vehicle_type, estimated_price, special_request, status, created_at'
        )
        .in('phone', searchPhones)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        return NextResponse.json({ bookings: data });
      }

      if (error && error.code === '42501') {
        // RLS blocks anonymous SELECT and service role key is not configured
        console.warn('Bookings SELECT blocked by RLS. Configure SUPABASE_SERVICE_ROLE_KEY or get_booking_status RPC.');
        return NextResponse.json({
          bookings: [],
          error: 'বুকিং স্ট্যাটাস সুরক্ষা সক্রিয়। আপনার বুকিং নিশ্চিতকরণের জন্য সরাসরি আমাদের হেল্পলাইনে কল করুন।'
        });
      }
    }

    return NextResponse.json({ bookings: [] });
  } catch (err) {
    console.error('Booking status server error:', err);
    return NextResponse.json(
      { error: 'বুকিং স্ট্যাটাস যাচাই করতে সমস্যা হয়েছে।' },
      { status: 500 }
    );
  }
}
