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
    name: "Green Earth Initiative",
    description: "Planting trees and cleaning up local parks.",
    category: "Environment",
    location: "Downtown Community Center",
    distanceKm: 2.4,
    lat: 28.6139,
    lng: 77.2090,
    verified: true,
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "ngo-2",
    name: "Tech for Kids",
    description: "Providing refurbished laptops to underprivileged students.",
    category: "Education",
    location: "Westside Tech Hub",
    distanceKm: 5.1,
    lat: 28.5355,
    lng: 77.1522,
    verified: true,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "ngo-3",
    name: "Food Rescue Network",
    description: "Distributing surplus food to local shelters.",
    category: "Food",
    location: "City Market District",
    distanceKm: 1.2,
    lat: 28.6289,
    lng: 77.2065,
    verified: false,
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
  },
];

export const MOCK_DONATIONS: DonationItem[] = [
  {
    id: "don-101",
    title: "Old Winter Coats (3x)",
    category: "Clothes",
    status: "Delivered",
    date: "2026-03-28",
    ngoId: "ngo-1",
    ngoName: "Green Earth Initiative",
  },
  {
    id: "don-102",
    title: "Dell XPS 13 Laptop",
    category: "Electronics",
    status: "Picked Up",
    date: "2026-04-01",
    ngoId: "ngo-2",
    ngoName: "Tech for Kids",
  },
  {
    id: "don-103",
    title: "Canned Goods - 2 Boxes",
    category: "Food",
    status: "Pending",
    date: "2026-04-03",
    ngoId: "ngo-3",
    ngoName: "Food Rescue Network",
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "evt-1",
    title: "Weekend Beach Cleanup",
    date: "2026-04-10T09:00:00Z",
    location: "Sunset Beach",
    organizer: "Green Earth Initiative",
    attendees: 42,
  },
  {
    id: "evt-2",
    title: "Winter Clothes Drive",
    date: "2026-04-15T10:00:00Z",
    location: "City Square Mall",
    organizer: "Community Helpers",
    attendees: 15,
  },
];

export const MOCK_USER_STATS = {
  totalDonations: 12,
  itemsDonated: 45,
  ngosSupported: 4,
  impactScore: 850,
};
