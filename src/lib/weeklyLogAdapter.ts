import type { DailyLogEntry } from "../data/model";
import type { ApiDailyEntry, SaveDailyEntryInput } from "./api";

const API_TO_LOCAL_STATUS: Record<ApiDailyEntry["status"], DailyLogEntry["status"]> = {
  empty: "empty",
  in_progress: "progress",
  complete: "complete",
};

const LOCAL_TO_API_STATUS: Record<DailyLogEntry["status"], ApiDailyEntry["status"]> = {
  empty: "empty",
  progress: "in_progress",
  complete: "complete",
};

export function fromApiDailyEntry(entry: ApiDailyEntry, fallback: DailyLogEntry): DailyLogEntry {
  return {
    status: API_TO_LOCAL_STATUS[entry.status],
    start: entry.start_time ?? "",
    stop: entry.stop_time ?? "",
    minutes: entry.duration_minutes ?? "",
    skill: entry.skill_area ?? fallback.skill,
    method: entry.teaching_method ?? fallback.method,
    performance: entry.child_performance ?? "",
    notes: entry.notes ?? "",
  };
}

export function toSaveDailyEntryInput(dayIndex: number, entry: DailyLogEntry): SaveDailyEntryInput {
  return {
    dayIndex,
    startTime: entry.start || undefined,
    stopTime: entry.stop || undefined,
    skillArea: entry.skill || undefined,
    teachingMethod: entry.method || undefined,
    childPerformance: entry.performance || undefined,
    notes: entry.notes || undefined,
    markComplete: LOCAL_TO_API_STATUS[entry.status] === "complete",
  };
}
