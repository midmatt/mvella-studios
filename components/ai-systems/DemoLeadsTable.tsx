import type { DemoLead } from "@/lib/ai-systems/types";

const STATUS_LABEL: Record<DemoLead["call_status"], string> = {
  pending: "Pending",
  qualifying: "Qualifying",
  dialing: "Dialing",
  ringing: "Ringing",
  answered: "Answered",
  no_answer: "No answer",
  voicemail: "Voicemail",
  busy: "Busy",
  sms_sent: "SMS sent",
  booked: "Booked",
  failed: "Failed",
  consent_declined: "Consent declined",
};

export default function DemoLeadsTable({ leads }: { leads: DemoLead[] }) {
  if (leads.length === 0) {
    return (
      <p className="border border-steel/40 bg-panel px-6 py-10 text-body text-paper/70">
        No demo leads yet. Submit{" "}
        <a
          href="/ai-systems"
          className="text-paper underline-offset-4 hover:text-phosphor hover:underline"
        >
          /ai-systems
        </a>{" "}
        with a phone you can answer.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-steel/40">
      <table className="min-w-full text-left">
        <thead className="border-b border-steel/40 bg-panel">
          <tr>
            {[
              "Submitted",
              "Name",
              "Phone",
              "Service",
              "Score",
              "Response",
              "Status",
              "Booked",
            ].map((heading) => (
              <th
                key={heading}
                className="mono-label whitespace-nowrap px-4 py-3 text-paper/50"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b border-steel/20 last:border-b-0">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-paper/70">
                {formatClock(lead.submitted_at)}
              </td>
              <td className="px-4 py-3 text-paper">{lead.name}</td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-paper/80">
                {lead.phone}
              </td>
              <td className="px-4 py-3 text-paper/80">{lead.service_type}</td>
              <td className="px-4 py-3 font-mono text-sm text-paper/80">
                {lead.qualification_score ?? "—"}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-phosphor">
                {formatResponse(lead.response_time_seconds)}
              </td>
              <td className="px-4 py-3 text-paper/80">
                {STATUS_LABEL[lead.call_status]}
              </td>
              <td className="px-4 py-3 font-mono text-sm">
                {lead.booked ? (
                  <span className="text-phosphor">Yes</span>
                ) : (
                  <span className="text-paper/40">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatResponse(seconds: number | null): string {
  if (seconds == null) return "—";
  if (seconds < 10) return `${seconds.toFixed(1)}s`;
  return `${Math.round(seconds)}s`;
}
