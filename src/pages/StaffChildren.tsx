import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { staffNavItems } from "../components/staffNav";
import { config } from "../lib/config";
import * as api from "../lib/api";
import type { StaffChild } from "../lib/api";

const MOCK_CHILDREN: StaffChild[] = [
  {
    id: "emma",
    name: "Emma R.",
    dateOfBirth: "2017-03-14",
    classification: "TFC",
    isItfc: false,
    therapistName: "Dr. Maria Lopez, BCBA",
    householdLabel: "Smith Household",
    placementType: "foster",
  },
  {
    id: "liam",
    name: "Liam T.",
    dateOfBirth: "2014-07-02",
    classification: "ITFC",
    isItfc: true,
    therapistName: "Dr. James Carter, LPC",
    householdLabel: "Smith Household",
    placementType: "foster",
  },
  {
    id: "sophie",
    name: "Sophie M.",
    dateOfBirth: "2019-11-20",
    classification: "CFC",
    isItfc: false,
    therapistName: "Dr. Maria Lopez, BCBA",
    householdLabel: "Smith Household",
    placementType: "respite",
  },
];

const API_CONFIGURED = Boolean(config.apiBaseUrl);

function ageFromDob(dob: string | null): string {
  if (!dob) return "—";
  const birth = new Date(dob);
  const ageMs = Date.now() - birth.getTime();
  return String(Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25)));
}

export function StaffChildren() {
  const [children, setChildren] = useState<StaffChild[]>(MOCK_CHILDREN);
  const [loading, setLoading] = useState(API_CONFIGURED);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    api
      .getStaffChildren()
      .then(({ children: real }) => {
        setChildren(real);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load children"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell userName="Maria Thompson" userRole="Program Director" userInitials="MT" userPhoto="https://i.pravatar.cc/80?img=5" navItems={staffNavItems(0)}>
      <div className="page-head">
        <h1>Children</h1>
        <p>All children in the program: classification, current placement, and assigned therapist.</p>
      </div>

      {!API_CONFIGURED ? (
        <div className="isolation-note" style={{ borderColor: "var(--warn, #c6881a)" }}>
          <span>
            <b>Showing sample data.</b> Connect a backend (set VITE_API_BASE_URL) to see real child records.
          </span>
        </div>
      ) : loadError ? (
        <div className="isolation-note" style={{ borderColor: "var(--danger, #c0392b)" }}>
          <span>Couldn't load live child data: {loadError}. Showing sample data instead.</span>
        </div>
      ) : null}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Child</th>
                <th>Age</th>
                <th>Classification</th>
                <th>Placement</th>
                <th>Household</th>
                <th>Assigned Therapist</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>Loading…</td>
                </tr>
              ) : (
                children.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.name}
                      {c.isItfc ? (
                        <span className="pill pending" style={{ marginLeft: 8 }}>
                          ITFC
                        </span>
                      ) : null}
                    </td>
                    <td>{ageFromDob(c.dateOfBirth)}</td>
                    <td>{c.classification}</td>
                    <td>{c.placementType === "respite" ? "Respite" : c.placementType === "foster" ? "Foster (household)" : "Unassigned"}</td>
                    <td>{c.householdLabel ?? "—"}</td>
                    <td>{c.therapistName ?? "—"}</td>
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
