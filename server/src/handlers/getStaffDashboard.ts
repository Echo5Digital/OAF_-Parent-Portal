import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, requireRole } from "../lib/auth.js";
import { query, queryOne } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";

/**
 * Staff Dashboard summary — real counts and recent submissions, replacing the
 * hardcoded mock numbers (124 Active Foster Homes, 187 Active Children, etc.)
 * that shipped with the original Phase One prototype. Restricted server-side
 * to staff roles (administrator/management/caseworker/therapist), not just
 * hidden in the UI — a foster_parent or respite_caregiver token is rejected
 * with 403 even if they somehow reach this endpoint.
 */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);
    requireRole(user, "administrator", "management", "caseworker", "therapist");

    const [activeFosterHomes, activeChildren, pendingWeeklyLogs, awaitingTherapistSignature, openCorrectionRequests] =
      await Promise.all([
        queryOne<{ count: string }>(
          `select count(distinct household_id)::text as count
           from placements
           where ended_at is null and placement_type = 'foster'`,
        ),
        queryOne<{ count: string }>(
          `select count(distinct child_id)::text as count
           from placements
           where ended_at is null`,
        ),
        queryOne<{ count: string }>(
          `select count(*)::text as count
           from weekly_logs
           where status = 'in_progress'`,
        ),
        queryOne<{ count: string }>(
          `select count(*)::text as count
           from weekly_logs
           where status = 'awaiting_therapist_review'`,
        ),
        queryOne<{ count: string }>(
          `select count(*)::text as count
           from correction_requests
           where resolved_at is null`,
        ),
      ]);

    const recentSubmissions = await query<{
      submitted_at: string | null;
      parent_name: string;
      child_name: string;
      week_start_date: string;
      status: string;
    }>(
      `select
         coalesce(wl.parent_signed_at, wl.updated_at) as submitted_at,
         u.full_name as parent_name,
         c.display_name as child_name,
         wl.week_start_date,
         wl.status
       from weekly_logs wl
       join households h on h.id = wl.household_id
       join users u on u.id = h.primary_parent_user_id
       join children c on c.id = wl.child_id
       order by coalesce(wl.parent_signed_at, wl.updated_at) desc
       limit 10`,
    );

    return json(200, {
      stats: {
        activeFosterHomes: Number(activeFosterHomes?.count ?? 0),
        activeChildren: Number(activeChildren?.count ?? 0),
        pendingWeeklyLogs: Number(pendingWeeklyLogs?.count ?? 0),
        awaitingTherapistSignature: Number(awaitingTherapistSignature?.count ?? 0),
        openCorrectionRequests: Number(openCorrectionRequests?.count ?? 0),
      },
      recentSubmissions: recentSubmissions.map((s) => ({
        submittedAt: s.submitted_at,
        parentName: s.parent_name,
        childName: s.child_name,
        weekStartDate: s.week_start_date,
        status: s.status,
      })),
    });
  });
}
