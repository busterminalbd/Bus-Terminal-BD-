import { createClient } from '@supabase/supabase-js';

export interface District {
  id: string;
  name: string;
  division?: string | null;
  slug?: string | null;
  is_active?: boolean;
  active?: boolean;
}

export interface BusOperator {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  phone?: string | null;
  website?: string | null;
  facebook_url?: string | null;
  is_active?: boolean;
  active?: boolean;
}

export interface Bus {
  id: string;
  operator_id: string;
  name: string;
  slug: string;
  category?: string | null;
  bus_type?: string | null;
  description?: string | null;
  image_url?: string | null;
  phone?: string | null;
  is_ac: boolean;
  seat_count?: number | null;
  is_active?: boolean;
  active?: boolean;
  // joined relation
  bus_operators?: BusOperator | null;
}

export interface Route {
  id: string;
  from_district_id: string;
  to_district_id: string;
  distance_km?: number | null;
  estimated_duration?: string | null;
  description?: string | null;
  is_active?: boolean;
  active?: boolean;
  // joined relations
  from_district?: District | null;
  to_district?: District | null;
}

export interface BusRoute {
  id: string;
  bus_id: string;
  route_id: string;
  departure_time?: string | null;
  arrival_time?: string | null;
  fare?: number | null;
  boarding_point?: string | null;
  dropping_point?: string | null;
  service_days?: string | string[] | null;
  is_active?: boolean;
  active?: boolean;
  // joined relations
  buses?: Bus | null;
  routes?: Route | null;
}

export interface Counter {
  id: string;
  bus_id?: string | null;
  district_id?: string | null;
  counter_name: string;
  address?: string | null;
  phone?: string | null;
  alternate_phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  is_active?: boolean;
  active?: boolean;
  // joined relations
  buses?: Bus | null;
  districts?: District | null;
}

export interface Fare {
  id: string;
  bus_id: string;
  route_id: string;
  fare: number;
  fare_type?: string | null;
  effective_from?: string | null;
  notes?: string | null;
  is_active?: boolean;
  active?: boolean;
  // joined relations
  buses?: Bus | null;
  routes?: Route | null;
}

export interface MiniCoach {
  id: string;
  name: string;
  slug: string;
  vehicle_type?: string | null;
  capacity?: number | null;
  is_ac: boolean;
  image_url?: string | null;
  description?: string | null;
  per_day_rate?: number | null;
  per_km_rate?: number | null;
  driver_charge?: number | null;
  extra_day_rate?: number | null;
  phone?: string | null;
  is_active?: boolean;
  active?: boolean;
}

export interface TourPackage {
  id: string;
  title: string;
  slug: string;
  destination: string;
  duration?: string | null;
  duration_days?: number | null;
  duration_nights?: number | null;
  price?: number | null;
  price_per_person?: number | null;
  minimum_people?: number | null;
  image_url?: string | null;
  description?: string | null;
  itinerary?: string | null;
  included?: string | null;
  excluded?: string | null;
  terms?: string | null;
  phone?: string | null;
  is_active?: boolean;
  active?: boolean;
}

export interface Booking {
  id?: string;
  booking_type: string;
  user_name: string;
  user_phone: string;
  user_email?: string | null;
  journey_date?: string | null;
  seat_count?: number | null;
  pickup_location?: string | null;
  dropoff_location?: string | null;
  notes?: string | null;
  bus_id?: string | null;
  mini_coach_id?: string | null;
  tour_package_id?: string | null;
  status: string;
  created_at?: string;
}

export interface BookingSubmission {
  booking_type: string;
  customer_name: string;
  phone: string;
  email?: string | null;
  pickup_location?: string | null;
  destination?: string | null;
  travel_date?: string | null;
  return_date?: string | null;
  passengers?: number | null;
  bus_id?: string | null;
  mini_coach_id?: string | null;
  tour_package_id?: string | null;
  vehicle_type?: string | null;
  trip_days?: number | null;
  estimated_price?: number | null;
  special_request?: string | null;
  status?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && 
  !supabaseAnonKey.includes('your-anon')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');

/**
 * Executes a query with resilient active/is_active fallback.
 * Tries 'is_active' first (default in PostgreSQL), then 'active', then no filter.
 */
export async function safeQuery<T>(
  queryBuilderFn: (col: 'is_active' | 'active' | null) => PromiseLike<{ data: any; error: any }> | Promise<{ data: any; error: any }>
): Promise<{ data: T | null; error: { code?: string; message?: string } | null }> {
  const res1 = await queryBuilderFn('is_active');
  if (!res1.error || res1.error.code !== '42703') {
    return res1 as { data: T | null; error: { code?: string; message?: string } | null };
  }
  const res2 = await queryBuilderFn('active');
  if (!res2.error || res2.error.code !== '42703') {
    return res2 as { data: T | null; error: { code?: string; message?: string } | null };
  }
  const res3 = await queryBuilderFn(null);
  return res3 as { data: T | null; error: { code?: string; message?: string } | null };
}

/**
 * Logs a Supabase/PostgREST error's actual fields (message, details, hint, code)
 * instead of dumping the raw error object, which can print as "{}" in the
 * console (this happens for plain Error/network-failure objects since their
 * message/stack properties are non-enumerable).
 */
export function logSupabaseError(label: string, err: any): void {
  console.error(label, {
    message: err?.message ?? null,
    details: err?.details ?? null,
    hint: err?.hint ?? null,
    code: err?.code ?? null,
  });
}
