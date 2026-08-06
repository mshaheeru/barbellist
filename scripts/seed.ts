/**
 * Seed demo gym "Iron Republic" with staff, packages, members, attendance,
 * expenses, inventory, and sales.
 *
 * Idempotent: if a gym with slug `iron-republic` already exists, exits without
 * duplicating data.
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *   npm run seed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Demo login (password for all seeded users): SeedDemo123!
 *   owner@ironrepublic.demo
 *   manager@ironrepublic.demo
 *   trainer1@ironrepublic.demo / trainer2@ironrepublic.demo
 *   cashier@ironrepublic.demo
 *   cleaner1@ironrepublic.demo / cleaner2@ironrepublic.demo
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEMO_PASSWORD = "SeedDemo123!";
const GYM_SLUG = "iron-republic";

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

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function firstOfMonthOffset(monthsBack: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsBack);
  return isoDate(d);
}

const MEMBER_NAMES = [
  "Ahmed Khan",
  "Bilal Hussain",
  "Usman Ali",
  "Hamza Sheikh",
  "Zain Malik",
  "Omar Farooq",
  "Hassan Raza",
  "Fahad Iqbal",
  "Saad Mirza",
  "Taha Qureshi",
  "Ayesha Siddiqui",
  "Fatima Noor",
  "Sana Ahmed",
  "Maryam Butt",
  "Hira Nadeem",
  "Rabia Khan",
  "Nida Shah",
  "Saba Rauf",
  "Mehwish Anwar",
  "Kiran Javed",
  "Ali Haider",
  "Imran Abbas",
  "Waleed Asif",
  "Danish Gul",
  "Rehan Siddique",
];

type StaffSeed = {
  name: string;
  email: string;
  role: "owner" | "manager" | "trainer" | "cashier" | "cleaner";
  salary: number | null;
};

const STAFF: StaffSeed[] = [
  {
    name: "Kamran Owner",
    email: "owner@ironrepublic.demo",
    role: "owner",
    salary: null,
  },
  {
    name: "Nadia Manager",
    email: "manager@ironrepublic.demo",
    role: "manager",
    salary: 80000,
  },
  {
    name: "Asad Trainer",
    email: "trainer1@ironrepublic.demo",
    role: "trainer",
    salary: 45000,
  },
  {
    name: "Farah Trainer",
    email: "trainer2@ironrepublic.demo",
    role: "trainer",
    salary: 42000,
  },
  {
    name: "Junaid Cashier",
    email: "cashier@ironrepublic.demo",
    role: "cashier",
    salary: 35000,
  },
  {
    name: "Rashid Cleaner",
    email: "cleaner1@ironrepublic.demo",
    role: "cleaner",
    salary: 25000,
  },
  {
    name: "Imtiaz Cleaner",
    email: "cleaner2@ironrepublic.demo",
    role: "cleaner",
    salary: 25000,
  },
];

const PACKAGES = [
  {
    name: "Basic",
    price: 4500,
    duration_days: 30,
    color: "#7A7A70",
    sort_order: 1,
  },
  {
    name: "Standard",
    price: 7500,
    duration_days: 30,
    color: "#1B5E3C",
    sort_order: 2,
  },
  {
    name: "Premium",
    price: 12000,
    duration_days: 30,
    color: "#C9861B",
    sort_order: 3,
  },
];

const INVENTORY = [
  {
    name: "Whey Protein 2kg",
    category: "supplements",
    selling_price: 8500,
    unit_cost: 6200,
    stock_qty: 24,
    sku: "SUP-WHEY-2",
  },
  {
    name: "Creatine 300g",
    category: "supplements",
    selling_price: 3200,
    unit_cost: 2100,
    stock_qty: 40,
    sku: "SUP-CRE-300",
  },
  {
    name: "BCAA 500ml",
    category: "supplements",
    selling_price: 1800,
    unit_cost: 1100,
    stock_qty: 30,
    sku: "SUP-BCAA",
  },
  {
    name: "Energy Drink",
    category: "drinks",
    selling_price: 250,
    unit_cost: 140,
    stock_qty: 120,
    sku: "DRK-ENR",
  },
  {
    name: "Protein Shake Ready",
    category: "drinks",
    selling_price: 450,
    unit_cost: 280,
    stock_qty: 60,
    sku: "DRK-SHAKE",
  },
  {
    name: "Mineral Water 1.5L",
    category: "drinks",
    selling_price: 80,
    unit_cost: 40,
    stock_qty: 200,
    sku: "DRK-H2O",
  },
  {
    name: "Lifting Straps",
    category: "accessories",
    selling_price: 1200,
    unit_cost: 600,
    stock_qty: 18,
    sku: "ACC-STRAP",
  },
  {
    name: "Gym Gloves",
    category: "accessories",
    selling_price: 1500,
    unit_cost: 800,
    stock_qty: 22,
    sku: "ACC-GLOVE",
  },
  {
    name: "Resistance Band Set",
    category: "accessories",
    selling_price: 2200,
    unit_cost: 1100,
    stock_qty: 15,
    sku: "ACC-BAND",
  },
  {
    name: "Shaker Bottle",
    category: "accessories",
    selling_price: 600,
    unit_cost: 250,
    stock_qty: 50,
    sku: "ACC-SHAKER",
  },
];

async function main() {
  console.log("Seeding Iron Republic…");

  const { data: existing } = await admin
    .from("gyms")
    .select("id")
    .eq("slug", GYM_SLUG)
    .maybeSingle();

  if (existing) {
    console.log(
      `Gym slug "${GYM_SLUG}" already exists (${existing.id}). Skipping seed.`,
    );
    process.exit(0);
  }

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: "Iron Republic",
      slug: GYM_SLUG,
      subscription_plan: "early_bird",
      subscription_status: "active",
    })
    .select("id")
    .single();

  if (orgError || !org) {
    throw new Error(orgError?.message ?? "Failed to create organization");
  }

  const { data: gym, error: gymError } = await admin
    .from("gyms")
    .insert({
      organization_id: org.id,
      name: "Iron Republic",
      slug: GYM_SLUG,
      address: "12 Gulberg Main Boulevard",
      city: "Lahore",
      country: "Pakistan",
      phone: "03001234567",
      whatsapp: "03001234567",
      email: "hello@ironrepublic.demo",
      timezone: "Asia/Karachi",
      currency: "PKR",
      currency_symbol: "Rs.",
      settings: {
        reminders: {
          days_before_due: 3,
          on_due_date: true,
          overdue_every_days: 3,
          max_per_due: 5,
        },
      },
    })
    .select("id")
    .single();

  if (gymError || !gym) {
    throw new Error(gymError?.message ?? "Failed to create gym");
  }

  const gymId = gym.id;
  const organizationId = org.id;
  console.log("Org:", organizationId, "Gym:", gymId);

  const staffIdsByEmail: Record<string, string> = {};
  let ownerStaffId = "";
  let cashierStaffId = "";
  let trainerStaffId = "";

  for (const s of STAFF) {
    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: s.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        app_metadata: {
          organization_id: organizationId,
          gym_id: gymId,
          role: s.role,
        },
        user_metadata: {
          name: s.name,
        },
      });

    if (authError || !authData.user) {
      throw new Error(
        `Auth user ${s.email}: ${authError?.message ?? "failed"}`,
      );
    }

    if (s.role === "owner") {
      const { error: memberError } = await admin
        .from("organization_members")
        .insert({
          organization_id: organizationId,
          auth_user_id: authData.user.id,
          role: "owner",
        });
      if (memberError) {
        throw new Error(`Org member ${s.email}: ${memberError.message}`);
      }
    }

    const { data: staffRow, error: staffError } = await admin
      .from("staff")
      .insert({
        gym_id: gymId,
        auth_user_id: authData.user.id,
        name: s.name,
        email: s.email,
        phone: "0300" + String(Math.floor(1000000 + Math.random() * 8999999)),
        role: s.role,
        monthly_salary: s.salary,
        status: "active",
        joining_date: isoDate(daysAgo(120)),
      })
      .select("id")
      .single();

    if (staffError || !staffRow) {
      throw new Error(staffError?.message ?? "staff insert failed");
    }

    staffIdsByEmail[s.email] = staffRow.id;
    if (s.role === "owner") ownerStaffId = staffRow.id;
    if (s.role === "cashier") cashierStaffId = staffRow.id;
    if (s.role === "trainer" && !trainerStaffId) trainerStaffId = staffRow.id;
    console.log(`  staff ${s.role}: ${s.email}`);
  }

  const { data: pkgs, error: pkgError } = await admin
    .from("packages")
    .insert(
      PACKAGES.map((p) => ({
        gym_id: gymId,
        name: p.name,
        price: p.price,
        duration_days: p.duration_days,
        color: p.color,
        sort_order: p.sort_order,
        is_active: true,
        features: ["Gym floor access", "Locker"],
      })),
    )
    .select("id, name, price");

  if (pkgError || !pkgs?.length) {
    throw new Error(pkgError?.message ?? "packages failed");
  }

  console.log(`  packages: ${pkgs.length}`);

  const memberIds: string[] = [];
  const statuses = ["active", "active", "active", "active", "overdue", "frozen"];

  for (let i = 0; i < MEMBER_NAMES.length; i++) {
    const pkg = pkgs[i % pkgs.length]!;
    const statusCycle = statuses[i % statuses.length]!;
    const memberStatus =
      statusCycle === "overdue" ? "active" : statusCycle === "frozen" ? "frozen" : "active";
    const code = `IR-${String(1001 + i)}`;
    const start = daysAgo(40 + (i % 20));
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    const { data: member, error: memError } = await admin
      .from("members")
      .insert({
        gym_id: gymId,
        member_code: code,
        name: MEMBER_NAMES[i],
        phone: `0301${String(1000000 + i).slice(0, 7)}`,
        whatsapp: `0301${String(1000000 + i).slice(0, 7)}`,
        gender: i < 10 || i >= 20 ? "male" : "female",
        package_id: pkg.id,
        membership_start: isoDate(start),
        membership_end: isoDate(end),
        status: memberStatus,
        joined_at: start.toISOString(),
        freeze_start: memberStatus === "frozen" ? isoDate(daysAgo(5)) : null,
        freeze_end: memberStatus === "frozen" ? isoDate(daysAgo(-10)) : null,
      })
      .select("id")
      .single();

    if (memError || !member) {
      throw new Error(memError?.message ?? "member insert failed");
    }

    memberIds.push(member.id);

    const monthStart = firstOfMonthOffset(0);
    const prevMonth = firstOfMonthOffset(1);
    const feeStatus =
      statusCycle === "overdue"
        ? "overdue"
        : i % 5 === 0
          ? "partial"
          : i % 7 === 0
            ? "pending"
            : "paid";

    const amountDue = Number(pkg.price);
    const amountPaid =
      feeStatus === "paid"
        ? amountDue
        : feeStatus === "partial"
          ? Math.round(amountDue * 0.4)
          : 0;

    await admin.from("fee_dues").insert({
      gym_id: gymId,
      member_id: member.id,
      amount_due: amountDue,
      amount_paid: amountPaid,
      due_date: monthStart,
      status: feeStatus === "paid" ? "paid" : feeStatus,
      generated_for_month: monthStart,
    });

    if (i % 2 === 0) {
      await admin.from("fee_dues").insert({
        gym_id: gymId,
        member_id: member.id,
        amount_due: amountDue,
        amount_paid: amountDue,
        due_date: prevMonth,
        status: "paid",
        generated_for_month: prevMonth,
      });
    }
  }

  console.log(`  members: ${memberIds.length}`);

  // 60 days of attendance (varied)
  const attendanceRows: Array<Record<string, unknown>> = [];
  for (let day = 0; day < 60; day++) {
    const d = daysAgo(day);
    const hour = 7 + (day % 12);
    d.setHours(hour, 15 + (day % 40), 0, 0);
    const count = 4 + (day % 8);
    for (let j = 0; j < count; j++) {
      const mid = memberIds[(day * 3 + j) % memberIds.length]!;
      attendanceRows.push({
        gym_id: gymId,
        member_id: mid,
        person_type: "member",
        check_in_method: j % 3 === 0 ? "qr" : "manual",
        check_in_at: d.toISOString(),
        fee_status_at_checkin: "paid",
      });
    }
    // staff check-ins some days
    if (day % 2 === 0 && trainerStaffId) {
      attendanceRows.push({
        gym_id: gymId,
        staff_id: trainerStaffId,
        person_type: "staff",
        check_in_method: "manual",
        check_in_at: d.toISOString(),
      });
    }
  }

  // batch insert attendance
  for (let i = 0; i < attendanceRows.length; i += 200) {
    const chunk = attendanceRows.slice(i, i + 200);
    const { error } = await admin.from("attendance").insert(chunk);
    if (error) throw new Error(`attendance: ${error.message}`);
  }
  console.log(`  attendance rows: ${attendanceRows.length}`);

  // 2 months expenses
  const expenseCats = [
    "utilities",
    "maintenance",
    "cleaning",
    "equipment",
    "rent",
  ] as const;
  const expenses: Array<Record<string, unknown>> = [];

  for (const monthsBack of [0, 1]) {
    const monthDate = firstOfMonthOffset(monthsBack);
    // salaries
    for (const s of STAFF) {
      if (s.salary == null) continue;
      expenses.push({
        gym_id: gymId,
        category: "salary",
        description: `Salary — ${s.name}`,
        amount: s.salary,
        payment_method: "bank_transfer",
        staff_id: staffIdsByEmail[s.email],
        salary_month: monthDate,
        is_salary_full_month: true,
        recorded_by: ownerStaffId,
        expense_date: monthDate,
        status: "paid",
      });
    }
    for (let e = 0; e < expenseCats.length; e++) {
      const day = new Date(monthDate);
      day.setDate(3 + e * 4);
      expenses.push({
        gym_id: gymId,
        category: expenseCats[e],
        description: `${expenseCats[e]} — ${monthDate.slice(0, 7)}`,
        amount: 5000 + e * 2500 + monthsBack * 500,
        payment_method: "cash",
        recorded_by: ownerStaffId,
        expense_date: isoDate(day),
        status: "paid",
      });
    }
  }

  const { error: expError } = await admin.from("expenses").insert(expenses);
  if (expError) throw new Error(`expenses: ${expError.message}`);
  console.log(`  expenses: ${expenses.length}`);

  const { data: items, error: invError } = await admin
    .from("inventory_items")
    .insert(
      INVENTORY.map((it) => ({
        gym_id: gymId,
        ...it,
        low_stock_threshold: 5,
        is_active: true,
      })),
    )
    .select("id, selling_price, name");

  if (invError || !items?.length) {
    throw new Error(invError?.message ?? "inventory failed");
  }
  console.log(`  inventory items: ${items.length}`);

  // sample sales
  for (let s = 0; s < 8; s++) {
    const item = items[s % items.length]!;
    const qty = 1 + (s % 3);
    const unit = Number(item.selling_price);
    const total = unit * qty;
    const soldAt = daysAgo(s * 3).toISOString();

    const { data: sale, error: saleError } = await admin
      .from("inventory_sales")
      .insert({
        gym_id: gymId,
        member_id: s % 2 === 0 ? memberIds[s] : null,
        is_walkin: s % 2 !== 0,
        subtotal: total,
        discount: 0,
        total,
        payment_method: "cash",
        recorded_by: cashierStaffId || ownerStaffId,
        sold_at: soldAt,
      })
      .select("id")
      .single();

    if (saleError || !sale) {
      throw new Error(saleError?.message ?? "sale failed");
    }

    await admin.from("inventory_sale_items").insert({
      sale_id: sale.id,
      item_id: item.id,
      quantity: qty,
      unit_price: unit,
      line_total: total,
    });
  }

  console.log("  inventory sales: 8");
  console.log("\nDone. Demo password for all staff: " + DEMO_PASSWORD);
  console.log("Owner login: owner@ironrepublic.demo");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
