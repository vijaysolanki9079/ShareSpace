import NGOProfileClient from "@/components/NGOProfileClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NGO Profile | ShareSpace",
  description: "View organization details, mission, and impact.",
};

export default async function NGOProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NGOProfileClient id={id} />;
}
