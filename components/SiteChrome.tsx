"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

function getNavbarConfigForPath(pathname: string | null) {
  const path = pathname ?? "/";

  // Home page - Transparent navbar
  if (path === "/" || path === "/home") {
    return {
      variant: "light" as const,
      background: "bg-transparent",
      className: "absolute top-0 left-0 right-0 z-50",
    };
  }

  // Register NGO - Dark green navbar
  if (path.startsWith("/register-ngo")) {
    return {
      variant: "light" as const,
      background: "bg-[#022c22]",
      className: "sticky top-0 left-0 right-0 z-50",
    };
  }

  // Explore NGOs - Dark green navbar to match theme ✨
  if (path === "/explore-ngos" || path.startsWith("/explore")) {
    return {
      variant: "light" as const,
      background: "bg-[#022c22]",
      className: "sticky top-0 left-0 right-0 z-50 shadow-lg",
    };
  }

  // How it Works - Dark green navbar ✨
  if (path === "/how-it-works" || path.startsWith("/how")) {
    return {
      variant: "light" as const,
      background: "bg-[#022c22]",
      className: "sticky top-0 left-0 right-0 z-50 shadow-lg",
    };
  }

  // About - Dark green navbar to match main theme ✨
  if (path === "/about") {
    return {
      variant: "light" as const,
      background: "bg-[#022c22]",
      className: "fixed top-0 left-0 right-0 z-50 shadow-lg",
    };
  }

  // Donations - Dark green navbar to match main theme ✨
  if (path === "/donations") {
    return {
      variant: "light" as const,
      background: "bg-[#022c22]",
      className: "sticky top-0 left-0 right-0 z-50 shadow-lg",
    };
  }

  // Default - Light gray navbar
  return {
    variant: "dark" as const,
    background: "bg-gray-50/90 backdrop-blur-md border-b border-gray-200/50 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)]",
    className: "sticky top-0 left-0 right-0 z-50",
  };
}

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/ngo-dashboard");

  if (hideChrome) {
    return (
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    );
  }

  const nav = getNavbarConfigForPath(pathname);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <Navbar {...nav} />
      <main className="w-full flex-1">{children}</main>
      <Footer />
    </div>
  );
}