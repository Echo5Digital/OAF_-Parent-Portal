import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, requireRole } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";

/** Staff "Children" page: every child, their classification, current household/placement type, and assigned therapist. */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);
    requireRole(user, "administrator", "management", "caseworker", "therapist");

    const rows = await query<{
      id: string;
      display_name: string;
      date_of_birth: string | null;
      classification: string;
      is_itfc: boolean;
      therapist_name: string | null;
      household_label: string | null;
      placement_type: string | null;
    }>(
      `select
         c.id,
         c.display_name,
         c.date_of_birth,
         c.classification,
         c.is_itfc,
         t.full_name as therapist_name,
         h.label as household_label,
         p.placement_type
       from children c
       left join users t on t.id = c.assigned_therapist_user_id
       left join placements p on p.child_id = c.id and p.ended_at is null
       left join households h on h.id = p.household_id
       order by c.display_name`,
    );

    return json(200, {
      children: rows.map((r) => ({
        id: r.id,
        name: r.display_name,
        dateOfBirth: r.date_of_birth,
        classification: r.classification,
        isItfc: r.is_itfc,
        therapistName: r.therapist_name,
        householdLabel: r.household_label,
        placementType: r.placement_type,
      })),
    });
  });
}
