"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

function getNavbarConfigForPath(pathname: string | null) {
  const path = pathname ?? "/";

  if (path === "/" || path === "/home" || path === "/about") {
    return {
      variant: "light" as const,
      background: "bg-transparent",
      className: "absolute top-0 left-0 right-0 z-50",
    };
  }

  if (path.startsWith("/register-ngo")) {
    return {
      variant: "light" as const,
      background: "bg-[#022c22]",
      className: "sticky top-0 left-0 right-0 z-50",
    };
  }

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
