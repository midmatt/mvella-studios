import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { bodyFont, displayFont, monoFont } from "./fonts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";
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
        {/* Google Ads base tag — conversion events fire from ContactForm
            after a successful /api/contact response. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
