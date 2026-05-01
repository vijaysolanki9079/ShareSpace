export type NGO = {
  id: string;
  name: string;
  description: string;
  category: "Education" | "Health" | "Environment" | "Poverty" | "Food" | "Other";
  location: string;
  distanceKm: number;
  lat: number;
  lng: number;
  verified: boolean;
  image: string;
};

export type DonationItem = {
  id: string;
  title: string;
  category: "Clothes" | "Food" | "Electronics" | "Funds" | "Other";
  status: "Pending" | "Picked Up" | "Delivered";
  date: string;
  ngoId?: string;
  ngoName?: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  organizer: string;
  attendees: number;
};

// --- MOCK DATA ---

export const MOCK_NGOS: NGO[] = [
  {
    id: "ngo-1",
    name: "Hariyali Prayas Society",
    description: "Restoring Bengaluru's urban green cover through plantation drives, rooftop gardens, and lake rejuvenation projects.",
    category: "Environment",
    location: "Bengaluru, Karnataka",
    distanceKm: 2.4,
    lat: 12.9716,
    lng: 77.5946,
    verified: true,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "ngo-2",
    name: "Shiksha Setu Foundation",
    description: "Bridging the education gap for underprivileged children across Delhi-NCR through community learning centres.",
    category: "Education",
    location: "New Delhi, Delhi",
    distanceKm: 5.1,
    lat: 28.6304,
    lng: 77.2177,
    verified: true,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "ngo-3",
    name: "Anna Daan Charitable Society",
    description: "Collecting surplus food from venues across Chennai and redistributing over 4,000 meals daily to those in need.",
    category: "Food",
    location: "Chennai, Tamil Nadu",
    distanceKm: 1.2,
    lat: 13.0827,
    lng: 80.2707,
    verified: true,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
  },
];


export const MOCK_DONATIONS: DonationItem[] = [
  {
    id: "don-101",
    title: "Winter Blankets & Woollen Clothes (8 pcs)",
    category: "Clothes",
    status: "Delivered",
    date: "2026-03-28",
    ngoId: "ngo-1",
    ngoName: "Hariyali Prayas Society",
  },
  {
    id: "don-102",
    title: "Dell Latitude Laptop (Refurbished)",
    category: "Electronics",
    status: "Picked Up",
    date: "2026-04-01",
    ngoId: "ngo-2",
    ngoName: "Shiksha Setu Foundation",
  },
  {
    id: "don-103",
    title: "Dry Ration Kit — Rice, Dal, Oil (×10)",
    category: "Food",
    status: "Pending",
    date: "2026-04-03",
    ngoId: "ngo-3",
    ngoName: "Anna Daan Charitable Society",
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Cubbon Park Green Drive — Tree Plantation",
    date: "2026-05-18T09:00:00Z",
    location: "Cubbon Park, Bengaluru",
    organizer: "Hariyali Prayas Society",
    attendees: 87,
  },
  {
    id: "evt-2",
    title: "Back-to-School Stationery & Book Donation Drive",
    date: "2026-06-02T10:00:00Z",
    location: "Karol Bagh Community Hall, New Delhi",
    organizer: "Shiksha Setu Foundation",
    attendees: 134,
  },
];

export const MOCK_USER_STATS = {
  totalDonations: 12,
  itemsDonated: 45,
  ngosSupported: 4,
  impactScore: 850,
};
