import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { bodyFont, displayFont, monoFont } from "./fonts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import StickyMobileCta from "@/components/StickyMobileCta";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";
import { profile } from "@/lib/profile";
import { SITE_ORIGIN, STUDIO_AREA, STUDIO_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "MVella Studios — Security-minded software, built and shipped.",
    template: "%s",
  },
  description:
    "Freelance web and mobile development from Matthew Vella. Secure sites and apps for small businesses and products across South Florida.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: STUDIO_NAME,
    title: "MVella Studios — Security-minded software, built and shipped.",
    description:
      "Freelance web and mobile development from Matthew Vella. Secure sites and apps for small businesses and products across South Florida.",
    url: SITE_ORIGIN,
  },
  twitter: {
    card: "summary_large_image",
    title: "MVella Studios — Security-minded software, built and shipped.",
    description:
      "Freelance web and mobile development from Matthew Vella. Secure sites and apps for small businesses and products across South Florida.",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: STUDIO_NAME,
  url: SITE_ORIGIN,
  logo: `${SITE_ORIGIN}/brand/mvella-logo.png`,
  image: `${SITE_ORIGIN}/brand/mvella-logo.png`,
  description:
    "Freelance web and mobile development studio — security-minded software for small businesses and products.",
  areaServed: STUDIO_AREA,
  founder: {
    "@type": "Person",
    name: profile.name,
  },
  sameAs: [profile.githubUrl, profile.linkedinUrl].filter(Boolean),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="pb-20 md:pb-0">
        <Nav />
        <main>{children}</main>
        <Footer />
        <StickyMobileCta />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {/* Vercel Web Analytics — aggregate page views, no cookies. The
            privacy policy at /legal describes exactly this; if analytics
            ever changes, change both. */}
        <Analytics />
        {/* Google Ads base tag — conversion events fire from ContactForm
            after a successful /api/contact response. Prefer the thank-you
            page once Ads is pointed at /contact/thank-you. */}
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
