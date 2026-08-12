import type { Metadata } from "next";
import Link from "next/link";
import AppInquiryForm from "@/components/AppInquiryForm";
import Breadcrumbs from "@/components/Breadcrumbs";
import { DIRECT_EMAIL } from "@/lib/contact";

export const metadata: Metadata = {
  title: "App Feedback — MVella Studios",
  description:
    "Share feedback on AlarmQR, CyberSimply, VoiceLocal, and other MVella Studios apps. Select your app and tell me what’s working — or what isn’t.",
};

const DETAILS: Array<[label: string, value: string]> = [
  ["READ BY", "MATTHEW"],
  ["EMAIL", DIRECT_EMAIL],
];

export default function FeedbackPage() {
  return (
    <div className="pt-16">
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Feedback" },
          ]}
        />
      </div>
      <section aria-label="App feedback" className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 pb-24 pt-6">
          <p className="mono-label text-phosphor">&gt; ./app-feedback</p>
          <h1 className="mt-4 font-display text-h2 text-paper">App feedback</h1>
          <p className="mt-6 max-w-2xl text-body text-paper/70">
            Select the app and tell me what you love, what&rsquo;s rough, or
            what you wish existed. Optional rating welcome — every note is
            read.
          </p>

          <div className="mt-14 grid gap-12 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-16">
            <div className="order-2 md:order-1">
              <AppInquiryForm kind="feedback" />
            </div>

            <div className="order-1 md:order-2">
              <dl className="border-y border-steel/40 py-6">
                {DETAILS.map(([label, value]) => (
                  <div key={label} className="py-2.5">
                    <dt className="mono-label text-paper/50">{label}</dt>
                    <dd className="mono-label mt-1.5 text-paper/80">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-body text-paper/60">
                Need help with a bug or account issue?{" "}
                <Link
                  href="/support"
                  className="text-phosphor underline-offset-4 hover:underline"
                >
                  Get support →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
