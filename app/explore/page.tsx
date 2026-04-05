import ExploreClient from "@/components/ExploreClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | ShareSpace",
  description: "Discover nearby NGOs and donation drives in your community.",
};

export default async function ExplorePage() {
  // Simulate slow network request (e.g. Prisma DB query) to show loading.tsx
  await new Promise((resolve) => setTimeout(resolve, 2500));

  return <ExploreClient />;
}
