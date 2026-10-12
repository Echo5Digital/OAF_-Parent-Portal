import { useState } from "react";
import { AppShell } from "../components/AppShell";
import {
  ChildIcon,
  DocIcon,
  FlagCheckIcon,
  GridIcon,
  ReportsIcon,
  SettingsIcon,
  SparkleIcon,
  UsersIcon,
} from "../components/Icons";
import { useToast } from "../components/Toast";

const SUGGESTED = [
  "Which parents haven't completed this week's logs?",
  "Summarize behavioral trends, last 30 days",
  "Logs awaiting therapist signature",
  "TFC vs ITFC vs CFC active counts",
  "Households with repeated corrections",
];

const FLAGGED = [
  { household: "Davis Household", missed: 3, last: "Sep 22, 2024", trend: "Declining" as const },
  { household: "Brown Household", missed: 2, last: "Sep 29, 2024", trend: "Flat" as const },
  { household: "Garcia Household", missed: 2, last: "Oct 1, 2024", trend: "Improving" as const },
];

const TREND_CLASS: Record<string, string> = {
  Declining: "correction",
  Flat: "pending",
  Improving: "approved",
};

const BARS = [
  { label: "Sep 1", pct: 62, muted: true },
  { label: "Sep 8", pct: 70, muted: true },
  { label: "Sep 15", pct: 68, muted: true },
  { label: "Sep 22", pct: 79, muted: false },
  { label: "Sep 29", pct: 84, muted: false },
  { label: "Oct 6", pct: 87, muted: false },
];

export function AiInsights() {
  const [query, setQuery] = useState(
    "Show documentation compliance rate for the last 30 days, broken down by household"
  );
  const { showToast } = useToast();

  return (
    <AppShell
      userName="Brandon Hale"
      userRole="Executive Director"
      userInitials="BH"
      userPhoto="https://i.pravatar.cc/80?img=13"
      navItems={[
        { label: "Dashboard", icon: <GridIcon />, to: "/ai" },
        { label: "Parents", icon: <UsersIcon />, to: "/ai" },
        { label: "Children", icon: <ChildIcon />, to: "/ai" },
        { label: "Forms", icon: <DocIcon size={16} />, to: "/ai" },
        { label: "AI Insights & Reporting", icon: <SparkleIcon size={16} />, to: "/ai" },
        { label: "Reports", icon: <ReportsIcon />, to: "/ai" },
        { label: "Settings", icon: <SettingsIcon />, to: "/ai" },
      ]}
    >
      <div className="page-head">
        <h1>AI Insights &amp; Reporting</h1>
        <p>Get insights from your data to improve documentation and program outcomes.</p>
      </div>

      <div className="ai-ask">
        <SparkleIcon size={18} />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="btn btn-primary" onClick={() => showToast("Query run against authorized records — summary updated below")}>
          Ask
        </button>
      </div>
      <div className="ai-disclaimer">
        AI answers are generated from authorized, permissioned records only — for reporting support, not clinical or
        placement decisions.
      </div>
      <div className="ai-chips">
        {SUGGESTED.map((s) => (
          <div key={s} className="ai-chip" onClick={() => setQuery(s)}>
            {s}
          </div>
        ))}
      </div>

      <div className="ai-grid">
        <div>
          <div className="ai-summary-card">
            <div className="tag">
              <FlagCheckIcon size={13} />
              AI Summary
            </div>
            <p>
              Documentation compliance over the last 30 days is <b>87%</b>, up 12% from the prior period. 6
              households account for 70% of late or missing logs — the Davis and Brown households each missed 2+
              consecutive weeks. Correction requests are down 18%, and therapist signature turnaround improved to an
              average of 1.4 days.
            </p>
            <div className="ai-refs">
              <span className="ai-ref">household #0412</span>
              <span className="ai-ref">household #0188</span>
              <span className="ai-ref">12 weekly logs</span>
              <span className="ai-ref">query: compliance_30d</span>
            </div>
          </div>
          <div className="table-card">
            <div className="table-card-head">
              <h3>Households Flagged for Follow-Up</h3>
              <span className="link">Export →</span>
            </div>
            <div className="table-scroll">
              <table className="data">
                <thead>
                  <tr>
                    <th>Household</th>
                    <th>Missed Logs (30d)</th>
                    <th>Last Submitted</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {FLAGGED.map((f) => (
                    <tr key={f.household}>
                      <td>{f.household}</td>
                      <td className="mono">{f.missed}</td>
                      <td className="mono">{f.last}</td>
                      <td>
                        <span className={`pill ${TREND_CLASS[f.trend]}`}>{f.trend}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div className="chart-card" style={{ marginBottom: 18 }}>
            <h4>Documentation Compliance Rate — Weekly</h4>
            <div className="bars">
              {BARS.map((b) => (
                <div
                  key={b.label}
                  className="bar"
                  style={{ height: `${b.pct}%`, background: b.muted ? "var(--border-strong)" : undefined }}
                >
                  <span>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="kpi-row">
            <div className="stat-tile accent">
              <div className="num">87%</div>
              <div className="lbl">Compliance Rate</div>
            </div>
            <div className="stat-tile">
              <div className="num">1.4d</div>
              <div className="lbl">Avg. Signature Turnaround</div>
            </div>
            <div className="stat-tile danger">
              <div className="num">5</div>
              <div className="lbl">Open Corrections</div>
            </div>
            <div className="stat-tile warn">
              <div className="num">92%</div>
              <div className="lbl">Therapist Sign Completion</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
