import { config } from "./config";
import { getAccessToken } from "./auth";
import type { DailyLogEntry } from "../data/model";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new ApiError("Not signed in", 401);

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(body.error ?? "Request failed", response.status);
  }

  return response.json() as Promise<T>;
}

export type ApiChild = {
  id: string;
  name: string;
  classification: "TFC" | "ITFC" | "CFC";
  itfc: boolean;
  respite: boolean;
  therapist: string | null;
  currentWeeklyLog: { id: string; weekStartDate: string; status: string } | null;
};

export type ApiDailyEntry = Omit<DailyLogEntry, "status"> & {
  dayIndex: number;
  entryDate: string;
  status: "empty" | "in_progress" | "complete";
};

export type ApiWeeklyLog = {
  id: string;
  week_start_date: string;
  status: string;
  summary_notes: string | null;
  parent_signed_at: string | null;
  therapist_signed_at: string | null;
};

export function getMyChildren(): Promise<{ children: ApiChild[] }> {
  return request("/children");
}

export function getWeeklyLog(childId: string): Promise<{ weeklyLog: ApiWeeklyLog | null; days: ApiDailyEntry[] }> {
  return request(`/children/${childId}/weekly-log`);
}

export type SaveDailyEntryInput = Omit<DailyLogEntry, "status"> & {
  dayIndex: number;
  markComplete?: boolean;
};

export function saveDailyEntry(childId: string, input: SaveDailyEntryInput) {
  return request<{
    status: ApiDailyEntry["status"];
    basicLivingSkillsMinutes: number | null;
    basicLivingSkillsCompliant: boolean | null;
    socialSkillsMinutes: number | null;
    socialSkillsCompliant: boolean | null;
  }>(`/children/${childId}/weekly-log/days/${input.dayIndex}`, { method: "PUT", body: JSON.stringify(input) });
}

export function submitWeeklyLog(childId: string, summaryNotes?: string) {
  return request<{ status: string; signedDocumentVersion: number }>(`/children/${childId}/weekly-log/submit`, {
    method: "POST",
    body: JSON.stringify({ summaryNotes }),
  });
}
