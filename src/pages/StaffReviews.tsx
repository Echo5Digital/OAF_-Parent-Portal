import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { staffNavItems } from "../components/staffNav";
import { config } from "../lib/config";
import * as api from "../lib/api";
import type { StaffForm } from "../lib/api";

const MOCK_REVIEWS: StaffForm[] = [
  {
    id: "mock-3",
    weekStartDate: "2026-10-05",
    status: "awaiting_therapist_review",
    parentName: "Jessica Smith",
    childName: "Sophie M.",
    parentSignedAt: "2026-10-11T14:00:00Z",
    therapistSignedAt: null,
    openCorrections: 0,
  },
];

const API_CONFIGURED = Boolean(config.apiBaseUrl);

export function StaffReviews() {
  const [reviews, setReviews] = useState<StaffForm[]>(MOCK_REVIEWS);
  const [loading, setLoading] = useState(API_CONFIGURED);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    api
      .getStaffForms("awaiting_therapist_review")
      .then(({ forms }) => {
        setReviews(forms);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load reviews"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell
      userName="Maria Thompson"
      userRole="Program Director"
      userInitials="MT"
      userPhoto="https://i.pravatar.cc/80?img=5"
      navItems={staffNavItems(loading ? 0 : reviews.length)}
    >
      <div className="page-head">
        <h1>Reviews</h1>
        <p>Weekly logs signed by the foster parent and waiting on a therapist signature.</p>
      </div>

      {!API_CONFIGURED ? (
        <div className="isolation-note" style={{ borderColor: "var(--warn, #c6881a)" }}>
          <span>
            <b>Showing sample data.</b> Connect a backend (set VITE_API_BASE_URL) to see the real review queue.
          </span>
        </div>
      ) : loadError ? (
        <div className="isolation-note" style={{ borderColor: "var(--danger, #c0392b)" }}>
          <span>Couldn't load live review data: {loadError}. Showing sample data instead.</span>
        </div>
      ) : null}

      <div className="table-card">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Week Of</th>
                <th>Parent</th>
                <th>Child</th>
                <th>Parent Signed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4}>Loading…</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={4}>Nothing awaiting therapist review right now.</td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.weekStartDate}</td>
                    <td>{r.parentName}</td>
                    <td>{r.childName}</td>
                    <td className="mono">{r.parentSignedAt ? new Date(r.parentSignedAt).toLocaleString() : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-faint)", marginTop: 14 }}>
        Adding a therapist signature from this screen isn't wired up yet — that needs a therapist-facing sign-in flow, which is a
        later phase.
      </p>
    </AppShell>
  );
}
