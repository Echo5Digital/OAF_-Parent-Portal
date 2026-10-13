import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { staffNavItems } from "../components/staffNav";
import { config } from "../lib/config";
import * as api from "../lib/api";
import type { StaffParent } from "../lib/api";

const MOCK_PARENTS: StaffParent[] = [
  {
    userId: "mock-1",
    name: "Jessica Smith",
    email: "jessica.smith@example.com",
    isActive: true,
    householdId: "mock-household-1",
    householdLabel: "Smith Household",
    children: [
      { id: "emma", name: "Emma R." },
      { id: "liam", name: "Liam T." },
      { id: "sophie", name: "Sophie M." },
    ],
  },
];

const API_CONFIGURED = Boolean(config.apiBaseUrl);

export function StaffParents() {
  const [parents, setParents] = useState<StaffParent[]>(MOCK_PARENTS);
  const [loading, setLoading] = useState(API_CONFIGURED);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    api
      .getStaffParents()
      .then(({ parents: real }) => {
        setParents(real);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load parents"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell userName="Maria Thompson" userRole="Program Director" userInitials="MT" userPhoto="https://i.pravatar.cc/80?img=5" navItems={staffNavItems(0)}>
      <div className="page-head">
        <h1>Parents</h1>
        <p>Foster parent accounts, their households, and currently assigned children.</p>
      </div>

      {!API_CONFIGURED ? (
        <div className="isolation-note" style={{ borderColor: "var(--warn, #c6881a)" }}>
          <span>
            <b>Showing sample data.</b> Connect a backend (set VITE_API_BASE_URL) to see real parent accounts.
          </span>
        </div>
      ) : loadError ? (
        <div className="isolation-note" style={{ borderColor: "var(--danger, #c0392b)" }}>
          <span>Couldn't load live parent data: {loadError}. Showing sample data instead.</span>
        </div>
      ) : null}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Parent</th>
                <th>Email</th>
                <th>Household</th>
                <th>Assigned Children</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Loading…</td>
                </tr>
              ) : (
                parents.map((p) => (
                  <tr key={p.userId}>
                    <td>{p.name}</td>
                    <td className="mono">{p.email}</td>
                    <td>{p.householdLabel ?? "—"}</td>
                    <td>{p.children.length > 0 ? p.children.map((c) => c.name).join(", ") : "None assigned"}</td>
                    <td>
                      <span className={`pill ${p.isActive ? "approved" : "correction"}`}>{p.isActive ? "Active" : "Inactive"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
