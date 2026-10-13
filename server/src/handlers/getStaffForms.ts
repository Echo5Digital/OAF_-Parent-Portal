import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, requireRole, AuthError } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";

const VALID_STATUSES = ["in_progress", "awaiting_therapist_review", "changes_requested", "completed"];

/**
 * Staff "Forms" (and "Reviews", via ?status=awaiting_therapist_review) page:
 * every weekly log across all children/households, with parent/child names
 * and signature/correction status, optionally filtered by status.
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);
    requireRole(user, "administrator", "management", "caseworker", "therapist");

    const status = event.queryStringParameters?.status;
    if (status && !VALID_STATUSES.includes(status)) {
      throw new AuthError(`Invalid status filter. Must be one of: ${VALID_STATUSES.join(", ")}`, 400);
    }

    const rows = await query<{
      id: string;
      week_start_date: string;
      status: string;
      parent_name: string;
      child_name: string;
      parent_signed_at: string | null;
      therapist_signed_at: string | null;
      open_corrections: string;
    }>(
      `select
         wl.id,
         wl.week_start_date,
         wl.status,
         u.full_name as parent_name,
         c.display_name as child_name,
         wl.parent_signed_at,
         wl.therapist_signed_at,
         (select count(*)::text from correction_requests cr where cr.weekly_log_id = wl.id and cr.resolved_at is null) as open_corrections
       from weekly_logs wl
       join households h on h.id = wl.household_id
       join users u on u.id = h.primary_parent_user_id
       join children c on c.id = wl.child_id
       where ($1::text is null or wl.status = $1)
       order by wl.updated_at desc
       limit 200`,
      [status ?? null],
    );

    return json(200, {
      forms: rows.map((r) => ({
        id: r.id,
        weekStartDate: r.week_start_date,
        status: r.status,
        parentName: r.parent_name,
        childName: r.child_name,
        parentSignedAt: r.parent_signed_at,
        therapistSignedAt: r.therapist_signed_at,
        openCorrections: Number(r.open_corrections),
      })),
    });
  });
}
