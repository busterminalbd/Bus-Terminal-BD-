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
 *
 * The current Bus Terminal BD schema uses `active` on public data tables,
 * while older/generated builds may use `is_active`. Try the known current
 * column first, then fall back to the alternate column when the query reports
 * a missing/invalid column. We never remove the active filter as a fallback.
 */
export async function safeQuery<T>(
  queryBuilderFn: (col: 'active' | 'is_active') => PromiseLike<{ data: any; error: any }> | Promise<{ data: any; error: any }>
): Promise<{ data: T | null; error: { code?: string; message?: string; details?: string | null; hint?: string | null } | null }> {
  const res1 = await queryBuilderFn('active');
  if (!res1.error) {
    return res1 as { data: T | null; error: null };
  }

  const message = String(res1.error.message || '').toLowerCase();
  const missingColumn =
    res1.error.code === '42703' ||
    res1.error.code === 'PGRST204' ||
    message.includes('column') && (message.includes('active') || message.includes('is_active')) ||
    message.includes('schema cache');

  if (!missingColumn) {
    return res1 as { data: T | null; error: { code?: string; message?: string; details?: string | null; hint?: string | null } };
  }

  const res2 = await queryBuilderFn('is_active');
  return res2 as { data: T | null; error: { code?: string; message?: string; details?: string | null; hint?: string | null } | null };
}

/**
 * Attaches from_district/to_district (id, name) onto already-fetched routes via a
 * separate `districts` query. This is the resilient fallback used when the embedded
 * `districts!routes_from_district_id_fkey` / `..._to_district_id_fkey` join can't be
 * resolved by PostgREST (e.g. the live schema's actual foreign-key constraint name
 * doesn't match what the query assumed) — it never depends on any assumed relationship
 * name, only on the `from_district_id`/`to_district_id` columns already present on Route.
 */
export async function attachDistrictsToRoutes<
  T extends { from_district_id?: string | null; to_district_id?: string | null }
>(routes: T[]): Promise<(T & { from_district?: District | null; to_district?: District | null })[]> {
  const ids = Array.from(
    new Set(
      routes
        .flatMap((r) => [r.from_district_id, r.to_district_id])
        .filter((id): id is string => Boolean(id))
    )
  );

  if (ids.length === 0) {
    return routes.map((r) => ({ ...r, from_district: null, to_district: null }));
  }

  const { data } = await supabase.from('districts').select('id, name').in('id', ids);
  const map = new Map<string, District>((((data as District[]) || [])).map((d) => [d.id, d]));

  return routes.map((r) => ({
    ...r,
    from_district: r.from_district_id ? map.get(r.from_district_id) ?? null : null,
    to_district: r.to_district_id ? map.get(r.to_district_id) ?? null : null,
  }));
}

/**
 * True if a PostgREST error indicates an embedded-relationship hint (e.g. an assumed
 * foreign-key constraint name like `routes_from_district_id_fkey`) couldn't be resolved,
 * so the caller should fall back to a separate query instead of the embed.
 */
export function isMissingRelationshipError(error: any): boolean {
  if (!error) return false;
  // PGRST200 is PostgREST's code for "Could not find a relationship ... in the schema cache".
  if (error.code === 'PGRST200') return true;
  const msg = String(error.message || '').toLowerCase();
  return msg.includes('relationship') || msg.includes('foreign key') || msg.includes('schema cache');
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
