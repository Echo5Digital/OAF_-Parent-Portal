import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { buildInitialStore, CHILDREN, type ChildWeek, type DailyLogEntry, type WeekSummary } from "../data/model";
import { config } from "./config";
import * as api from "./api";
import { fromApiDailyEntry, toSaveDailyEntryInput } from "./weeklyLogAdapter";
import { useToast } from "../components/Toast";

const API_CONFIGURED = Boolean(config.apiBaseUrl);

type ParentDataValue = {
  store: Record<string, ChildWeek>;
  currentChildId: string;
  setCurrentChildId: (id: string) => void;
  loadError: string | null;
  setActiveDay: (index: number) => void;
  updateEntry: (next: DailyLogEntry) => void;
  updateWeekSummary: (next: WeekSummary) => void;
  submitWeek: () => Promise<void>;
};

const ParentDataContext = createContext<ParentDataValue | null>(null);

/**
 * Holds the parent's multi-child weekly-log state above the router so switching
 * between Home / My Children / Weekly Logs / the daily-log view never loses
 * in-progress edits — one shared store per session, same fallback-to-local-demo
 * behavior as the original single-page ParentPortal.
 */
export function ParentDataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(buildInitialStore);
  const [currentChildId, setCurrentChildId] = useState("emma");
  const [loadError, setLoadError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!API_CONFIGURED) return;

    api
      .getWeeklyLog(currentChildId)
      .then(({ days }) => {
        setStore((prev) => {
          const existing = prev[currentChildId];
          const nextDays = [...existing.days];
          for (const entry of days) {
            nextDays[entry.dayIndex] = fromApiDailyEntry(entry);
          }
          return { ...prev, [currentChildId]: { ...existing, days: nextDays } };
        });
        setLoadError(null);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load weekly log"));
  }, [currentChildId]);

  function setActiveDay(index: number) {
    setStore((prev) => ({
      ...prev,
      [currentChildId]: { ...prev[currentChildId], activeDay: index },
    }));
  }

  function updateEntry(next: DailyLogEntry) {
    setStore((prev) => {
      const days = [...prev[currentChildId].days];
      days[prev[currentChildId].activeDay] = next;
      return { ...prev, [currentChildId]: { ...prev[currentChildId], days } };
    });

    if (!API_CONFIGURED) return;
    api
      .saveDailyEntry(currentChildId, toSaveDailyEntryInput(store[currentChildId].activeDay, next))
      .catch((err) => showToast(err instanceof Error ? err.message : "Failed to save — will retry"));
  }

  function updateWeekSummary(next: WeekSummary) {
    setStore((prev) => ({ ...prev, [currentChildId]: { ...prev[currentChildId], weekSummary: next } }));
    // Not yet wired to the backend — no API endpoint exists for week-level
    // summary data yet (see server/README.md). Local-only, same as the rest
    // of this prototype when VITE_API_BASE_URL is unset.
  }

  async function submitWeek() {
    if (!API_CONFIGURED) {
      showToast("Weekly report submitted — status: Awaiting Therapist Review");
      return;
    }
    try {
      await api.submitWeeklyLog(currentChildId);
      showToast("Weekly report submitted — status: Awaiting Therapist Review");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Submission failed");
    }
  }

  return (
    <ParentDataContext.Provider
      value={{ store, currentChildId, setCurrentChildId, loadError, setActiveDay, updateEntry, updateWeekSummary, submitWeek }}
    >
      {children}
    </ParentDataContext.Provider>
  );
}

export function useParentData() {
  const ctx = useContext(ParentDataContext);
  if (!ctx) throw new Error("useParentData must be used within ParentDataProvider");
  return ctx;
}

export { CHILDREN };
