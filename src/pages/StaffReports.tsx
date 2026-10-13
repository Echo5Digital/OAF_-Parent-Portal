import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { staffNavItems } from "../components/staffNav";
import { config } from "../lib/config";
import * as api from "../lib/api";
import type { StaffChild, StaffDashboardStats } from "../lib/api";

const API_CONFIGURED = Boolean(config.apiBaseUrl);

const MOCK_CHILDREN: StaffChild[] = [
  { id: "emma", name: "Emma R.", dateOfBirth: null, classification: "TFC", isItfc: false, therapistName: null, householdLabel: null, placementType: "foster" },
  { id: "liam", name: "Liam T.", dateOfBirth: null, classification: "ITFC", isItfc: true, therapistName: null, householdLabel: null, placementType: "foster" },
  { id: "sophie", name: "Sophie M.", dateOfBirth: null, classification: "CFC", isItfc: false, therapistName: null, householdLabel: null, placementType: "respite" },
];

export function StaffReports() {
  const [stats, setStats] = useState<StaffDashboardStats | null>(null);
  const [children, setChildren] = useState<StaffChild[]>(MOCK_CHILDREN);
  const [loading, setLoading] = useState(API_CONFIGURED);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    Promise.all([api.getStaffDashboard(), api.getStaffChildren()])
      .then(([dashboard, childrenRes]) => {
        setStats(dashboard.stats);
        setChildren(childrenRes.children);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const classificationCounts = children.reduce<Record<string, number>>((acc, c) => {
    acc[c.classification] = (acc[c.classification] ?? 0) + 1;
    return acc;
  }, {});
  const totalChildren = children.length;
  const completionRate =
    stats && stats.activeChildren > 0
      ? Math.round(((stats.activeChildren - stats.pendingWeeklyLogs) / stats.activeChildren) * 100)
      : null;

  return (
    <AppShell userName="Maria Thompson" userRole="Program Director" userInitials="MT" userPhoto="https://i.pravatar.cc/80?img=5" navItems={staffNavItems(0)}>
      <div className="page-head">
        <h1>Reports</h1>
        <p>Operational metrics computed directly from the database.</p>
      </div>

      {!API_CONFIGURED ? (
        <div className="isolation-note" style={{ borderColor: "var(--warn, #c6881a)" }}>
          <span>
            <b>Showing sample data.</b> Connect a backend (set VITE_API_BASE_URL) to see real metrics.
          </span>
        </div>
      ) : loadError ? (
        <div className="isolation-note" style={{ borderColor: "var(--danger, #c0392b)" }}>
          <span>Couldn't load live report data: {loadError}. Showing sample data instead.</span>
        </div>
      ) : null}

      <div className="table-card" style={{ marginBottom: 20 }}>
        <div className="table-card-head">
          <h3>Classification Breakdown</h3>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Classification</th>
                <th>Children</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3}>Loading…</td>
                </tr>
              ) : (
                (["TFC", "ITFC", "CFC"] as const).map((cls) => (
                  <tr key={cls}>
                    <td>{cls}</td>
                    <td>{classificationCounts[cls] ?? 0}</td>
                    <td>{totalChildren > 0 ? Math.round(((classificationCounts[cls] ?? 0) / totalChildren) * 100) : 0}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-head">
          <h3>Documentation Compliance</h3>
        </div>
        <div style={{ padding: "16px 20px", fontSize: 14.5 }}>
          {loading ? (
            "Loading…"
          ) : completionRate !== null ? (
            <p style={{ margin: 0 }}>
              <b>{completionRate}%</b> of active children have a completed or in-progress weekly log for the current week (
              {stats?.pendingWeeklyLogs ?? 0} still pending, {stats?.awaitingTherapistSignature ?? 0} awaiting therapist signature).
            </p>
          ) : (
            <p style={{ margin: 0, color: "var(--ink-faint)" }}>Not enough data to compute a compliance rate yet.</p>
          )}
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 14 }}>
        This is a first, database-only reporting pass — natural-language questions, trend charts, and exports are part of the AI
        Insights work and haven't been built yet.
      </p>
    </AppShell>
  );
}
