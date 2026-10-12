import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { authenticate } from "../lib/auth.js";
import { query } from "../lib/db.js";
import { json, withErrorHandling } from "../lib/http.js";

type ChildRow = {
  id: string;
  display_name: string;
  classification: string;
  is_itfc: boolean;
  placement_type: string;
  therapist_name: string | null;
  weekly_log_id: string | null;
  week_start_date: string | null;
  status: string | null;
};

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> {
  return withErrorHandling(async () => {
    const user = await authenticate(event);

    const rows = await query<ChildRow>(
      `select
         c.id,
         c.display_name,
         c.classification,
         c.is_itfc,
         p.placement_type,
         t.full_name as therapist_name,
         wl.id as weekly_log_id,
         wl.week_start_date,
         wl.status
       from household_members hm
       join households h on h.id = hm.household_id
       join placements p on p.household_id = h.id and p.ended_at is null
       join children c on c.id = p.child_id
       left join users t on t.id = c.assigned_therapist_user_id
       left join weekly_logs wl on wl.child_id = c.id
         and wl.week_start_date = date_trunc('week', current_date)::date
       where hm.user_id = $1
       order by c.display_name`,
      [user.id],
    );

    return json(200, {
      children: rows.map((r) => ({
        id: r.id,
        name: r.display_name,
        classification: r.classification,
        itfc: r.is_itfc,
        respite: r.placement_type === "respite",
        therapist: r.therapist_name,
        currentWeeklyLog: r.weekly_log_id
          ? { id: r.weekly_log_id, weekStartDate: r.week_start_date, status: r.status }
          : null,
      })),
    });
  });
}
