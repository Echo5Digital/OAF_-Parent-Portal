import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import { staffNavItems } from "../components/staffNav";
import { config } from "../lib/config";
import * as api from "../lib/api";
import type { StaffForm } from "../lib/api";

const MOCK_FORMS: StaffForm[] = [
  {
    id: "mock-1",
    weekStartDate: "2026-10-05",
    status: "completed",
    parentName: "Jessica Smith",
    childName: "Emma R.",
    parentSignedAt: "2026-10-11T10:00:00Z",
    therapistSignedAt: "2026-10-12T09:00:00Z",
    openCorrections: 0,
  },
  {
    id: "mock-2",
    weekStartDate: "2026-10-05",
    status: "in_progress",
    parentName: "Jessica Smith",
    childName: "Liam T.",
    parentSignedAt: null,
    therapistSignedAt: null,
    openCorrections: 0,
  },
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

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In Progress",
  awaiting_therapist_review: "Awaiting Therapist Review",
  changes_requested: "Changes Requested",
  completed: "Completed",
};

const STATUS_CLASS: Record<string, string> = {
  in_progress: "saved",
  awaiting_therapist_review: "pending",
  changes_requested: "correction",
  completed: "approved",
};

const STATUS_FILTERS = [
  { value: "", label: "All Statuses" },
  { value: "in_progress", label: "In Progress" },
  { value: "awaiting_therapist_review", label: "Awaiting Therapist Review" },
  { value: "changes_requested", label: "Changes Requested" },
  { value: "completed", label: "Completed" },
];

const API_CONFIGURED = Boolean(config.apiBaseUrl);

export function StaffForms() {
  const [forms, setForms] = useState<StaffForm[]>(MOCK_FORMS);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(API_CONFIGURED);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!API_CONFIGURED) return;
    setLoading(true);
    api
      .getStaffForms(statusFilter || undefined)
      .then(({ forms: real }) => {
        setForms(real);
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load forms"))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const visibleForms = API_CONFIGURED ? forms : forms.filter((f) => !statusFilter || f.status === statusFilter);

  return (
    <AppShell userName="Maria Thompson" userRole="Program Director" userInitials="MT" userPhoto="https://i.pravatar.cc/80?img=5" navItems={staffNavItems(0)}>
      <div className="page-head">
        <h1>Forms</h1>
        <p>Every weekly log across all households and children.</p>
      </div>

      {!API_CONFIGURED ? (
        <div className="isolation-note" style={{ borderColor: "var(--warn, #c6881a)" }}>
          <span>
            <b>Showing sample data.</b> Connect a backend (set VITE_API_BASE_URL) to see real submissions.
          </span>
        </div>
      ) : loadError ? (
        <div className="isolation-note" style={{ borderColor: "var(--danger, #c0392b)" }}>
          <span>Couldn't load live form data: {loadError}. Showing sample data instead.</span>
        </div>
      ) : null}

      <div className="ffield" style={{ maxWidth: 280, marginBottom: 16 }}>
        <label>Filter by status</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th>Week Of</th>
                <th>Parent</th>
                <th>Child</th>
                <th>Status</th>
                <th>Parent Signed</th>
                <th>Therapist Signed</th>
                <th>Open Corrections</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>Loading…</td>
                </tr>
              ) : visibleForms.length === 0 ? (
                <tr>
                  <td colSpan={7}>No forms match this filter.</td>
                </tr>
              ) : (
                visibleForms.map((f) => (
                  <tr key={f.id}>
                    <td className="mono">{f.weekStartDate}</td>
                    <td>{f.parentName}</td>
                    <td>{f.childName}</td>
                    <td>
                      <span className={`pill ${STATUS_CLASS[f.status] ?? "saved"}`}>{STATUS_LABEL[f.status] ?? f.status}</span>
                    </td>
                    <td className="mono">{f.parentSignedAt ? new Date(f.parentSignedAt).toLocaleDateString() : "—"}</td>
                    <td className="mono">{f.therapistSignedAt ? new Date(f.therapistSignedAt).toLocaleDateString() : "—"}</td>
                    <td>{f.openCorrections > 0 ? <span className="pill correction">{f.openCorrections}</span> : "—"}</td>
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
