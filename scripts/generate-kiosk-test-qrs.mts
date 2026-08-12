/**
 * One-off: generate Pro Gym kiosk QR PNGs covering every scanner outcome.
 * Usage: npx tsx --env-file=.env.local scripts/generate-kiosk-test-qrs.mts
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SignJWT } from "jose";
import QRCode from "qrcode";
import { createClient } from "@supabase/supabase-js";

const PRO_GYM_ID = "8b74d1c2-2351-40f5-9345-73b1b3ff94f5";
const IRON_REPUBLIC_ID = "6446daf8-ba9d-4de2-a7b3-c41c362a2509";
const OUT_DIR = path.join(process.cwd(), "kiosk-test-qrs");

const SECRET = process.env.QR_SIGNING_SECRET?.trim();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SECRET || !SUPABASE_URL || !SERVICE_KEY) {
  throw new Error("Missing QR_SIGNING_SECRET / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
}

async function signMemberQrToken(memberId: string, gymId: string): Promise<string> {
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

type CaseDef = {
  file: string;
  title: string;
  expected: string;
  memberId?: string;
  gymId?: string;
  /** Use an older replaced token (do not store as current card_qr_token). */
  outdated?: boolean;
  /** Do not write token to members.card_qr_token */
  skipDbUpdate?: boolean;
  /** Literal payload instead of JWT */
  literal?: string;
};

const cases: CaseDef[] = [
  {
    file: "01-fee-clear-paid__saad-malik.png",
    title: "Fee clear / paid — first check-in",
    expected: "Success green · All Clear — Fee Paid",
    memberId: "82119f1e-d474-4579-9b1f-bec638b5c01a",
    gymId: PRO_GYM_ID,
  },
  {
    file: "02-fee-due-soon__kashif-nawaz.png",
    title: "Fee due soon",
    expected: "Success · Checked in · Fee due soon",
    memberId: "c7b26836-9d74-4f51-b7ef-ab71bc24afb1",
    gymId: PRO_GYM_ID,
  },
  {
    file: "03-fee-overdue-late__ahmed-khan.png",
    title: "Late / overdue fee",
    expected: "Warning · Fee overdue · see reception",
    memberId: "a2bd247a-e795-4598-8b2b-8e9344572c42",
    gymId: PRO_GYM_ID,
  },
  {
    file: "04-already-checked-in-clear__faisal-qureshi.png",
    title: "Already checked in (fees clear)",
    expected: "Info blue · Already checked in today",
    memberId: "006bbe5c-080d-4725-9e25-ccee75911339",
    gymId: PRO_GYM_ID,
  },
  {
    file: "05-already-checked-in-due-soon__bilal-sheikh.png",
    title: "Already checked in + fee due soon",
    expected: "Info · Already checked in · Fee due soon",
    memberId: "d6905492-3210-46a4-9e11-05db0b327c2e",
    gymId: PRO_GYM_ID,
  },
  {
    file: "06-already-checked-in-overdue__usman-ali.png",
    title: "Already checked in + overdue",
    expected: "Warning · Already checked in + fee overdue",
    memberId: "19430017-9918-472d-a9c3-406140ae3e33",
    gymId: PRO_GYM_ID,
  },
  {
    file: "07-frozen-inactive__amna-tariq.png",
    title: "Frozen membership",
    expected: "Error · Membership inactive",
    memberId: "fac0c103-19f6-4429-8f8e-dca453c4b853",
    gymId: PRO_GYM_ID,
  },
  {
    file: "08-expired-inactive__maryam-khan.png",
    title: "Expired membership",
    expected: "Error · Membership inactive",
    memberId: "d8801322-8aac-49a0-86be-d879f852afb5",
    gymId: PRO_GYM_ID,
  },
  {
    file: "09-cancelled-inactive__kiosk-cancelled.png",
    title: "Cancelled membership",
    expected: "Error · Membership inactive",
    memberId: "8b2b4463-985d-4e6b-9ef3-947102784a5f",
    gymId: PRO_GYM_ID,
  },
  {
    file: "10-outdated-replaced-card__zubair-ahmed.png",
    title: "Replaced / outdated QR (old card)",
    expected: "Error · Outdated card",
    memberId: "7d127415-21d9-467e-9c06-744cf881dcd3",
    gymId: PRO_GYM_ID,
    outdated: true,
  },
  {
    file: "11-wrong-gym__iron-republic-ahmed.png",
    title: "Card from another gym (Iron Republic)",
    expected: "Error · Wrong gym",
    memberId: "f7eede0e-36e5-4712-80b7-ecbd7f740a20",
    gymId: IRON_REPUBLIC_ID,
    skipDbUpdate: true,
  },
  {
    file: "12-member-not-found__ghost-uuid.png",
    title: "Valid JWT but member UUID missing in Pro Gym",
    expected: "Error · Member not found",
    memberId: "00000000-0000-4000-8000-000000000099",
    gymId: PRO_GYM_ID,
    skipDbUpdate: true,
  },
  {
    file: "13-invalid-qr__garbage.png",
    title: "Invalid / non-Barbellist QR payload",
    expected: "Error · Invalid QR code",
    literal: "not-a-barbellist-membership-card",
    skipDbUpdate: true,
  },
];

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  await mkdir(OUT_DIR, { recursive: true });

  const manifest: Array<Record<string, string>> = [];

  for (const c of cases) {
    let payload: string;

    if (c.literal) {
      payload = c.literal;
    } else if (!c.memberId || !c.gymId) {
      throw new Error(`Case ${c.file} missing member/gym`);
    } else if (c.outdated) {
      const oldToken = await signMemberQrToken(c.memberId, c.gymId);
      // Small delay so iat differs
      await new Promise((r) => setTimeout(r, 1100));
      const newToken = await signMemberQrToken(c.memberId, c.gymId);
      const { error } = await supabase
        .from("members")
        .update({
          card_qr_token: newToken,
          card_issued_at: new Date().toISOString(),
        })
        .eq("id", c.memberId)
        .eq("gym_id", PRO_GYM_ID);
      if (error) throw new Error(`${c.file} db: ${error.message}`);
      payload = oldToken;
    } else {
      payload = await signMemberQrToken(c.memberId, c.gymId);
      if (!c.skipDbUpdate) {
        const { error } = await supabase
          .from("members")
          .update({
            card_qr_token: payload,
            card_issued_at: new Date().toISOString(),
          })
          .eq("id", c.memberId);
        if (error) throw new Error(`${c.file} db: ${error.message}`);
      }
    }

    const outPath = path.join(OUT_DIR, c.file);
    await writeQrPng(outPath, payload);

    manifest.push({
      file: c.file,
      title: c.title,
      expected: c.expected,
      member_id: c.memberId ?? "",
      member_code_hint: c.file,
    });

    console.log(`✓ ${c.file}`);
  }

  const readme = [
    "# Pro Gym kiosk QR test pack",
    "",
    "Scan these at **Attendance → Open Kiosk** while logged into **Pro Gym**.",
    "",
    "Generated to match `test-ahmed-qr.png` style (512×512, black/white PNG).",
    "",
    "| # | File | Case | Expected kiosk result |",
    "|---|------|------|------------------------|",
    ...manifest.map((m, i) => {
      const n = String(i + 1).padStart(2, "0");
      return `| ${n} | \`${m.file}\` | ${m.title} | ${m.expected} |`;
    }),
    "",
    "## Notes",
    "",
    "- **Already checked in** cases need an open attendance row for today (seeded).",
    "- **Outdated card**: PNG encodes an old JWT; DB holds a newer `card_qr_token`.",
    "- **Wrong gym**: Iron Republic member JWT — scanned on Pro Gym kiosk.",
    "- Re-run: `npx tsx --env-file=.env.local scripts/generate-kiosk-test-qrs.mts`",
    "",
  ].join("\n");

  await writeFile(path.join(OUT_DIR, "README.md"), readme, "utf8");
  await writeFile(
    path.join(OUT_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  console.log(`\nWrote ${cases.length} QR PNGs → ${OUT_DIR}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
