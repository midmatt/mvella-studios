import type { Metadata } from "next";
import DashboardLoginForm from "@/components/ai-systems/DashboardLoginForm";

export const metadata: Metadata = {
  title: "Demo dashboard login — MVella Studios",
  robots: { index: false, follow: false },
};

export default function DemoDashboardLoginPage() {
  return (
    <div className="pt-16">
      <section className="bg-ink">
        <div className="mx-auto max-w-xl px-6 py-24">
          <p className="mono-label text-phosphor">&gt; ./speed-to-lead --auth</p>
          <h1 className="mt-4 font-display text-h2 text-paper">
            Demo dashboard
          </h1>
          <p className="mt-6 text-body text-paper/70">
            Internal Speed-to-Lead view. Production contact submissions are
            not in this list.
          </p>
          <div className="mt-10">
            <DashboardLoginForm />
          </div>
        </div>
      </section>
    </div>
  );
}
