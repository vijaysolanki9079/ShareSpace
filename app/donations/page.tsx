import DonationsClient from "@/components/donations/DonationsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donations | ShareSpace",
  description: "Browse items people are willing to donate and NGOs in your community.",
};

export default async function DonationsPage() {
  return <DonationsClient />;
}