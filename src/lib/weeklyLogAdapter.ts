import { emptyDay, type DailyLogEntry } from "../data/model";
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

export function fromApiDailyEntry(entry: ApiDailyEntry): DailyLogEntry {
  const base = emptyDay();
  return {
    ...base,
    ...entry,
    status: API_TO_LOCAL_STATUS[entry.status],
    basicLivingSkills: { ...base.basicLivingSkills, ...entry.basicLivingSkills },
    socialSkills: { ...base.socialSkills, ...entry.socialSkills },
  };
}

export function toSaveDailyEntryInput(dayIndex: number, entry: DailyLogEntry): SaveDailyEntryInput {
  const { status, ...rest } = entry;
  return {
    ...rest,
    dayIndex,
    markComplete: LOCAL_TO_API_STATUS[status] === "complete",
  };
}
