import type { Metadata } from "next";
import DashboardSignOut from "@/components/ai-systems/DashboardSignOut";
import DemoLeadsTable from "@/components/ai-systems/DemoLeadsTable";
import { isCalComConfigured } from "@/lib/ai-systems/calcom";
import { isSupabaseConfigured, listDemoLeads } from "@/lib/ai-systems/supabase";
import type { DemoLead } from "@/lib/ai-systems/types";

export const metadata: Metadata = {
  title: "Speed-to-Lead dashboard — MVella Studios",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DemoDashboardPage() {
  let leads: DemoLead[] = [];
  let loadError: string | null = null;
  try {
    leads = await listDemoLeads(150);
  } catch (err) {
    loadError =
      err instanceof Error ? err.message : "Could not load demo_leads";
  }

  const booked = leads.filter((lead) => lead.booked).length;
  const contacted = leads.filter((lead) => lead.response_time_seconds != null);
  const avg =
    contacted.length > 0
      ? contacted.reduce(
          (sum, lead) => sum + (lead.response_time_seconds ?? 0),
          0
        ) / contacted.length
      : null;

  return (
    <div className="pt-16">
      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mono-label text-phosphor">
                &gt; ./speed-to-lead --ops
              </p>
              <h1 className="mt-4 font-display text-h2 text-paper">
                Demo leads
              </h1>
              <p className="mt-4 max-w-xl text-body text-paper/70">
                <code className="font-mono text-paper/90">demo_leads</code> only.
                The studio contact form and agreements table are not queried
                here.
              </p>
            </div>
            <DashboardSignOut />
          </div>

          <dl className="mt-12 grid gap-6 border-y border-steel/40 py-8 sm:grid-cols-3">
            <div>
              <dt className="mono-label text-paper/50">Leads</dt>
              <dd className="mt-2 font-mono text-h2 text-paper">{leads.length}</dd>
            </div>
            <div>
              <dt className="mono-label text-paper/50">Avg response</dt>
              <dd className="mt-2 font-mono text-h2 text-phosphor">
                {avg == null ? "—" : `${avg.toFixed(1)}s`}
              </dd>
            </div>
            <div>
              <dt className="mono-label text-paper/50">Booked</dt>
              <dd className="mt-2 font-mono text-h2 text-paper">
                {booked}
                <span className="ml-2 text-h3 text-paper/40">
                  / {leads.length}
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-12">
            {loadError ? (
              <p role="alert" className="text-body text-paper/70">
                {loadError}
              </p>
            ) : (
              <DemoLeadsTable leads={leads} />
            )}
          </div>

          <WiringPanel />
        </div>
      </section>
    </div>
  );
}

function WiringPanel() {
  const rows: Array<[string, boolean]> = [
    ["Supabase (demo_leads)", isSupabaseConfigured()],
    ["n8n webhook", Boolean(process.env.N8N_WEBHOOK_URL)],
    ["Internal webhook secret", Boolean(process.env.DEMO_LEADS_WEBHOOK_SECRET)],
    ["Vapi server secret", Boolean(process.env.VAPI_SERVER_SECRET)],
    ["Cal.com API", isCalComConfigured()],
    ["Cal.com booking URL", Boolean(process.env.CAL_COM_BOOKING_URL)],
  ];

  return (
    <section className="mt-16 border-t border-steel/40 pt-10">
      <h2 className="mono-label text-paper/50">Wiring</h2>
      <p className="mt-3 max-w-2xl text-body text-paper/60">
        Environment checks only — no secret values. Import{" "}
        <code className="font-mono text-paper/80">n8n/speed-to-lead.json</code>{" "}
        into local n8n, then set the n8n env vars listed in{" "}
        <code className="font-mono text-paper/80">.env.example</code>.
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {rows.map(([label, ok]) => (
          <li key={label} className="flex items-center justify-between gap-4">
            <span className="text-body text-paper/70">{label}</span>
            <span className="mono-label text-paper/50">
              {ok ? "set" : "missing"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
