/**
 * Branded HTML email rendering for /api/contact and /api/agreement.
 *
 * Every email keeps a plain-text version alongside the HTML (Resend's
 * `text` + `html` fields) — text is the accessibility/deliverability
 * fallback, HTML is what most clients show.
 *
 * Email-client constraints shape everything here: styles are inline (no
 * stylesheets), layout is tables (no flex/grid), no images or webfonts.
 * The palette is the site's own — ink/panel/steel/paper/phosphor — with an
 * explicit bgcolor so the panel reads correctly in both light- and
 * dark-mode clients.
 *
 * ⚠️ SECURITY: every user-supplied string MUST pass through esc() before
 * entering HTML. Names, messages, and company fields are attacker-supplied
 * input into an email rendered in Matthew's inbox.
 */
const INK = "#0B0B0A";
const PANEL = "#171715";
const STEEL = "#3D3B3A";
const PAPER = "#F6F5EF";
const PAPER_DIM = "#a8a79f";
const PHOSPHOR = "#E8A33D";

const MONO =
  "'SF Mono','JetBrains Mono',Menlo,Consolas,'Liberation Mono',monospace";
const BODY_FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/** HTML-escape user-supplied text. */
export function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailBlock =
  /** Body paragraph. `html` is TRUSTED markup — esc() anything user-supplied. */
  | { kind: "p"; html: string }
  /** Label/value rows in the site's readout voice. Values pre-escaped by caller. */
  | { kind: "rows"; rows: Array<[label: string, valueHtml: string]> }
  /** Mono block, e.g. a quote breakdown. Lines pre-escaped by caller. */
  | { kind: "mono"; lines: string[] }
  /** Phosphor CTA button. */
  | { kind: "button"; label: string; url: string }
  | { kind: "divider" };

function renderBlock(block: EmailBlock): string {
  switch (block.kind) {
    case "p":
      return `<p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:15px;line-height:1.65;color:${PAPER};">${block.html}</p>`;

    case "rows":
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-collapse:collapse;">${block.rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:3px 18px 3px 0;font-family:${MONO};font-size:12px;letter-spacing:1px;color:${PAPER_DIM};vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:3px 0;font-family:${MONO};font-size:13px;color:${PAPER};">${value}</td></tr>`
        )
        .join("")}</table>`;

    case "mono":
      return `<div style="margin:0 0 16px;padding:14px 16px;border:1px solid ${STEEL};background-color:${INK};font-family:${MONO};font-size:13px;line-height:1.7;color:${PAPER};">${block.lines.join("<br>")}</div>`;

    case "button":
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;"><tr><td bgcolor="${PHOSPHOR}" style="border-radius:2px;"><a href="${block.url}" style="display:inline-block;padding:12px 24px;font-family:${MONO};font-size:13px;letter-spacing:1px;text-transform:uppercase;color:${INK};text-decoration:none;font-weight:bold;">${block.label}</a></td></tr></table>`;

    case "divider":
      return `<hr style="margin:20px 0;border:0;border-top:1px solid ${STEEL};">`;
  }
}

/** Phosphor-accented mono line for inside a `mono` block. */
export function monoAccent(text: string): string {
  return `<span style="color:${PHOSPHOR};">${text}</span>`;
}

export function link(url: string, label?: string): string {
  return `<a href="${url}" style="color:${PHOSPHOR};">${label ?? url}</a>`;
}

/**
 * Full email document: ink background, bordered panel, "> eyebrow" header
 * in the site's terminal voice, blocks, and the studio footer.
 */
export function renderEmail({
  eyebrow,
  blocks,
}: {
  /** The terminal-voice header line, without the leading "> ". */
  eyebrow: string;
  blocks: EmailBlock[];
}): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background-color:${INK};" bgcolor="${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${INK}" style="background-color:${INK};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <tr><td bgcolor="${PANEL}" style="background-color:${PANEL};border:1px solid ${STEEL};padding:28px;">
          <p style="margin:0 0 20px;font-family:${MONO};font-size:13px;letter-spacing:1px;color:${PHOSPHOR};">&gt; ${eyebrow}</p>
          ${blocks.map(renderBlock).join("\n")}
        </td></tr>
        <tr><td style="padding:18px 4px;">
          <p style="margin:0;font-family:${MONO};font-size:11px;letter-spacing:1px;color:${PAPER_DIM};">MVELLA STUDIOS · SOUTH FLORIDA</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
