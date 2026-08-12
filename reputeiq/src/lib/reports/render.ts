import type { Report, ReportSection } from "@prisma/client";

import { formatWindowLabel } from "@/lib/analytics/windows";

/**
 * Renders a stored report as inline-styled HTML for email.
 *
 * Renders from the same `Report` + `ReportSection` rows the web view reads, so
 * the email and the app cannot disagree. Table-based layout and inline styles
 * because email clients are what they are.
 */

type ReportWithSections = Report & { sections: ReportSection[] };

const COLORS = {
  ink: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  bg: "#f9fafb",
  accent: "#1d4ed8",
  negative: "#b91c1c",
  positive: "#047857",
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type SectionData = Record<string, unknown>;

function dataOf(section: ReportSection): SectionData {
  return (section.data as SectionData | null) ?? {};
}

function statRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0;color:${COLORS.muted};font-size:14px;">${escapeHtml(label)}</td>
      <td style="padding:6px 0;text-align:right;color:${COLORS.ink};font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
    </tr>`;
}

function renderTopicList(
  topics: Array<Record<string, unknown>>,
  tone: "positive" | "negative",
): string {
  if (topics.length === 0) {
    return `<p style="margin:0;color:${COLORS.muted};font-size:14px;">Nothing to report for this period.</p>`;
  }

  const color = tone === "negative" ? COLORS.negative : COLORS.positive;

  return topics
    .slice(0, 4)
    .map((topic) => {
      const label = String(topic.label ?? "");
      const mentions = Number(topic.mentions ?? 0);
      const relevant =
        tone === "negative"
          ? Number(topic.negativeMentions ?? 0)
          : Number(topic.positiveMentions ?? 0);
      const trend = topic.trendPercent;

      const trendText =
        typeof trend === "number"
          ? ` &middot; ${trend > 0 ? "+" : ""}${trend.toFixed(0)}% vs previous period`
          : "";

      const quotes = Array.isArray(topic.quotes)
        ? (topic.quotes as string[]).slice(0, 1)
        : [];

      return `
        <div style="margin:0 0 14px 0;padding:12px 14px;background:${COLORS.bg};border-left:3px solid ${color};">
          <div style="font-size:15px;font-weight:600;color:${COLORS.ink};">${escapeHtml(label)}</div>
          <div style="font-size:13px;color:${COLORS.muted};margin-top:2px;">
            ${mentions} mention${mentions === 1 ? "" : "s"} &middot; ${relevant} ${tone}${trendText}
          </div>
          ${
            quotes[0]
              ? `<div style="font-size:13px;color:${COLORS.ink};margin-top:8px;font-style:italic;">&ldquo;${escapeHtml(quotes[0])}&rdquo;</div>`
              : ""
          }
        </div>`;
    })
    .join("");
}

function renderRecommendations(items: Array<Record<string, unknown>>): string {
  if (items.length === 0) {
    return `<p style="margin:0;color:${COLORS.muted};font-size:14px;">No recommendations for this period.</p>`;
  }

  return items
    .map(
      (item, index) => `
      <div style="margin:0 0 16px 0;">
        <div style="font-size:15px;font-weight:600;color:${COLORS.ink};">
          ${index + 1}. ${escapeHtml(String(item.title ?? ""))}
          <span style="font-weight:400;font-size:12px;color:${COLORS.muted};">&nbsp;&middot;&nbsp;${escapeHtml(String(item.priority ?? ""))} priority</span>
        </div>
        <div style="font-size:14px;color:${COLORS.ink};margin-top:6px;line-height:1.5;">${escapeHtml(String(item.action ?? ""))}</div>
        <div style="font-size:13px;color:${COLORS.muted};margin-top:6px;line-height:1.5;">${escapeHtml(String(item.rationale ?? ""))}</div>
      </div>`,
    )
    .join("");
}

function renderSection(section: ReportSection): string {
  const data = dataOf(section);

  let extra = "";

  switch (section.key) {
    case "reputation-score": {
      const score = data.score;
      const delta = data.delta;
      extra = `
        <div style="margin:12px 0 4px 0;">
          <span style="font-size:40px;font-weight:700;color:${COLORS.ink};line-height:1;">${score === null || score === undefined ? "—" : escapeHtml(String(score))}</span>
          <span style="font-size:16px;color:${COLORS.muted};">/100</span>
          ${
            typeof delta === "number" && delta !== 0
              ? `<span style="font-size:14px;margin-left:10px;color:${delta > 0 ? COLORS.positive : COLORS.negative};">${delta > 0 ? "▲" : "▼"} ${Math.abs(delta)}</span>`
              : ""
          }
        </div>`;
      break;
    }
    case "review-performance": {
      const rows = [
        statRow("Reviews", String(data.count ?? 0)),
        statRow(
          "Average rating",
          typeof data.averageRating === "number" ? data.averageRating.toFixed(2) : "—",
        ),
        statRow(
          "Positive",
          typeof data.positiveRate === "number"
            ? `${(data.positiveRate * 100).toFixed(0)}%`
            : "—",
        ),
        statRow(
          "Negative",
          typeof data.negativeRate === "number"
            ? `${(data.negativeRate * 100).toFixed(0)}%`
            : "—",
        ),
      ].join("");
      extra = `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">${rows}</table>`;
      break;
    }
    case "customers-love":
      extra = renderTopicList(
        (data.topics as Array<Record<string, unknown>>) ?? [],
        "positive",
      );
      break;
    case "biggest-problems":
      extra = renderTopicList(
        (data.topics as Array<Record<string, unknown>>) ?? [],
        "negative",
      );
      break;
    case "recommended-actions":
      extra = renderRecommendations(
        (data.recommendations as Array<Record<string, unknown>>) ?? [],
      );
      break;
    default:
      extra = "";
  }

  return `
    <tr>
      <td style="padding:22px 28px;border-top:1px solid ${COLORS.border};">
        <div style="font-size:12px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${COLORS.muted};">
          ${escapeHtml(section.title)}
        </div>
        ${section.body ? `<p style="margin:10px 0 0 0;font-size:15px;line-height:1.6;color:${COLORS.ink};">${escapeHtml(section.body)}</p>` : ""}
        ${extra ? `<div style="margin-top:14px;">${extra}</div>` : ""}
      </td>
    </tr>`;
}

export function renderReportHtml(
  report: ReportWithSections,
  business: { name: string },
  appUrl: string,
): string {
  const periodLabel = formatWindowLabel({
    start: report.periodStart,
    end: report.periodEnd,
  });

  const sections = [...report.sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => renderSection(section))
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px 12px;background:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid ${COLORS.border};">
      <tr>
        <td style="padding:28px 28px 20px 28px;">
          <div style="font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${COLORS.accent};">
            ReputeIQ &middot; ${report.type === "WEEKLY" ? "Weekly" : "Monthly"} report
          </div>
          <div style="font-size:22px;font-weight:700;color:${COLORS.ink};margin-top:8px;">${escapeHtml(business.name)}</div>
          <div style="font-size:14px;color:${COLORS.muted};margin-top:2px;">${escapeHtml(periodLabel)}</div>
        </td>
      </tr>
      ${sections}
      <tr>
        <td style="padding:20px 28px;border-top:1px solid ${COLORS.border};background:${COLORS.bg};">
          <a href="${escapeHtml(appUrl)}/reports/${escapeHtml(report.id)}" style="color:${COLORS.accent};font-size:14px;text-decoration:none;font-weight:600;">
            View the full report &rarr;
          </a>
          <p style="margin:14px 0 0 0;font-size:12px;line-height:1.5;color:${COLORS.muted};">
            Every figure in this report is computed from your review data. ReputeIQ flags reviews that may need attention but does not provide legal or medical advice.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderReportText(
  report: ReportWithSections,
  business: { name: string },
): string {
  const periodLabel = formatWindowLabel({
    start: report.periodStart,
    end: report.periodEnd,
  });

  const lines = [
    `ReputeIQ ${report.type === "WEEKLY" ? "weekly" : "monthly"} report`,
    business.name,
    periodLabel,
    "",
  ];

  for (const section of [...report.sections].sort((a, b) => a.order - b.order)) {
    lines.push(section.title.toUpperCase(), section.body, "");
  }

  lines.push(
    "Every figure in this report is computed from your review data.",
    "ReputeIQ flags reviews that may need attention but does not provide legal or medical advice.",
  );

  return lines.join("\n");
}

export function reportSubject(
  report: ReportWithSections,
  business: { name: string },
): string {
  const scoreText =
    report.reputationScore !== null ? ` — score ${report.reputationScore}/100` : "";
  return `${business.name}: ${report.type === "WEEKLY" ? "weekly" : "monthly"} reputation report${scoreText}`;
}
