import DonationsClient from "@/components/donations/DonationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donations | ShareSpace",
  description: "See the collective impact of our community's generosity.",
};

export default async function DonationsPage() {
  // Simulate slow network request to show loading states
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return <DonationsClient />;
}