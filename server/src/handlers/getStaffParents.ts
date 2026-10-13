import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate, requireRole } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";

/** Staff "Parents" page: every foster-parent user, their household, and the children currently assigned to it. */
export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);
    requireRole(user, "administrator", "management", "caseworker");

    const rows = await query<{
      user_id: string;
      full_name: string;
      email: string;
      is_active: boolean;
      household_id: string | null;
      household_label: string | null;
      children: { id: string; name: string }[] | null;
    }>(
      `select
         u.id as user_id,
         u.full_name,
         u.email,
         u.is_active,
         h.id as household_id,
         h.label as household_label,
         coalesce(
           json_agg(json_build_object('id', c.id, 'name', c.display_name))
             filter (where c.id is not null),
           '[]'
         ) as children
       from users u
       left join households h on h.primary_parent_user_id = u.id
       left join placements p on p.household_id = h.id and p.ended_at is null and p.placement_type = 'foster'
       left join children c on c.id = p.child_id
       where u.role = 'foster_parent'
       group by u.id, h.id
       order by u.full_name`,
    );

    return json(200, {
      parents: rows.map((r) => ({
        userId: r.user_id,
        name: r.full_name,
        email: r.email,
        isActive: r.is_active,
        householdId: r.household_id,
        householdLabel: r.household_label,
        children: r.children ?? [],
      })),
    });
  });
}
