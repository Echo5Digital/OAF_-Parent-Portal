import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, AuthError } from "../lib/auth.js";
import { query, queryOne } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";
import { assertHouseholdAccessToChild } from "../lib/access.js";
import { parseTimeToMinutes } from "../lib/time.js";

/**
 * Matches the real Open Arms "Daily Logs for Foster Parents" Jotform (v15.5),
 * reconstructed from screenshots of the live form builder on 2026-10-12.
 * Mirrors DailyLogEntry / SkillActivity in the frontend's src/data/model.ts —
 * keep both in sync when the real form structure is confirmed further
 * (Days 2-7, end-of-week pages 8-11 have not been captured yet).
 */
type SkillActivityBody = {
  start?: string;
  stop?: string;
  skills?: string[];
  otherSkill?: string;
  method?: string;
  otherMethod?: string;
  completion?: string;
  otherCompletion?: string;
  response?: string;
  otherResponse?: string;
};

type SaveDailyEntryBody = {
  dayIndex: number;
  /** "Is Day N Required?" — confirmed on Day 2's real Jotform page; when "No", nothing else on the day applies. */
  dayRequired?: "" | "Yes" | "No";
  respite?: "" | "Yes" | "No";
  respiteWithOafcParent?: "" | "Yes" | "No";
  basicLivingSkills?: SkillActivityBody;
  itfc?: "" | "Yes" | "No";
  workbook?: string;
  otherWorkbook?: string;
  describeWhatHappened?: string;
  importantEvents?: string;
  behaviorManagedUsing?: string[];
  otherBehaviorManaged?: string;
  positiveReinforcementCount?: number;
  positiveReinforcementOtherCount?: number;
  timeOutMinutes?: number;
  restrictionMinutes?: number;
  socialSkills?: SkillActivityBody;
  /** Social Skills has its own separate "Describe what happened below" field, distinct from the one after Basic Living Skills. */
  socialSkillsDescribeWhatHappened?: string;
  behaviorChecklist?: string[];
  parentSignature?: string;
  signatureDate?: string;
  markComplete?: boolean;
};

const BASIC_LIVING_SKILLS_MIN = 30;
const SOCIAL_SKILLS_MIN = 60;

function minutesFor(activity: SkillActivityBody | undefined): number | null {
  const start = parseTimeToMinutes(activity?.start);
  const stop = parseTimeToMinutes(activity?.stop);
  return start !== null && stop !== null && stop > start ? stop - start : null;
}

function isSkillActivityComplete(activity: SkillActivityBody | undefined): boolean {
  return Boolean(
    activity?.start && activity.stop && activity.skills?.length && activity.method && activity.completion && activity.response,
  );
}

function requiredFieldsComplete(body: SaveDailyEntryBody): boolean {
  if (!body.dayRequired) return false;
  if (body.dayRequired === "No") return true;
  if (!body.respite) return false;
  if (body.respite === "Yes") {
    return Boolean(body.respiteWithOafcParent && body.parentSignature && body.signatureDate);
  }
  return Boolean(
    isSkillActivityComplete(body.basicLivingSkills) &&
      body.itfc &&
      body.describeWhatHappened &&
      body.importantEvents &&
      body.behaviorManagedUsing?.length &&
      isSkillActivityComplete(body.socialSkills) &&
      body.socialSkillsDescribeWhatHappened &&
      body.behaviorChecklist?.length &&
      body.parentSignature &&
      body.signatureDate,
  );
}

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

    if (body.markComplete && !requiredFieldsComplete(body)) {
      throw new AuthError("Cannot mark complete: required fields are missing", 400);
    }

    const complete = requiredFieldsComplete(body) && body.markComplete;
    const started = Boolean(body.dayRequired || body.respite || body.basicLivingSkills?.start || body.describeWhatHappened);
    const status = complete ? "complete" : started ? "in_progress" : "empty";

    const basicLivingMinutes = body.respite === "No" ? minutesFor(body.basicLivingSkills) : null;
    const socialMinutes = body.respite === "No" ? minutesFor(body.socialSkills) : null;

    const entryDate = addDaysISO(weekStart, body.dayIndex);

    // `answers` is recomputed server-side (not trusted from the client) for the two
    // derived "Tot Min" fields, so a tampered client payload can't fake compliance.
    const answers = {
      ...body,
      basicLivingSkills: body.basicLivingSkills ? { ...body.basicLivingSkills, minutes: basicLivingMinutes ?? "" } : undefined,
      socialSkills: body.socialSkills ? { ...body.socialSkills, minutes: socialMinutes ?? "" } : undefined,
    };
    delete (answers as Record<string, unknown>).dayIndex;
    delete (answers as Record<string, unknown>).markComplete;

    await query(
      `insert into daily_entries (
         weekly_log_id, day_index, entry_date, status, is_respite_day, is_itfc_day,
         basic_living_skills_minutes, social_skills_minutes, answers, last_edited_by
       )
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (weekly_log_id, day_index) do update set
         status = excluded.status,
         is_respite_day = excluded.is_respite_day,
         is_itfc_day = excluded.is_itfc_day,
         basic_living_skills_minutes = excluded.basic_living_skills_minutes,
         social_skills_minutes = excluded.social_skills_minutes,
         answers = excluded.answers,
         last_edited_by = excluded.last_edited_by,
         updated_at = now()`,
      [
        weeklyLog!.id,
        body.dayIndex,
        entryDate,
        status,
        body.respite === "Yes",
        body.itfc === "Yes",
        basicLivingMinutes,
        socialMinutes,
        JSON.stringify(answers),
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
      basicLivingSkillsMinutes: basicLivingMinutes,
      basicLivingSkillsCompliant: basicLivingMinutes !== null ? basicLivingMinutes >= BASIC_LIVING_SKILLS_MIN : null,
      socialSkillsMinutes: socialMinutes,
      socialSkillsCompliant: socialMinutes !== null ? socialMinutes >= SOCIAL_SKILLS_MIN : null,
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
