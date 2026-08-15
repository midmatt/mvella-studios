import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { bodyFont, displayFont, monoFont } from "./fonts";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import StickyMobileCta from "@/components/StickyMobileCta";
import { GOOGLE_CONSENT_DEFAULT_SCRIPT } from "@/lib/cookie-consent";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";
import { GOOGLE_ANALYTICS_ID } from "@/lib/google-analytics";
import { GTM_ID } from "@/lib/google-tag-manager";
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
        {/* GTM noscript — first child of body per Google's snippet. */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>
        {/* Consent Mode v2 default denied — blocking/beforeInteractive so it
            runs in the initial HTML before GTM and gtag.js. Do not move this
            into the banner's useEffect (too late on first paint). lazyOnload
            gtag is unchanged so it still avoids competing with Hero LCP. */}
        <Script id="google-consent-default" strategy="beforeInteractive">
          {GOOGLE_CONSENT_DEFAULT_SCRIPT}
        </Script>
        {/* GTM — afterInteractive so it always loads AFTER the consent-default
            beforeInteractive snippet. Same dataLayer name ('dataLayer') so
            Consent Mode updates apply to GTM too. Do not use beforeInteractive
            here: that would race the default-denied consent. */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
        <Nav />
        <main>{children}</main>
        <Footer />
        <CookieConsentBanner />
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
        {/* Shared gtag.js — one library load, then config for Google Ads
            (AW-…) and GA4 (G-…). Uses lazyOnload (fires after window.onload +
            idle) to avoid the <link rel="preload"> that afterInteractive emits,
            which competes with Hero LCP. Safe for conversions because form
            submit happens seconds later and trackGoogleAdsConversion() retries
            for up to 3 s if gtag isn't ready yet. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
          strategy="lazyOnload"
        />
        <Script id="google-gtag" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ADS_ID}');
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
