/**
 * Density Fitness demo QR pack for customer kiosk presentation.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/generate-density-demo-qrs.mts
 *
 * Output: density-fitness-demo-qrs/*.png + README.md
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SignJWT } from "jose";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

const DENSITY_ID = "7131871e-3f4f-4d3e-bc2d-d2cfd57ae773";
const IRON_REPUBLIC_ID = "6446daf8-ba9d-4de2-a7b3-c41c362a2509";
const DEMO_DAY = "2026-08-22"; // Saturday demo, 3:30 PM PKT
const OUT_DIR = path.join(process.cwd(), "density-fitness-demo-qrs");

const SECRET = process.env.QR_SIGNING_SECRET?.trim();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SECRET || !SUPABASE_URL || !SERVICE_KEY) {
  throw new Error(
    "Missing QR_SIGNING_SECRET / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
  );
}

async function signMemberQrToken(memberId: string, gymId: string) {
  const key = new TextEncoder().encode(SECRET);
  return new SignJWT({
    gym: gymId,
    type: "barbellist_member_card",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(memberId)
    .setIssuedAt()
    .sign(key);
}

async function writeQrPng(filePath: string, payload: string) {
  await QRCode.toFile(filePath, payload, {
    errorCorrectionLevel: "M",
    type: "png",
    margin: 2,
    width: 512,
    color: { dark: "#000000", light: "#FFFFFF" },
  });
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type CaseRow = {
  file: string;
  title: string;
  expected: string;
  memberLabel: string;
  payload: string;
};

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await mkdir(OUT_DIR, { recursive: true });

  const { data: members, error: memErr } = await supabase
    .from("members")
    .select("id, name, member_code, status, card_qr_token, notes")
    .eq("gym_id", DENSITY_ID)
    .ilike("notes", "%demo_seed%")
    .order("member_code");

  if (memErr) throw new Error(memErr.message);
  if (!members?.length) throw new Error("No Density demo members found");

  const byCode = new Map(members.map((m) => [m.member_code, m]));

  // --- Prep: due-soon for DEMO-0013 (Danish) ---
  // Convert August paid due → pending with due_date = demo day + 2 days
  const danish = byCode.get("DEMO-0013");
  if (!danish) throw new Error("DEMO-0013 missing");

  const dueSoonDate = "2026-08-24"; // 2 days after demo → "Due in 2d"
  const { data: danishDue, error: dueFetchErr } = await supabase
    .from("fee_dues")
    .select("id, amount_due, status")
    .eq("gym_id", DENSITY_ID)
    .eq("member_id", danish.id)
    .eq("generated_for_month", "2026-08-01")
    .maybeSingle();
  if (dueFetchErr) throw new Error(dueFetchErr.message);
  if (!danishDue) throw new Error("Danish Aug fee_due missing");

  const { error: dueUpdErr } = await supabase
    .from("fee_dues")
    .update({
      status: "pending",
      amount_paid: 0,
      due_date: dueSoonDate,
      notes: "demo_seed due_soon_kiosk",
    })
    .eq("id", danishDue.id);
  if (dueUpdErr) throw new Error(dueUpdErr.message);

  // Remove Aug payment for Danish so unpaid balance matches pending due
  await supabase
    .from("payments")
    .delete()
    .eq("gym_id", DENSITY_ID)
    .eq("member_id", danish.id)
    .eq("covers_from", "2026-08-01")
    .ilike("notes", "%demo_seed%");

  // --- Prep: ensure open sessions on demo day for already-checked-in cases ---
  // Use members who may or may not already be checked in; upsert open session.
  const alreadyClear = byCode.get("DEMO-0007"); // Saad — paid
  const alreadyOverdue = byCode.get("DEMO-0019"); // Sara — overdue
  const alreadyDueSoon = danish;

  // Demo day PKT window in UTC: Aug 21 19:00 → Aug 22 19:00
  const demoDayStartUtc = "2026-08-21T19:00:00+00";
  const demoDayEndUtc = "2026-08-22T19:00:00+00";

  async function closeOpenOnDemoDay(memberId: string) {
    await supabase
      .from("attendance")
      .update({ check_out_at: "2026-08-22T04:00:00+00" })
      .eq("gym_id", DENSITY_ID)
      .eq("member_id", memberId)
      .is("check_out_at", null)
      .gte("check_in_at", demoDayStartUtc)
      .lt("check_in_at", demoDayEndUtc);
  }

  for (const m of [alreadyClear, alreadyOverdue, alreadyDueSoon]) {
    if (!m) continue;
    await closeOpenOnDemoDay(m.id);

    const feeSnap =
      m.member_code === "DEMO-0019"
        ? "overdue"
        : m.member_code === "DEMO-0013"
          ? "due_soon"
          : "clear";

    const { error: attErr } = await supabase.from("attendance").insert({
      gym_id: DENSITY_ID,
      member_id: m.id,
      person_type: "member",
      check_in_method: "qr",
      check_in_at: "2026-08-22T04:30:00+00", // 9:30 AM PKT
      fee_status_at_checkin: feeSnap,
      notes: "demo_seed kiosk_already_in",
    });
    if (attErr) throw new Error(`attendance ${m.member_code}: ${attErr.message}`);
  }

  // Fatima (DEMO-0017) — due soon for FIRST check-in demo
  const fatima = byCode.get("DEMO-0017");
  if (fatima) {
    const { data: fatimaDue } = await supabase
      .from("fee_dues")
      .select("id")
      .eq("gym_id", DENSITY_ID)
      .eq("member_id", fatima.id)
      .eq("generated_for_month", "2026-08-01")
      .maybeSingle();
    if (fatimaDue) {
      await supabase
        .from("fee_dues")
        .update({
          status: "pending",
          amount_paid: 0,
          due_date: "2026-08-23", // day after demo → Due in 1d
          notes: "demo_seed due_soon_kiosk",
        })
        .eq("id", fatimaDue.id);
      await supabase
        .from("payments")
        .delete()
        .eq("gym_id", DENSITY_ID)
        .eq("member_id", fatima.id)
        .eq("covers_from", "2026-08-01")
        .ilike("notes", "%demo_seed%");
    }
  }

  const noOpenCodes = [
    "DEMO-0014", // clear first
    "DEMO-0017", // due soon first
    "DEMO-0001", // partial → overdue UI
    "DEMO-0020", // overdue first
    "DEMO-0022", // frozen
    "DEMO-0024", // expired
    "DEMO-0010", // outdated card
    "DEMO-0015", // spare clear
    "DEMO-0016",
    "DEMO-0018",
  ];

  for (const code of noOpenCodes) {
    const m = byCode.get(code);
    if (!m) continue;
    await closeOpenOnDemoDay(m.id);
  }

  // --- Outdated card: DEMO-0010 Zubair ---
  const zubair = byCode.get("DEMO-0010");
  if (!zubair) throw new Error("DEMO-0010 missing");
  const outdatedToken = await signMemberQrToken(zubair.id, DENSITY_ID);
  await new Promise((r) => setTimeout(r, 1100));
  const freshToken = await signMemberQrToken(zubair.id, DENSITY_ID);
  const { error: zErr } = await supabase
    .from("members")
    .update({
      card_qr_token: freshToken,
      card_issued_at: new Date().toISOString(),
    })
    .eq("id", zubair.id)
    .eq("gym_id", DENSITY_ID);
  if (zErr) throw new Error(zErr.message);

  // Refresh members after token updates
  const { data: refreshed } = await supabase
    .from("members")
    .select("id, name, member_code, status, card_qr_token")
    .eq("gym_id", DENSITY_ID)
    .ilike("notes", "%demo_seed%");
  const live = new Map((refreshed ?? []).map((m) => [m.member_code, m]));

  const wrongGymToken = await signMemberQrToken(
    "f7eede0e-36e5-4712-80b7-ecbd7f740a20",
    IRON_REPUBLIC_ID,
  );
  const ghostToken = await signMemberQrToken(
    "00000000-0000-4000-8000-000000000099",
    DENSITY_ID,
  );

  function tokenFor(code: string) {
    const m = live.get(code);
    if (!m?.card_qr_token) throw new Error(`No token for ${code}`);
    return m.card_qr_token;
  }

  function label(code: string) {
    const m = live.get(code)!;
    return `${m.name} (${m.member_code})`;
  }

  const cases: CaseRow[] = [
    {
      file: `01-fee-clear__${slugify(label("DEMO-0014"))}.png`,
      title: "Fee clear / paid — first check-in",
      expected: "Success green · All Clear — Fee Paid",
      memberLabel: label("DEMO-0014"),
      payload: tokenFor("DEMO-0014"),
    },
    {
      file: `02-fee-due-soon__${slugify(label("DEMO-0017"))}.png`,
      title: "Fee due soon",
      expected: "Success · Checked in · Fee due soon",
      memberLabel: label("DEMO-0017"),
      payload: tokenFor("DEMO-0017"),
    },
    {
      file: `03-fee-partial-overdue__${slugify(label("DEMO-0001"))}.png`,
      title: "Partial payment (shows as overdue)",
      expected: "Warning · Fee overdue · see reception",
      memberLabel: label("DEMO-0001"),
      payload: tokenFor("DEMO-0001"),
    },
    {
      file: `04-fee-overdue__${slugify(label("DEMO-0020"))}.png`,
      title: "Late / overdue fee",
      expected: "Warning · Fee overdue · see reception",
      memberLabel: label("DEMO-0020"),
      payload: tokenFor("DEMO-0020"),
    },
    {
      file: `05-already-checked-in-clear__${slugify(label("DEMO-0007"))}.png`,
      title: "Already checked in (fees clear)",
      expected: "Info blue · Already checked in today",
      memberLabel: label("DEMO-0007"),
      payload: tokenFor("DEMO-0007"),
    },
    {
      file: `06-already-checked-in-due-soon__${slugify(label("DEMO-0013"))}.png`,
      title: "Already checked in + fee due soon",
      expected: "Info · Already checked in · Fee due soon",
      memberLabel: label("DEMO-0013"),
      payload: tokenFor("DEMO-0013"),
    },
    {
      file: `07-already-checked-in-overdue__${slugify(label("DEMO-0019"))}.png`,
      title: "Already checked in + overdue",
      expected: "Warning · Already checked in + fee overdue",
      memberLabel: label("DEMO-0019"),
      payload: tokenFor("DEMO-0019"),
    },
    {
      file: `08-frozen-inactive__${slugify(label("DEMO-0022"))}.png`,
      title: "Frozen membership",
      expected: "Error · Member is not active",
      memberLabel: label("DEMO-0022"),
      payload: tokenFor("DEMO-0022"),
    },
    {
      file: `09-expired-inactive__${slugify(label("DEMO-0024"))}.png`,
      title: "Expired membership",
      expected: "Error · Member is not active",
      memberLabel: label("DEMO-0024"),
      payload: tokenFor("DEMO-0024"),
    },
    {
      file: `10-outdated-replaced-card__${slugify(label("DEMO-0010"))}.png`,
      title: "Replaced / outdated QR (old card)",
      expected: "Error · Outdated card — use the latest card",
      memberLabel: label("DEMO-0010"),
      payload: outdatedToken,
    },
    {
      file: "11-wrong-gym__iron-republic-ahmed-khan.png",
      title: "Card from another gym (Iron Republic)",
      expected: "Error · This card belongs to another gym",
      memberLabel: "Ahmed Khan (IR-1001) · Iron Republic",
      payload: wrongGymToken,
    },
    {
      file: "12-member-not-found__ghost-uuid.png",
      title: "Valid JWT but member missing",
      expected: "Error · Member not found",
      memberLabel: "(ghost UUID)",
      payload: ghostToken,
    },
    {
      file: "13-invalid-qr__garbage.png",
      title: "Invalid / non-Barbellist QR payload",
      expected: "Error · Invalid QR code",
      memberLabel: "(garbage payload)",
      payload: "not-a-barbellist-membership-card",
    },
  ];

  // Also dump spare clear cards for freeform demo scanning
  const spareCodes = ["DEMO-0015", "DEMO-0016", "DEMO-0018"];
  for (const code of spareCodes) {
    const m = live.get(code);
    if (!m?.card_qr_token) continue;
    cases.push({
      file: `spare-clear__${slugify(m.name)}-${code.toLowerCase()}.png`,
      title: "Spare clear member (extra scans)",
      expected: "Success green · All Clear — Fee Paid",
      memberLabel: `${m.name} (${m.member_code})`,
      payload: m.card_qr_token,
    });
  }

  for (const c of cases) {
    await writeQrPng(path.join(OUT_DIR, c.file), c.payload);
    console.log(`✓ ${c.file}`);
  }

  const readme = [
    "# Density Fitness — kiosk QR demo pack",
    "",
    "For **Saturday 22 Aug 2026, 3:30 PM PKT** customer demo.",
    "",
    "Login as Density owner → **Attendance → Open Kiosk**, then scan each PNG",
    "(phone screen or print). Use full-screen / zoom so the camera locks quickly.",
    "",
    "## Demo order (recommended)",
    "",
    "| # | File | Case | Expected |",
    "|---|------|------|----------|",
    ...cases
      .filter((c) => !c.file.startsWith("spare-"))
      .map((c, i) => {
        const n = String(i + 1).padStart(2, "0");
        return `| ${n} | \`${c.file}\` | ${c.title}<br/>_${c.memberLabel}_ | ${c.expected} |`;
      }),
    "",
    "## Spare clear cards",
    "",
    "Extra paid members if you want multiple happy-path scans:",
    "",
    ...cases
      .filter((c) => c.file.startsWith("spare-"))
      .map((c) => `- \`${c.file}\` — ${c.memberLabel}`),
    "",
    "## Notes",
    "",
    "- **Already checked in** rows are pre-seeded open sessions on demo day (22 Aug).",
    "- **Due soon** dues were adjusted to Aug 23–24 for the demo window.",
    "- **Outdated card**: PNG has an old JWT; DB has a newer `card_qr_token`.",
    "- **Wrong gym**: Iron Republic member JWT scanned on Density kiosk.",
    "- Re-run: `npx tsx --env-file=.env.local scripts/generate-density-demo-qrs.mts`",
    "",
  ].join("\n");

  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(cases.map(({ payload: _p, ...rest }) => rest), null, 2),
    "utf8",
  );

  console.log(`\nWrote ${cases.length} QR PNGs → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
