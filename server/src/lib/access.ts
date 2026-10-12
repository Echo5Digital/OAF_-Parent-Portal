import { queryOne } from "./db.js";
import { AuthError } from "./auth.js";

/**
 * Server-side enforcement that the given user belongs to a household currently
 * placed with the given child. Required per the brief: permissions must be
 * enforced by the backend, not just by hiding UI elements.
 */
export async function assertHouseholdAccessToChild(userId: string, childId: string): Promise<void> {
  const row = await queryOne<{ exists: boolean }>(
    `select exists(
       select 1
       from household_members hm
       join placements p on p.household_id = hm.household_id and p.ended_at is null
       where hm.user_id = $1 and p.child_id = $2
     ) as exists`,
    [userId, childId],
  );

  if (!row?.exists) {
    throw new AuthError("Not authorized for this child", 403);
  }
}
