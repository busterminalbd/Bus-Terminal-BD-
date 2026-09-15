import { District, BusOperator, Bus, Route, BusRoute, Counter, Fare, MiniCoach, TourPackage } from './supabase';

export const fallbackDistricts: District[] = [
  { id: 'dist-1', name: 'ঢাকা (Dhaka)', division: 'Dhaka', slug: 'dhaka', is_active: true },
  { id: 'dist-2', name: 'চট্টগ্রাম (Chattogram)', division: 'Chattogram', slug: 'chattogram', is_active: true },
  { id: 'dist-3', name: 'কক্সবাজার (Cox\'s Bazar)', division: 'Chattogram', slug: 'coxs-bazar', is_active: true },
  { id: 'dist-4', name: 'সিলেট (Sylhet)', division: 'Sylhet', slug: 'sylhet', is_active: true },
  { id: 'dist-5', name: 'রাজশাহী (Rajshahi)', division: 'Rajshahi', slug: 'rajshahi', is_active: true },
  { id: 'dist-6', name: 'খুলনা (Khulna)', division: 'Khulna', slug: 'khulna', is_active: true },
  { id: 'dist-7', name: 'বরিশাল (Barishal)', division: 'Barishal', slug: 'barishal', is_active: true },
  { id: 'dist-8', name: 'রংপুর (Rangpur)', division: 'Rangpur', slug: 'rangpur', is_active: true },
  { id: 'dist-9', name: 'বগুড়া (Bogura)', division: 'Rajshahi', slug: 'bogura', is_active: true },
  { id: 'dist-10', name: 'কুমিল্লা (Cumilla)', division: 'Chattogram', slug: 'cumilla', is_active: true },
];

export const fallbackOperators: BusOperator[] = [
  {
    id: 'op-1',
    name: 'গ্রীন লাইন পরিবহন (Green Line Paribahan)',
    slug: 'green-line-paribahan',
    logo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=300&auto=format&fit=crop',
    description: 'বাংলাদেশের অন্যতম প্রিমিয়ার স্ক্যানিয়া এবং ডাবল ডেকার লাক্সারি বাস সার্ভিস।',
    phone: '01711612433',
    website: 'https://greenlinebd.com',
    is_active: true,
  },
  {
    id: 'op-2',
    name: 'সোহাগ পরিবহন (Shohagh Paribahan)',
    slug: 'shohagh-paribahan',
    logo_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=300&auto=format&fit=crop',
    description: 'দেশজুড়ে নির্ভরযোগ্য ও আধুনিক স্ক্যানিয়া এসি বাস সেবা প্রদানকারী শীর্ষ সংস্থা।',
    phone: '01711594396',
    website: 'https://shohagh.com',
    is_active: true,
  },
  {
    id: 'op-3',
    name: 'হানিফ এন্টারপ্রাইজ (Hanif Enterprise)',
    slug: 'hanif-enterprise',
    logo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=300&auto=format&fit=crop',
    description: 'দেশের বৃহত্তম বাস নেটওয়ার্ক, ৬৪ জেলায় এসি ও নন-এসি নিয়মিত সেবা।',
    phone: '01713049555',
    is_active: true,
  },
  {
    id: 'op-4',
    name: 'শ্যামলী এন আর ট্রাভেলস (Shyamoli NR Travels)',
    slug: 'shyamoli-nr-travels',
    logo_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=300&auto=format&fit=crop',
    description: 'আন্তর্জাতিক ও আন্তঃজেলা রুটে বিশ্বস্ত ও আরামদায়ক পরিবহন সেবা।',
    phone: '01711135678',
    is_active: true,
  },
  {
    id: 'op-5',
    name: 'দেশ ট্রাভেলস (Desh Travels)',
    slug: 'desh-travels',
    logo_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=300&auto=format&fit=crop',
    description: 'উত্তরবঙ্গ ও দক্ষিণাঞ্চলের রুটে আধুনিক হুন্দাই ও আরএমটু এসি বাস সার্ভিস।',
    phone: '01762684400',
    is_active: true,
  },
  {
    id: 'op-6',
    name: 'সেন্টমার্টিন ট্রাভেলস (Saintmartin Travels)',
    slug: 'saintmartin-travels',
    logo_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=300&auto=format&fit=crop',
    description: 'কক্সবাজার ও টেকনাফ রুটে প্রিমিয়াম স্লিপার কোচ ও বিজনেস ক্লাস সার্ভিস।',
    phone: '01711335577',
    is_active: true,
  }
];

export const fallbackBuses: Bus[] = [
  {
    id: 'bus-1',
    operator_id: 'op-1',
    name: 'গ্রীন লাইন স্ক্যানিয়া মাল্টি-অ্যাক্সেল স্লিপার',
    slug: 'green-line-scania-multi-axle-sleeper',
    category: 'স্লিপার ক্লাস',
    bus_type: 'Scania K410 Multi-Axle Sleeper',
    description: 'সম্পূর্ণ আধুনিক স্লিপার বেড, চার্জিং পোর্ট, ওয়াইফাই ও রিফ্রেশমেন্ট সুবিধাসহ প্রিমিয়াম ভ্রমণ।',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
    phone: '01711612433',
    is_ac: true,
    seat_count: 28,
    is_active: true,
    bus_operators: fallbackOperators[0]
  },
  {
    id: 'bus-2',
    operator_id: 'op-2',
    name: 'সোহাগ স্ক্যানিয়া কমফোর্ট প্লাস এসি',
    slug: 'shohagh-scania-comfort-plus-ac',
    category: 'বিজনেস ক্লাস',
    bus_type: 'Scania Touring HD',
    description: '২+১ বিজনেস ক্লাস আরামদায়ক রিক্লাইনিং লেদার সিট ও দক্ষ চালক টিম।',
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
    phone: '01711594396',
    is_ac: true,
    seat_count: 31,
    is_active: true,
    bus_operators: fallbackOperators[1]
  },
  {
    id: 'bus-3',
    operator_id: 'op-3',
    name: 'হানিফ হিনো ১জে এয়ার সাসপেনশন এসি',
    slug: 'hanif-hino-1j-air-suspension-ac',
    category: 'ইকোনমি এসি',
    bus_type: 'Hino 1J Air Suspension',
    description: 'দ্রুতগামী ও সাশ্রয়ী ভাড়ায় প্রতিদিন নিয়মিত চলাচলকারী নির্ভরযোগ্য সার্ভিস।',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
    phone: '01713049555',
    is_ac: true,
    seat_count: 36,
    is_active: true,
    bus_operators: fallbackOperators[2]
  },
  {
    id: 'bus-4',
    operator_id: 'op-4',
    name: 'শ্যামলী এন আর হুন্দাই ইউনিভার্স লাক্সারি',
    slug: 'shyamoli-nr-hyundai-universe-luxury',
    category: 'বিজনেস ক্লাস',
    bus_type: 'Hyundai Universe Express Noble',
    description: 'স্মুথ ড্রাইভিং, প্রশস্ত লেগরুম এবং আন্তর্জাতিক মানের নিরাপত্তা প্রযুক্তি।',
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
    phone: '01711135678',
    is_ac: true,
    seat_count: 32,
    is_active: true,
    bus_operators: fallbackOperators[3]
  },
  {
    id: 'bus-5',
    operator_id: 'op-5',
    name: 'দেশ ট্রাভেলস হুন্দাই ভিআইপি এসি',
    slug: 'desh-travels-hyundai-vip-ac',
    category: 'ভিআইপি এসি',
    bus_type: 'Hyundai Universe Prime',
    description: 'রাজশাহী ও উত্তরবঙ্গের সেরা সময়নিষ্ঠ ও মার্জিত ভিআইপি এসি সার্ভিস।',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
    phone: '01762684400',
    is_ac: true,
    seat_count: 30,
    is_active: true,
    bus_operators: fallbackOperators[4]
  },
  {
    id: 'bus-6',
    operator_id: 'op-6',
    name: 'সেন্টমার্টিন মার্সিডিজ-বেঞ্জ প্রিমিয়াম স্লিপার',
    slug: 'saintmartin-mercedes-benz-premium-sleeper',
    category: 'স্লিপার ক্লাস',
    bus_type: 'Mercedes-Benz Multi-Axle Sleeper',
    description: 'ঢাকা-কক্সবাজার রুটে বিলাসবহুল শুয়ে ভ্রমণের অনন্য অভিজ্ঞতা।',
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
    phone: '01711335577',
    is_ac: true,
    seat_count: 26,
    is_active: true,
    bus_operators: fallbackOperators[5]
  }
];

export const fallbackRoutes: Route[] = [
  {
    id: 'route-1',
    from_district_id: 'dist-1',
    to_district_id: 'dist-3',
    distance_km: 395,
    estimated_duration: '৮-৯ ঘণ্টা',
    description: 'ঢাকা সায়দাবাদ/আরামবাগ হতে চট্টগ্রাম মহাসড়ক হয়ে পর্যটন নগরী কক্সবাজার।',
    is_active: true,
    from_district: fallbackDistricts[0],
    to_district: fallbackDistricts[2]
  },
  {
    id: 'route-2',
    from_district_id: 'dist-1',
    to_district_id: 'dist-2',
    distance_km: 245,
    estimated_duration: '৫-৬ ঘণ্টা',
    description: 'দেশের ব্যস্ততম বাণিজ্যিক রুট, ঢাকা হতে বন্দরনগরী চট্টগ্রাম।',
    is_active: true,
    from_district: fallbackDistricts[0],
    to_district: fallbackDistricts[1]
  },
  {
    id: 'route-3',
    from_district_id: 'dist-1',
    to_district_id: 'dist-4',
    distance_km: 240,
    estimated_duration: '৫-৬ ঘণ্টা',
    description: 'ঢাকা সায়েদাবাদ/মহাখালী হতে সিলেট কদমতলী টার্মিনাল।',
    is_active: true,
    from_district: fallbackDistricts[0],
    to_district: fallbackDistricts[3]
  },
  {
    id: 'route-4',
    from_district_id: 'dist-1',
    to_district_id: 'dist-5',
    distance_km: 250,
    estimated_duration: '৫-৬ ঘণ্টা',
    description: 'বঙ্গবন্ধু সেতু হয়ে ঢাকা কল্যাণপুর/গাবতলী হতে বিভাগীয় শহর রাজশাহী।',
    is_active: true,
    from_district: fallbackDistricts[0],
    to_district: fallbackDistricts[4]
  },
  {
    id: 'route-5',
    from_district_id: 'dist-1',
    to_district_id: 'dist-6',
    distance_km: 220,
    estimated_duration: '৪-৫ ঘণ্টা',
    description: 'পদ্মা সেতু এক্সপ্রেসওয়ে হয়ে ঢাকা হতে সুন্দরবনের প্রবেশদ্বার খুলনা।',
    is_active: true,
    from_district: fallbackDistricts[0],
    to_district: fallbackDistricts[5]
  },
  {
    id: 'route-6',
    from_district_id: 'dist-2',
    to_district_id: 'dist-3',
    distance_km: 150,
    estimated_duration: '৩-৪ ঘণ্টা',
    description: 'চট্টগ্রাম দামপাড়া/একে খান হতে মেরিন সিটি কক্সবাজার।',
    is_active: true,
    from_district: fallbackDistricts[1],
    to_district: fallbackDistricts[2]
  }
];

export const fallbackFares: Fare[] = [
  {
    id: 'fare-1',
    bus_id: 'bus-1',
    route_id: 'route-1',
    fare: 2200,
    fare_type: 'স্লিপার ক্লাস',
    is_active: true,
    buses: fallbackBuses[0],
    routes: fallbackRoutes[0]
  },
  {
    id: 'fare-2',
    bus_id: 'bus-2',
    route_id: 'route-1',
    fare: 1800,
    fare_type: 'বিজনেস ক্লাস',
    is_active: true,
    buses: fallbackBuses[1],
    routes: fallbackRoutes[0]
  },
  {
    id: 'fare-3',
    bus_id: 'bus-3',
    route_id: 'route-1',
    fare: 1200,
    fare_type: 'ইকোনমি এসি',
    is_active: true,
    buses: fallbackBuses[2],
    routes: fallbackRoutes[0]
  },
  {
    id: 'fare-4',
    bus_id: 'bus-1',
    route_id: 'route-2',
    fare: 1400,
    fare_type: 'মাল্টি-অ্যাক্সেল এসি',
    is_active: true,
    buses: fallbackBuses[0],
    routes: fallbackRoutes[1]
  },
  {
    id: 'fare-5',
    bus_id: 'bus-4',
    route_id: 'route-3',
    fare: 1100,
    fare_type: 'বিজনেস এসি',
    is_active: true,
    buses: fallbackBuses[3],
    routes: fallbackRoutes[2]
  },
  {
    id: 'fare-6',
    bus_id: 'bus-5',
    route_id: 'route-4',
    fare: 1200,
    fare_type: 'ভিআইপি এসি',
    is_active: true,
    buses: fallbackBuses[4],
    routes: fallbackRoutes[3]
  }
];

export const fallbackCounters: Counter[] = [
  {
    id: 'cnt-1',
    district_id: 'dist-1',
    counter_name: 'আরামবাগ প্রধান কাউন্টার',
    address: '১০/এ আরামবাগ, মতিঝিল, ঢাকা',
    phone: '01711612433',
    alternate_phone: '01911223344',
    is_active: true,
    districts: fallbackDistricts[0]
  },
  {
    id: 'cnt-2',
    district_id: 'dist-1',
    counter_name: 'পান্থপথ ভিআইপি কাউন্টার',
    address: 'পান্থপথ মোড়, বসুন্ধরা সিটির বিপরীতে, ঢাকা',
    phone: '01711594396',
    is_active: true,
    districts: fallbackDistricts[0]
  },
  {
    id: 'cnt-3',
    district_id: 'dist-1',
    counter_name: 'কল্যাণপুর বাস কাউন্টার',
    address: 'মিরপুর রোড, কল্যাণপুর বাসস্ট্যান্ড, ঢাকা',
    phone: '01713049555',
    is_active: true,
    districts: fallbackDistricts[0]
  },
  {
    id: 'cnt-4',
    district_id: 'dist-2',
    counter_name: 'দামপাড়া প্রধান কাউন্টার',
    address: 'দামপাড়া পুলিশ লাইনের বিপরীতে, চট্টগ্রাম',
    phone: '01711889900',
    is_active: true,
    districts: fallbackDistricts[1]
  },
  {
    id: 'cnt-5',
    district_id: 'dist-3',
    counter_name: 'কক্সবাজার ঝাউতলা কাউন্টার',
    address: 'ঝাউতলা মেইন রোড, কলাতলী মোড়, কক্সবাজার',
    phone: '01711445566',
    is_active: true,
    districts: fallbackDistricts[2]
  }
];

export const fallbackMiniCoaches: MiniCoach[] = [
  {
    id: 'mc-1',
    name: 'টয়োটা হায়েস গ্র্যান্ড কেবিন (Toyota Hiace Grand Cabin)',
    slug: 'toyota-hiace-grand-cabin',
    vehicle_type: 'Microbus / Grand Cabin',
    capacity: 11,
    is_ac: true,
    per_day_rate: 4500,
    per_km_rate: 22,
    driver_charge: 500,
    phone: '01711612433',
    image_url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800&auto=format&fit=crop',
    description: 'পারিবারিক ভ্রমণ বা কর্পোরেট সফরের জন্য সুপরিসর ১১ সিটের সম্পূর্ণ শীতাতপ নিয়ন্ত্রিত হাই-রুফ মাইক্রোবাস।',
    is_active: true
  },
  {
    id: 'mc-2',
    name: 'টয়োটা কোস্টার লাক্সারি মিনি কোচ (Toyota Coaster)',
    slug: 'toyota-coaster-luxury-mini-coach',
    vehicle_type: 'Mini Coach',
    capacity: 28,
    is_ac: true,
    per_day_rate: 9500,
    driver_charge: 1000,
    phone: '01711594396',
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800&auto=format&fit=crop',
    description: 'গ্রুপ ট্যুর, পিকনিক ও বিয়ের ইভেন্টের জন্য সেরা ২৮ আসনের আরামদায়ক মিনিবাস।',
    is_active: true
  }
];

export const fallbackTourPackages: TourPackage[] = [
  {
    id: 'tour-1',
    title: 'কক্সবাজার ও সেন্টমার্টিন দ্বীপ বিলাসবহুল অবকাশ',
    slug: 'coxs-bazar-saint-martin-luxury-tour',
    destination: 'কক্সবাজার - সেন্টমার্টিন',
    duration: '৪ দিন ৩ রাত',
    duration_days: 4,
    duration_nights: 3,
    price: 10500,
    price_per_person: 10500,
    minimum_people: 2,
    phone: '01711612433',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    description: 'বিশ্বের দীর্ঘতম সমুদ্র সৈকত ও প্রবাল দ্বীপে বিলাসবহুল রিসোর্ট ও জাহাজ ভ্রমণসহ সম্পূর্ণ প্যাকেজ।',
    included: 'স্লিপার বাস টিকেট, ৩ স্টার বিচ ভিউ হোটেল, জাহাজ টিকেট, প্রতিদিনের ৩ বেলা খাবার, গাইড।',
    is_active: true
  },
  {
    id: 'tour-2',
    title: 'সাজেক ভ্যালি মেঘের দেশে প্রিমিয়াম ট্যুর',
    slug: 'sajek-valley-cloud-premium-tour',
    destination: 'সাজেক ভ্যালি, রাঙ্গামাটি',
    duration: '৩ দিন ২ রাত',
    duration_days: 3,
    duration_nights: 2,
    price: 7500,
    price_per_person: 7500,
    minimum_people: 4,
    phone: '01711594396',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    description: 'পাহাড়ের চূড়ায় মেঘের আনাগোনা, হ্যালিপ্যাড ও রুইলুই পাড়ায় আরামদায়ক রিসোর্টে থাকার সুযোগ।',
    included: 'ঢাকা-খাগড়াছড়ি এসি বাস, চান্দের গাড়ি (জিপ), রিসোর্ট বুকিং, সকল খাবার।',
    is_active: true
  }
];
