import type { Metadata } from "next";
import SpeedToLeadForm from "@/components/ai-systems/SpeedToLeadForm";

export const metadata: Metadata = {
  title: "AI Speed-to-Lead — MVella Studios",
  description:
    "Live demo of MVella Studios’ Speed-to-Lead agent: submit a form and an AI assistant calls within seconds to book a calendar slot. Isolated from the studio’s production lead pipeline.",
};

const STEPS = [
  {
    label: "Submit",
    copy: "Name, phone, trade, and a short note. That payload is the only thing the agent sees.",
  },
  {
    label: "Ring",
    copy: "n8n scores the lead, Vapi dials, and the first words are a Florida recording-consent disclosure — before any qualifying questions.",
  },
  {
    label: "Book",
    copy: "If you answer, the agent books Matthew’s Cal.com calendar. Two rings with no pickup and you get an SMS with the same link.",
  },
] as const;

export default function AiSystemsPage() {
  return (
    <div className="pt-16">
      <section aria-label="AI Speed-to-Lead demo" className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="mono-label text-phosphor">&gt; ./speed-to-lead --demo</p>
          <h1 className="mt-4 max-w-4xl font-display text-h2 text-paper">
            Submit a form. Your phone rings. The calendar gets a booking.
          </h1>
          <p className="mt-6 max-w-2xl text-body text-paper/70">
            This is a live Speed-to-Lead demo for MVella Studios’ AI Systems
            line — built for roofing, HVAC, and solar operators who lose jobs
            to slow follow-up. It writes to a separate{" "}
            <code className="font-mono text-paper/90">demo_leads</code> table
            and never touches the studio contact form or production pipeline.
          </p>

          <p className="mono-label mt-8 inline-block border border-phosphor/40 px-3 py-1.5 text-phosphor">
            Sales demo · isolated data
          </p>

          <ol className="mt-14 grid gap-8 border-y border-steel/40 py-10 md:grid-cols-3 md:gap-10">
            {STEPS.map((step) => (
              <li key={step.label}>
                <p className="mono-label text-phosphor">{step.label}</p>
                <p className="mt-3 text-body text-paper/70">{step.copy}</p>
              </li>
            ))}
          </ol>

          <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-16">
            <div>
              <SpeedToLeadForm />
            </div>
            <aside>
              <dl className="border-y border-steel/40 py-6">
                {[
                  ["STACK", "N8N · VAPI · CLAUDE · CAL.COM"],
                  ["FALLBACK", "TWILIO SMS · 2 RINGS"],
                  ["CONSENT", "FLA. STAT. § 934.03"],
                  ["DATA", "DEMO_LEADS ONLY"],
                ].map(([label, value]) => (
                  <div key={label} className="py-2.5">
                    <dt className="mono-label text-paper/50">{label}</dt>
                    <dd className="mono-label mt-1.5 text-paper/80">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-body text-paper/50">
                Use a phone you can answer. The agent will ask for recording
                consent before anything else. Internal operators:{" "}
                <a
                  href="/ai-systems/dashboard"
                  className="text-paper/70 underline-offset-4 hover:text-phosphor hover:underline"
                >
                  dashboard
                </a>
                .
              </p>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
