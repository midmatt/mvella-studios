import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { bodyFont, displayFont, monoFont } from "./fonts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "MVella Studios — Security-minded software, built and shipped.",
  description:
    "Freelance web and app development studio of Matthew Vella. Websites, iOS apps, and security-minded architecture for small businesses and products.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
        {/* Vercel Web Analytics — aggregate page views, no cookies. The
            privacy policy at /legal describes exactly this; if analytics
            ever changes, change both. */}
        <Analytics />
      </body>
    </html>
  );
}
