import SiteChrome from "@/components/SiteChrome";
import { Providers } from "./providers";
import "./globals.css";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShareNest - Community Giving Platform",
  description: "ShareNest is a platform connecting donors with verified NGOs and neighbors. Donate items, reduce waste, and make a community impact.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" data-scroll-behavior="smooth">
      <body className={`flex min-h-full flex-col font-sans ${nunito.className}`}>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
