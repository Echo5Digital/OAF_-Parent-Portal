import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, AuthError } from "../lib/auth.js";
import { query, queryOne } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";
import { assertHouseholdAccessToChild } from "../lib/access.js";

type DailyEntryRow = {
  day_index: number;
  entry_date: string;
  status: string;
  answers: Record<string, unknown>;
};

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);
    const childId = event.pathParameters?.childId;
    if (!childId) throw new AuthError("Missing childId", 400);

    await assertHouseholdAccessToChild(user.id, childId);

    const weeklyLog = await queryOne<{
      id: string;
      week_start_date: string;
      status: string;
      summary_notes: string | null;
      parent_signed_at: string | null;
      therapist_signed_at: string | null;
    }>(
      `select id, week_start_date, status, summary_notes, parent_signed_at, therapist_signed_at
       from weekly_logs
       where child_id = $1 and week_start_date = date_trunc('week', current_date)::date`,
      [childId],
    );

    if (!weeklyLog) {
      return json(200, { weeklyLog: null, days: [] });
    }

    const days = await query<DailyEntryRow>(
      `select day_index, entry_date, status, answers
       from daily_entries
       where weekly_log_id = $1
       order by day_index`,
      [weeklyLog.id],
    );

    return json(200, {
      weeklyLog,
      days: days.map((d) => ({ dayIndex: d.day_index, entryDate: d.entry_date, status: d.status, ...d.answers })),
    });
  });
}
