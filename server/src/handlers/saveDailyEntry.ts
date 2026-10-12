import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, AuthError } from "../lib/auth.js";
import { query, queryOne } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";
import { assertHouseholdAccessToChild } from "../lib/access.js";
import { parseTimeToMinutes } from "../lib/time.js";

type SaveDailyEntryBody = {
  dayIndex: number;
  startTime?: string;
  stopTime?: string;
  skillArea?: string;
  teachingMethod?: string;
  childPerformance?: string;
  notes?: string;
  itfcSafetyPlanReviewed?: string;
  itfcSupervisionLevel?: string;
  markComplete?: boolean;
};

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);
    const childId = event.pathParameters?.childId;
    if (!childId) throw new AuthError("Missing childId", 400);
    await assertHouseholdAccessToChild(user.id, childId);

    const body = JSON.parse(event.body ?? "{}") as SaveDailyEntryBody;
    if (body.dayIndex < 0 || body.dayIndex > 6) {
      throw new AuthError("dayIndex must be between 0 and 6", 400);
    }

    const placement = await queryOne<{ id: string; household_id: string }>(
      `select id, household_id from placements where child_id = $1 and ended_at is null`,
      [childId],
    );
    if (!placement) throw new AuthError("Child has no active placement", 409);

    const weekStart = currentWeekStartISO();

    let weeklyLog = await queryOne<{ id: string; status: string }>(
      `select id, status from weekly_logs where child_id = $1 and week_start_date = $2`,
      [childId, weekStart],
    );

    if (!weeklyLog) {
      weeklyLog = await queryOne<{ id: string; status: string }>(
        `insert into weekly_logs (child_id, placement_id, household_id, week_start_date)
         values ($1, $2, $3, $4)
         returning id, status`,
        [childId, placement.id, placement.household_id, weekStart],
      );
    }

    if (weeklyLog!.status === "completed") {
      throw new AuthError("This week's log is already signed and completed; request a correction instead", 409);
    }

    const start = parseTimeToMinutes(body.startTime);
    const stop = parseTimeToMinutes(body.stopTime);
    const durationMinutes = start !== null && stop !== null && stop > start ? stop - start : null;

    const requiredFields = body.startTime && body.stopTime && body.childPerformance && body.notes;
    const status = body.markComplete && requiredFields ? "complete" : requiredFields ? "in_progress" : "empty";

    if (body.markComplete && !requiredFields) {
      throw new AuthError("Cannot mark complete: required fields are missing", 400);
    }

    const entryDate = addDaysISO(weekStart, body.dayIndex);

    await query(
      `insert into daily_entries (
         weekly_log_id, day_index, entry_date, status, start_time, stop_time, duration_minutes,
         skill_area, teaching_method, child_performance, notes,
         itfc_safety_plan_reviewed, itfc_supervision_level, last_edited_by
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       on conflict (weekly_log_id, day_index) do update set
         status = excluded.status,
         start_time = excluded.start_time,
         stop_time = excluded.stop_time,
         duration_minutes = excluded.duration_minutes,
         skill_area = excluded.skill_area,
         teaching_method = excluded.teaching_method,
         child_performance = excluded.child_performance,
         notes = excluded.notes,
         itfc_safety_plan_reviewed = excluded.itfc_safety_plan_reviewed,
         itfc_supervision_level = excluded.itfc_supervision_level,
         last_edited_by = excluded.last_edited_by,
         updated_at = now()`,
      [
        weeklyLog!.id,
        body.dayIndex,
        entryDate,
        status,
        body.startTime ?? null,
        body.stopTime ?? null,
        durationMinutes,
        body.skillArea ?? null,
        body.teachingMethod ?? null,
        body.childPerformance ?? null,
        body.notes ?? null,
        body.itfcSafetyPlanReviewed ?? null,
        body.itfcSupervisionLevel ?? null,
        user.id,
      ],
    );

    await query(
      `insert into audit_events (actor_user_id, entity_type, entity_id, action, detail)
       values ($1, 'daily_entry', $2, $3, $4)`,
      [user.id, weeklyLog!.id, status === "complete" ? "day_completed" : "day_saved", JSON.stringify({ dayIndex: body.dayIndex })],
    );

    return json(200, {
      weeklyLogId: weeklyLog!.id,
      dayIndex: body.dayIndex,
      status,
      durationMinutes,
      compliant: durationMinutes !== null ? durationMinutes >= 30 : null,
    });
  });
}

function currentWeekStartISO(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = (day + 6) % 7; // Monday-start week
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday.toISOString().slice(0, 10);
}

function addDaysISO(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
