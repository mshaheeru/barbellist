import type { SupabaseClient } from "@supabase/supabase-js";

type LogActionParams = {
  gymId: string;
  actorStaffId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
};

export async function logAuditAction(
  supabase: SupabaseClient,
  params: LogActionParams,
): Promise<void> {
  const { error } = await supabase.from("audit_log").insert({
    gym_id: params.gymId,
    actor_staff_id: params.actorStaffId,
    action: params.action,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    details: params.details ?? {},
  });

  if (error) {
    console.error("Failed to write audit log:", error.message);
  }
}
