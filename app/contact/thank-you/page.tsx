import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Message sent — MVella Studios",
  description:
    "Your message was sent to MVella Studios. Expect a reply within 24 hours.",
  robots: { index: false, follow: false },
};

/**
 * Post-submit landing for /contact.
 *
 * ContactForm router.pushes here after /api/contact returns OK, so the
 * conversion surface is a stable URL rather than an inline success panel.
 *
 * Google Ads conversion — fire from this page (page-load or event tag), not
 * from the form submit handler. Leave the form's trackGoogleAdsConversion
 * call alone until Matthew confirms which surface Ads is listening on;
 * duplicate fires would double-count. Hook the tag below once the label is
 * confirmed in Google Ads Tag setup.
 */
export default function ContactThankYouPage() {
  return (
    <div className="pt-16">
      <section
        aria-label="Message sent"
        className="bg-ink"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="mono-label text-phosphor">&gt; message sent</p>
          <h1 className="mt-4 font-display text-h2 text-paper">
            Got it — I&rsquo;ll be in touch.
          </h1>
          <p className="mt-6 max-w-xl text-body text-paper/70">
            Thanks for reaching out. I reply to every real inquiry within 24
            hours, usually sooner. No autoresponder loops — just a direct reply
            from me.
          </p>

          {/*
            GOOGLE ADS CONVERSION — fire here on page load / thank-you view.
            Example once the real label is set:

              <Script id="google-ads-thank-you" strategy="afterInteractive">
                {`gtag('event', 'conversion', { send_to: 'AW-…/LABEL' });`}
              </Script>

            Or attach a page-view conversion in Google Ads that matches this
            URL path: /contact/thank-you
          */}

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/work"
              className="mono-label bg-phosphor px-6 py-3 text-ink transition-colors hover:bg-paper"
            >
              View Work
            </Link>
            <Link
              href="/"
              className="mono-label text-paper/70 underline-offset-4 transition-colors hover:text-phosphor hover:underline"
            >
              Back to home →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
