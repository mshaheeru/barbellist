/**
 * Seed demo_seed data into an existing gym (by slug).
 *
 * Usage:
 *   npx tsx scripts/seed-gym-demo.ts density-fitness
 *   npx tsx scripts/seed-gym-demo.ts density-fitness --clear
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (+ QR_SIGNING_SECRET)
 * in .env.local
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  clearDemoDataForGym,
  seedDemoDataForGym,
} from "../lib/seed/demo-data";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const slug = process.argv[2]?.trim();
const clear = process.argv.includes("--clear");

if (!slug || slug.startsWith("-")) {
  console.error("Usage: npx tsx scripts/seed-gym-demo.ts <gym-slug> [--clear]");
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: gym, error: gymError } = await admin
    .from("gyms")
    .select("id, name, slug, organization_id")
    .eq("slug", slug)
    .maybeSingle();

  if (gymError) throw new Error(gymError.message);
  if (!gym) {
    console.error(`No gym found with slug "${slug}"`);
    process.exit(1);
  }

  console.log(`${clear ? "Clearing" : "Seeding"} demo data for ${gym.name} (${gym.id})…`);

  const { data: ownerStaff } = await admin
    .from("staff")
    .select("id")
    .eq("gym_id", gym.id)
    .eq("role", "owner")
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (clear) {
    const { error } = await clearDemoDataForGym(admin, gym.id);
    if (error) {
      console.error("Clear failed:", error);
      process.exit(1);
    }
    console.log("Demo data cleared.");
    return;
  }

  // Polish profile fields that help receipts / WhatsApp demos look complete
  if (slug === "density-fitness") {
    const { error: profileError } = await admin
      .from("gyms")
      .update({
        address: "Plot 14, Block 4, Gulistan-e-Johar",
        city: "Karachi",
        country: "Pakistan",
        whatsapp: "+923452778965",
        settings: {
          reminders: {
            days_before_due: 3,
            on_due_date: true,
            overdue_every_days: 3,
            max_per_due: 5,
          },
        },
      })
      .eq("id", gym.id);
    if (profileError) {
      console.warn("Profile polish skipped:", profileError.message);
    } else {
      console.log("  gym profile polished (address, whatsapp, reminders)");
    }
  }

  const { error } = await seedDemoDataForGym(
    admin,
    gym.id,
    ownerStaff?.id ?? null,
  );

  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  const counts = await Promise.all([
    admin.from("packages").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
    admin.from("staff").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
    admin.from("members").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
    admin.from("fee_dues").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
    admin.from("payments").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
    admin.from("attendance").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
    admin.from("expenses").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
    admin.from("inventory_items").select("id", { count: "exact", head: true }).eq("gym_id", gym.id),
  ]);

  console.log("Done.");
  console.log("  packages:", counts[0].count);
  console.log("  staff:", counts[1].count);
  console.log("  members:", counts[2].count);
  console.log("  fee_dues:", counts[3].count);
  console.log("  payments:", counts[4].count);
  console.log("  attendance:", counts[5].count);
  console.log("  expenses:", counts[6].count);
  console.log("  inventory:", counts[7].count);
  console.log(`Login as the Density Fitness owner to demo.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
