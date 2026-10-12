import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, AuthError } from "../lib/auth.js";
import { query, queryOne } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";
import { assertHouseholdAccessToChild } from "../lib/access.js";

type SubmitBody = { summaryNotes?: string };

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);
    const childId = event.pathParameters?.childId;
    if (!childId) throw new AuthError("Missing childId", 400);
    await assertHouseholdAccessToChild(user.id, childId);

    const body = JSON.parse(event.body ?? "{}") as SubmitBody;

    const weeklyLog = await queryOne<{ id: string; status: string }>(
      `select id, status from weekly_logs
       where child_id = $1 and week_start_date = date_trunc('week', current_date)::date`,
      [childId],
    );
    if (!weeklyLog) throw new AuthError("No weekly log found for the current week", 404);
    if (weeklyLog.status !== "in_progress" && weeklyLog.status !== "changes_requested") {
      throw new AuthError(`Cannot submit a weekly log in status ${weeklyLog.status}`, 409);
    }

    const incompleteDays = await queryOne<{ count: string }>(
      `select count(*)::text as count from daily_entries
       where weekly_log_id = $1 and status <> 'complete'`,
      [weeklyLog.id],
    );
    if (Number(incompleteDays?.count ?? "7") > 0) {
      throw new AuthError("All 7 days must be marked complete before submitting", 400);
    }

    const updated = await queryOne<{ signed_document_version: number }>(
      `update weekly_logs
       set status = 'awaiting_therapist_review',
           summary_notes = coalesce($2, summary_notes),
           parent_signed_by = $1,
           parent_signed_at = now(),
           signed_document_version = signed_document_version + 1,
           updated_at = now()
       where id = $3
       returning signed_document_version`,
      [user.id, body.summaryNotes ?? null, weeklyLog.id],
    );

    await query(
      `insert into audit_events (actor_user_id, entity_type, entity_id, action, detail)
       values ($1, 'weekly_log', $2, 'parent_signed', $3)`,
      [user.id, weeklyLog.id, JSON.stringify({ version: updated?.signed_document_version })],
    );

    return json(200, {
      weeklyLogId: weeklyLog.id,
      status: "awaiting_therapist_review",
      signedDocumentVersion: updated?.signed_document_version,
    });
  });
}
