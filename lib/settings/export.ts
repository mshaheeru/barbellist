import JSZip from "jszip";
import type { SupabaseClient } from "@supabase/supabase-js";

const EXPORT_TABLES = [
  "members",
  "staff",
  "packages",
  "fee_dues",
  "payments",
  "attendance",
  "expenses",
  "inventory_items",
  "inventory_sales",
  "reminders",
] as const;

function escapeCsvCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "object") {
    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  }
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]!);
  const header = keys.join(",");
  const lines = rows.map((row) =>
    keys.map((k) => escapeCsvCell(row[k])).join(","),
  );
  return [header, ...lines].join("\n");
}

export async function buildGymDataZip(
  supabase: SupabaseClient,
  gymId: string,
): Promise<{ base64: string; filename: string } | { error: string }> {
  const zip = new JSZip();

  const [tableResults, gymRes] = await Promise.all([
    Promise.all(
      EXPORT_TABLES.map(async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("gym_id", gymId);
        return { table, data, error };
      }),
    ),
    supabase.from("gyms").select("*").eq("id", gymId).maybeSingle(),
  ]);

  for (const { table, data, error } of tableResults) {
    if (error) {
      return { error: `Failed to export ${table}: ${error.message}` };
    }
    const rows = (data ?? []) as Record<string, unknown>[];
    zip.file(`${table}.csv`, rowsToCsv(rows));
  }

  const gym = gymRes.data;
  if (gym) {
    zip.file("gym.csv", rowsToCsv([gym as Record<string, unknown>]));
  }

  const buffer = await zip.generateAsync({ type: "base64" });
  const slug =
    (gym as { slug?: string } | null)?.slug?.replace(/[^a-z0-9-]/gi, "") ||
    "gym";
  const date = new Date().toISOString().slice(0, 10);

  return {
    base64: buffer,
    filename: `barbellist-${slug}-export-${date}.zip`,
  };
}
