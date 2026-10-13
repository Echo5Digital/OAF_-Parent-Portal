import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { staffNavItems } from "../components/staffNav";
import { config } from "../lib/config";
import * as api from "../lib/api";
import type { StaffDashboardStats, StaffDashboardSubmission } from "../lib/api";

type Submission = {
  date: string;
  parent: string;
  child: string;
  week: string;
  status: "Saved" | "Pending Review" | "Needs Correction" | "Approved";
};

const MOCK_STATS: StaffDashboardStats = {
  activeFosterHomes: 124,
  activeChildren: 187,
  pendingWeeklyLogs: 23,
  awaitingTherapistSignature: 12,
  openCorrectionRequests: 5,
};

const MOCK_SUBMISSIONS: Submission[] = [
  { date: "Oct 8, 2024", parent: "Jessica Smith", child: "Emma R.", week: "Oct 7–13", status: "Saved" },
  { date: "Oct 8, 2024", parent: "Michael Brown", child: "Liam T.", week: "Oct 7–13", status: "Pending Review" },
  { date: "Oct 7, 2024", parent: "Sarah Davis", child: "Sophie M.", week: "Sep 30–Oct 6", status: "Needs Correction" },
  { date: "Oct 7, 2024", parent: "Jennifer Wilson", child: "Noah K.", week: "Sep 30–Oct 6", status: "Approved" },
  { date: "Oct 6, 2024", parent: "Robert Garcia", child: "Ava L.", week: "Sep 30–Oct 6", status: "Pending Review" },
];

const STATUS_CLASS: Record<Submission["status"], string> = {
  Saved: "saved",
  "Pending Review": "pending",
  "Needs Correction": "correction",
  Approved: "approved",
};

const API_CONFIGURED = Boolean(config.apiBaseUrl);

function mapBackendStatus(status: string): Submission["status"] {
  switch (status) {
    case "completed":
      return "Approved";
    case "awaiting_therapist_review":
      return "Pending Review";
    case "changes_requested":
      return "Needs Correction";
    default:
      return "Saved";
  }
}

function toSubmissionRow(s: StaffDashboardSubmission): Submission {
  const date = s.submittedAt ? new Date(s.submittedAt) : null;
  const weekStart = new Date(s.weekStartDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    date: date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
    parent: s.parentName,
    child: s.childName,
    week: `${fmt(weekStart)}–${weekEnd.getUTCDate()}`,
    status: mapBackendStatus(s.status),
  };
}

export function StaffDashboard() {
  const [stats, setStats] = useState<StaffDashboardStats>(MOCK_STATS);
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(API_CONFIGURED);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    api
      .getStaffDashboard()
      .then(({ stats: realStats, recentSubmissions }) => {
        setStats(realStats);
        setSubmissions(recentSubmissions.map(toSubmissionRow));
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      userName="Maria Thompson"
      userRole="Program Director"
      userInitials="MT"
      userPhoto="https://i.pravatar.cc/80?img=5"
      navItems={staffNavItems(loading ? 0 : stats.awaitingTherapistSignature)}
    >
      <div className="page-head">
        <h1>Staff Dashboard</h1>
        <p>Overview of foster care program activity and documentation status.</p>
      </div>

      {!API_CONFIGURED ? (
        <div className="isolation-note" style={{ borderColor: "var(--warn, #c6881a)" }}>
          <span>
            <b>Showing sample data.</b> Connect a backend (set VITE_API_BASE_URL) to see real counts from the database.
          </span>
        </div>
      ) : loadError ? (
        <div className="isolation-note" style={{ borderColor: "var(--danger, #c0392b)" }}>
          <span>Couldn't load live dashboard data: {loadError}. Showing sample data instead.</span>
        </div>
      ) : null}

      <div className="stat-row">
        <div className="stat-tile">
          <div className="num">{loading ? "—" : stats.activeFosterHomes}</div>
          <div className="lbl">Active Foster Homes</div>
        </div>
        <div className="stat-tile accent">
          <div className="num">{loading ? "—" : stats.activeChildren}</div>
          <div className="lbl">Active Children</div>
        </div>
        <div className="stat-tile warn">
          <div className="num">{loading ? "—" : stats.pendingWeeklyLogs}</div>
          <div className="lbl">Pending Weekly Logs</div>
        </div>
        <div className="stat-tile warn">
          <div className="num">{loading ? "—" : stats.awaitingTherapistSignature}</div>
          <div className="lbl">Awaiting Therapist Signature</div>
        </div>
        <div className="stat-tile danger">
          <div className="num">{loading ? "—" : stats.openCorrectionRequests}</div>
          <div className="lbl">Open Correction Requests</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-head">
          <h3>Recent Submissions</h3>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Parent</th>
                <th>Child</th>
                <th>Week Of</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s, i) => (
                <tr key={i}>
                  <td className="mono">{s.date}</td>
                  <td>{s.parent}</td>
                  <td>{s.child}</td>
                  <td className="mono">{s.week}</td>
                  <td>
                    <span className={`pill ${STATUS_CLASS[s.status]}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
