import type { SupabaseClient } from "@supabase/supabase-js";
import { signMemberQrToken } from "@/lib/qr/sign-member-token";
import type { StaffRole } from "@/lib/types";

export const DEMO_TAG = "demo_seed";

type PaymentMethod = "cash" | "easypaisa" | "jazzcash" | "bank_transfer";

const MEMBER_NAMES = [
  "Ahmed Khan",
  "Bilal Sheikh",
  "Muhammad Usman",
  "Hassan Raza",
  "Ali Raza",
  "Umer Farooq",
  "Saad Malik",
  "Hamza Siddiqui",
  "Faisal Qureshi",
  "Zubair Ahmed",
  "Tariq Mehmood",
  "Kashif Nawaz",
  "Danish Rehman",
  "Waqar Shah",
  "Asad Hussain",
  "Ayesha Malik",
  "Fatima Riaz",
  "Zainab Iqbal",
  "Sara Ahmed",
  "Hina Butt",
  "Rabia Noor",
  "Amna Tariq",
  "Sana Javed",
  "Nadia Akhtar",
  "Maryam Khan",
] as const;

const STAFF_SEED: Array<{
  name: string;
  role: Exclude<StaffRole, "owner" | "other">;
  salary: number;
}> = [
  { name: "Imran Malik", role: "trainer", salary: 18000 },
  { name: "Sadia Khan", role: "trainer", salary: 14000 },
  { name: "Yasir Ahmed", role: "trainer", salary: 12000 },
  { name: "Rashid Ali", role: "cashier", salary: 12000 },
  { name: "Nasreen Bibi", role: "cleaner", salary: 8000 },
  { name: "Kamran Sheikh", role: "cleaner", salary: 8000 },
  { name: "Junaid Iqbal", role: "manager", salary: 16000 },
];

const PACKAGES_SEED = [
  {
    name: "Basic",
    price: 4500,
    features: ["Gym floor access", "Locker"],
    color: "#1B5E3C",
    sort_order: 1,
  },
  {
    name: "Standard",
    price: 7500,
    features: [
      "Gym floor access",
      "Locker",
      "Cardio zone",
      "1 PT session/week",
    ],
    color: "#C9861B",
    bmi_min: 25,
    bmi_max: 35,
    recommended_goals: ["weight_loss", "general_fitness"],
    sort_order: 2,
  },
  {
    name: "Premium",
    price: 12000,
    features: [
      "Full access",
      "Locker",
      "Sauna",
      "3 PT sessions/week",
      "Diet plan",
    ],
    color: "#1F1F1F",
    sort_order: 3,
  },
] as const;

const INVENTORY_SEED = [
  {
    name: "Whey Protein 2kg (Chocolate)",
    category: "supplements",
    unit_cost: 8500,
    selling_price: 11000,
    stock_qty: 12,
    low_stock_threshold: 5,
  },
  {
    name: "Whey Protein 2kg (Vanilla)",
    category: "supplements",
    unit_cost: 8500,
    selling_price: 11000,
    stock_qty: 3,
    low_stock_threshold: 5,
  },
  {
    name: "Mass Gainer 3kg",
    category: "supplements",
    unit_cost: 9200,
    selling_price: 12500,
    stock_qty: 6,
    low_stock_threshold: 5,
  },
  {
    name: "BCAA 300g",
    category: "supplements",
    unit_cost: 3200,
    selling_price: 4500,
    stock_qty: 8,
    low_stock_threshold: 5,
  },
  {
    name: "Gatorade 500ml",
    category: "drinks",
    unit_cost: 140,
    selling_price: 250,
    stock_qty: 34,
    low_stock_threshold: 10,
  },
  {
    name: "Sting Energy",
    category: "drinks",
    unit_cost: 65,
    selling_price: 120,
    stock_qty: 48,
    low_stock_threshold: 10,
  },
  {
    name: "Nestle Water 1.5L",
    category: "drinks",
    unit_cost: 60,
    selling_price: 100,
    stock_qty: 22,
    low_stock_threshold: 10,
  },
  {
    name: "Protein Bar",
    category: "snacks",
    unit_cost: 320,
    selling_price: 500,
    stock_qty: 0,
    low_stock_threshold: 5,
  },
  {
    name: "Lifting Gloves (M)",
    category: "accessories",
    unit_cost: 850,
    selling_price: 1500,
    stock_qty: 5,
    low_stock_threshold: 5,
  },
  {
    name: "Shaker Bottle",
    category: "accessories",
    unit_cost: 280,
    selling_price: 500,
    stock_qty: 18,
    low_stock_threshold: 5,
  },
] as const;

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function firstOfMonthOffset(monthsBack: number): string {
  const d = new Date();
  return isoDate(new Date(d.getFullYear(), d.getMonth() - monthsBack, 1));
}

function pickPaymentMethod(i: number): PaymentMethod {
  const roll = i % 100;
  if (roll < 45) return "cash";
  if (roll < 70) return "easypaisa";
  if (roll < 90) return "jazzcash";
  return "bank_transfer";
}

function randomWhatsApp(i: number): string {
  const prefix = 300 + (i % 10);
  const rest = String(1000000 + ((i * 7919) % 8999999)).padStart(7, "0");
  return `+92 ${prefix} ${rest}`;
}

function randBetween(min: number, max: number, seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const frac = x - Math.floor(x);
  return Math.floor(min + frac * (max - min + 1));
}

function peakHour(day: number, slot: number): { h: number; m: number } {
  // Mostly 6–8 AM and 5–9 PM
  if (slot % 2 === 0) {
    return { h: 6 + (day + slot) % 3, m: (day * 7 + slot * 11) % 60 };
  }
  return { h: 17 + (day + slot) % 5, m: (day * 13 + slot * 17) % 60 };
}

export async function demoAlreadyLoaded(
  supabase: SupabaseClient,
  gymId: string,
): Promise<boolean> {
  const [{ data: pkgs }, { data: members }] = await Promise.all([
    supabase
      .from("packages")
      .select("id")
      .eq("gym_id", gymId)
      .ilike("description", `%${DEMO_TAG}%`)
      .limit(1),
    supabase
      .from("members")
      .select("id")
      .eq("gym_id", gymId)
      .ilike("notes", `%${DEMO_TAG}%`)
      .limit(1),
  ]);
  return Boolean(pkgs?.length || members?.length);
}

/**
 * Populate a gym with tagged demo_seed data (packages, staff, members, fees,
 * attendance, expenses, inventory). Idempotent via demoAlreadyLoaded check.
 */
export async function seedDemoDataForGym(
  supabase: SupabaseClient,
  gymId: string,
  recordedByStaffId: string | null,
): Promise<{ error: string | null }> {
  if (await demoAlreadyLoaded(supabase, gymId)) {
    return {
      error: "Demo data already loaded. Clear it first before loading again.",
    };
  }

  // --- Packages ---
  const { data: packages, error: pkgError } = await supabase
    .from("packages")
    .insert(
      PACKAGES_SEED.map((p) => ({
        gym_id: gymId,
        name: p.name,
        description: DEMO_TAG,
        price: p.price,
        duration_days: 30,
        features: [...p.features],
        color: p.color,
        sort_order: p.sort_order,
        is_active: true,
        bmi_min: "bmi_min" in p ? p.bmi_min : null,
        bmi_max: "bmi_max" in p ? p.bmi_max : null,
        recommended_goals:
          "recommended_goals" in p ? [...p.recommended_goals] : null,
      })),
    )
    .select("id, name, price");

  if (pkgError || !packages?.length) {
    return { error: pkgError?.message ?? "Failed to create packages" };
  }

  // --- Staff ---
  const { data: staffRows, error: staffError } = await supabase
    .from("staff")
    .insert(
      STAFF_SEED.map((s, i) => ({
        gym_id: gymId,
        auth_user_id: null,
        name: s.name,
        phone: `0300${String(2000000 + i).slice(0, 7)}`,
        whatsapp: randomWhatsApp(100 + i),
        role: s.role,
        monthly_salary: s.salary,
        status: "active",
        joining_date: isoDate(daysAgo(90 + i * 10)),
        notes: DEMO_TAG,
      })),
    )
    .select("id, name, role, monthly_salary");

  if (staffError || !staffRows?.length) {
    return { error: staffError?.message ?? "Failed to create staff" };
  }

  const recordedBy = recordedByStaffId ?? staffRows[0]!.id;

  // --- Members ---
  // 18 active, 3 overdue (active + overdue dues), 2 frozen, 2 expired
  const memberStatuses: Array<"active" | "frozen" | "expired"> = [
    ...Array(18).fill("active"),
    ...Array(3).fill("active"), // overdue members stay active
    ...Array(2).fill("frozen"),
    ...Array(2).fill("expired"),
  ] as Array<"active" | "frozen" | "expired">;

  const overdueMemberIndexes = new Set([18, 19, 20]);
  const partialPaymentIndexes = new Set([0, 1, 2]);
  // 3 overdue members have no current-month payment (Fees page still has demo cases)
  const noCurrentPaymentIndexes = new Set([18, 19, 20]);

  type MemberInsert = {
    id: string;
    package_id: string;
    package_price: number;
    status: string;
    index: number;
  };

  const memberPayloads = MEMBER_NAMES.map((name, i) => {
    const pkg = packages[i % packages.length]!;
    const status = memberStatuses[i]!;
    const start = daysAgo(30 + (i % 150)); // staggered over ~6 months
    const end = new Date(start);
    end.setDate(end.getDate() + 30);

    if (status === "expired") {
      end.setTime(daysAgo(15 + (i % 10)).getTime());
    }

    const height = randBetween(155, 185, i + 1);
    const weight = randBetween(55, 110, i + 7);
    const code = `DEMO-${String(i + 1).padStart(4, "0")}`;

    return {
      row: {
        gym_id: gymId,
        member_code: code,
        name,
        phone: randomWhatsApp(i).replace("+92 ", "0").replace(/\s/g, ""),
        whatsapp: randomWhatsApp(i),
        gender: i < 15 ? "male" : "female",
        height_cm: height,
        weight_kg: weight,
        package_id: pkg.id,
        membership_start: isoDate(start),
        membership_end: isoDate(end),
        status,
        joined_at: start.toISOString(),
        freeze_start: status === "frozen" ? isoDate(daysAgo(7)) : null,
        freeze_end: status === "frozen" ? isoDate(daysAgo(-14)) : null,
        freeze_reason: status === "frozen" ? "Travel" : null,
        notes: DEMO_TAG,
      },
      meta: {
        code,
        package_id: pkg.id,
        package_price: Number(pkg.price),
        status,
        index: i,
      },
    };
  });

  const { data: insertedMembers, error: memError } = await supabase
    .from("members")
    .insert(memberPayloads.map((p) => p.row))
    .select("id, member_code");

  if (memError || !insertedMembers?.length) {
    return { error: memError?.message ?? "Failed to create members" };
  }

  const idByCode = new Map(
    insertedMembers.map((m) => [m.member_code, m.id] as const),
  );

  const membersMeta: MemberInsert[] = [];
  for (const { meta } of memberPayloads) {
    const id = idByCode.get(meta.code);
    if (!id) {
      return { error: `Failed to resolve member ${meta.code}` };
    }
    membersMeta.push({
      id,
      package_id: meta.package_id,
      package_price: meta.package_price,
      status: meta.status,
      index: meta.index,
    });
  }

  const issuedAt = new Date().toISOString();
  await Promise.all(
    membersMeta.map(async (m) => {
      try {
        const token = await signMemberQrToken(m.id, gymId);
        await supabase
          .from("members")
          .update({
            card_qr_token: token,
            card_issued_at: issuedAt,
          })
          .eq("id", m.id)
          .eq("gym_id", gymId);
      } catch {
        // QR_SIGNING_SECRET may be missing in some envs; continue without tokens
      }
    }),
  );

  // --- Fee dues + payments (last 2 months) ---
  const feeDueRows: Array<Record<string, unknown>> = [];
  const paymentRows: Array<Record<string, unknown>> = [];

  for (const m of membersMeta) {
    if (m.status === "expired" || m.status === "frozen") {
      // Still generate last month paid due for realism on non-active; skip current
      const prevMonth = firstOfMonthOffset(1);
      feeDueRows.push({
        gym_id: gymId,
        member_id: m.id,
        amount_due: m.package_price,
        amount_paid: m.package_price,
        due_date: prevMonth,
        status: "paid",
        generated_for_month: prevMonth,
        notes: DEMO_TAG,
      });
      paymentRows.push({
        gym_id: gymId,
        member_id: m.id,
        amount: m.package_price,
        payment_type: "membership",
        payment_method: pickPaymentMethod(m.index),
        is_partial: false,
        covers_from: prevMonth,
        covers_to: isoDate(
          (() => {
            const d = new Date(prevMonth);
            d.setMonth(d.getMonth() + 1);
            d.setDate(0);
            return d;
          })(),
        ),
        notes: DEMO_TAG,
        recorded_by: recordedBy,
        paid_at: new Date(prevMonth).toISOString(),
      });
      continue;
    }

    for (const monthsBack of [0, 1]) {
      const monthDate = firstOfMonthOffset(monthsBack);
      const isCurrent = monthsBack === 0;
      const isOverdueMember = overdueMemberIndexes.has(m.index);
      const isPartial = partialPaymentIndexes.has(m.index) && isCurrent;
      const noPayment =
        isCurrent && noCurrentPaymentIndexes.has(m.index);

      let status: string;
      let amountPaid: number;

      if (noPayment || (isOverdueMember && isCurrent)) {
        status = "overdue";
        amountPaid = 0;
      } else if (isPartial) {
        status = "partial";
        amountPaid = Math.round(m.package_price * 0.4);
      } else {
        status = "paid";
        amountPaid = m.package_price;
      }

      // Previous month always paid for active members (except we already handled)
      if (!isCurrent) {
        status = "paid";
        amountPaid = m.package_price;
      }

      feeDueRows.push({
        gym_id: gymId,
        member_id: m.id,
        amount_due: m.package_price,
        amount_paid: amountPaid,
        due_date: monthDate,
        status,
        generated_for_month: monthDate,
        notes: DEMO_TAG,
      });

      if (amountPaid > 0) {
        paymentRows.push({
          gym_id: gymId,
          member_id: m.id,
          amount: amountPaid,
          payment_type: "membership",
          payment_method: pickPaymentMethod(m.index + monthsBack * 3),
          is_partial: isPartial,
          covers_from: monthDate,
          covers_to: isoDate(
            (() => {
              const d = new Date(monthDate);
              d.setMonth(d.getMonth() + 1);
              d.setDate(0);
              return d;
            })(),
          ),
          notes: DEMO_TAG,
          recorded_by: recordedBy,
          paid_at: new Date(
            new Date(monthDate).getTime() + 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        });
      }
    }
  }

  const { error: duesError } = await supabase.from("fee_dues").insert(feeDueRows);
  if (duesError) return { error: duesError.message };

  const { error: payError } = await supabase.from("payments").insert(paymentRows);
  if (payError) return { error: payError.message };

  // --- Attendance (last 60 days) ---
  const activeMemberIds = membersMeta
    .filter((m) => m.status === "active")
    .map((m) => m.id);
  const staffIds = staffRows.map((s) => s.id);
  const attendanceRows: Array<Record<string, unknown>> = [];

  for (let day = 0; day < 60; day++) {
    const d = daysAgo(day);
    const dow = d.getDay(); // 0 Sun … 6 Sat
    const isWeekend = dow === 0 || dow === 6;
    const memberCount = isWeekend
      ? randBetween(8, 11, day + 50)
      : randBetween(11, 15, day + 50);
    const staffCount = randBetween(3, 5, day + 90);

    for (let j = 0; j < memberCount; j++) {
      const mid =
        activeMemberIds[(day * 5 + j) % Math.max(activeMemberIds.length, 1)];
      if (!mid) continue;
      const { h, m } = peakHour(day, j);
      const checkIn = new Date(d);
      checkIn.setHours(h, m, (j * 7) % 60, 0);
      attendanceRows.push({
        gym_id: gymId,
        member_id: mid,
        person_type: "member",
        check_in_method: j % 5 === 0 ? "manual" : "qr", // ~80% qr
        check_in_at: checkIn.toISOString(),
        fee_status_at_checkin: "clear",
        notes: DEMO_TAG,
      });
    }

    for (let j = 0; j < staffCount; j++) {
      const sid = staffIds[(day + j) % staffIds.length]!;
      const { h, m } = peakHour(day, j + 20);
      const checkIn = new Date(d);
      checkIn.setHours(h, m, 0, 0);
      attendanceRows.push({
        gym_id: gymId,
        staff_id: sid,
        person_type: "staff",
        check_in_method: j % 5 === 0 ? "manual" : "qr",
        check_in_at: checkIn.toISOString(),
        notes: DEMO_TAG,
      });
    }
  }

  for (let i = 0; i < attendanceRows.length; i += 200) {
    const chunk = attendanceRows.slice(i, i + 200);
    const { error } = await supabase.from("attendance").insert(chunk);
    if (error) return { error: `attendance: ${error.message}` };
  }

  // --- Expenses (last 2 months) ---
  const expenseRows: Array<Record<string, unknown>> = [];
  const utilAmounts: Record<string, [number, number]> = {
    "K-Electric bill": [18000, 16000],
    "SSGC gas": [5000, 4500],
    "Water tanker": [3500, 3500],
    "Floor cleaner + supplies": [2000, 2200],
  };

  for (const monthsBack of [0, 1] as const) {
    const monthDate = firstOfMonthOffset(monthsBack);

    for (const s of staffRows) {
      expenseRows.push({
        gym_id: gymId,
        category: "salary",
        description: `Salary — ${s.name}`,
        amount: Number(s.monthly_salary),
        payment_method: "bank_transfer",
        staff_id: s.id,
        salary_month: monthDate,
        is_salary_full_month: true,
        recorded_by: recordedBy,
        expense_date: monthDate,
        status: "paid",
        notes: DEMO_TAG,
      });
    }

    for (const [desc, amounts] of Object.entries(utilAmounts)) {
      expenseRows.push({
        gym_id: gymId,
        category: "utilities",
        description: desc,
        amount: amounts[monthsBack],
        payment_method: pickPaymentMethod(monthsBack + desc.length),
        recorded_by: recordedBy,
        expense_date: isoDate(
          (() => {
            const d = new Date(monthDate);
            d.setDate(5 + monthsBack);
            return d;
          })(),
        ),
        status: "paid",
        notes: DEMO_TAG,
      });
    }

    expenseRows.push({
      gym_id: gymId,
      category: "miscellaneous",
      description: "Tea/refreshments",
      amount: 1200,
      payment_method: "cash",
      recorded_by: recordedBy,
      expense_date: isoDate(
        (() => {
          const d = new Date(monthDate);
          d.setDate(12);
          return d;
        })(),
      ),
      status: "paid",
      notes: DEMO_TAG,
    });
  }

  // One-off repairs/maintenance (recent month)
  expenseRows.push(
    {
      gym_id: gymId,
      category: "repairs",
      description: "Treadmill belt repair",
      amount: 3500,
      payment_method: "cash",
      recorded_by: recordedBy,
      expense_date: isoDate(daysAgo(18)),
      status: "paid",
      notes: DEMO_TAG,
    },
    {
      gym_id: gymId,
      category: "maintenance",
      description: "Bulb replacement",
      amount: 1200,
      payment_method: "easypaisa",
      recorded_by: recordedBy,
      expense_date: isoDate(daysAgo(12)),
      status: "paid",
      notes: DEMO_TAG,
    },
  );

  const { error: expError } = await supabase.from("expenses").insert(expenseRows);
  if (expError) return { error: expError.message };

  // --- Inventory ---
  const { data: items, error: invError } = await supabase
    .from("inventory_items")
    .insert(
      INVENTORY_SEED.map((item, i) => ({
        gym_id: gymId,
        name: item.name,
        category: item.category,
        description: DEMO_TAG,
        unit_cost: item.unit_cost,
        selling_price: item.selling_price,
        stock_qty: item.stock_qty,
        low_stock_threshold: item.low_stock_threshold,
        sku: `DEMO-${String(i + 1).padStart(3, "0")}`,
        is_active: true,
      })),
    )
    .select("id, selling_price, stock_qty, name");

  if (invError || !items?.length) {
    return { error: invError?.message ?? "Failed to create inventory" };
  }

  // --- Inventory sales (last month, 8 sales) ---
  // Insert sales with notes; sale items trigger stock deduction — bump stock first
  // so deduction doesn't go negative for demo items we just set.
  // Prefer high-stock items so sale triggers don't drive qty negative
  const sellable = items.filter((it) => Number(it.stock_qty) >= 10);
  if (sellable.length === 0) {
    return { error: "No sellable inventory for demo sales" };
  }

  const salePayloads: Array<{
    sale: Record<string, unknown>;
    lines: Array<{
      item_id: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;
  }> = [];

  for (let s = 0; s < 8; s++) {
    const isWalkin = s % 3 === 0;
    const memberId = isWalkin
      ? null
      : activeMemberIds[s % activeMemberIds.length] ?? null;
    const lineCount = 1 + (s % 3);
    const lines: Array<{
      item_id: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];

    for (let l = 0; l < lineCount; l++) {
      const item = sellable[(s + l) % sellable.length]!;
      const qty = 1;
      const unit = Number(item.selling_price);
      lines.push({
        item_id: item.id,
        quantity: qty,
        unit_price: unit,
        line_total: unit * qty,
      });
    }

    const subtotal = lines.reduce((sum, l) => sum + l.line_total, 0);
    const soldAt = daysAgo(2 + s * 3);

    salePayloads.push({
      sale: {
        gym_id: gymId,
        member_id: memberId,
        is_walkin: isWalkin,
        subtotal,
        discount: 0,
        total: subtotal,
        payment_method: pickPaymentMethod(s),
        recorded_by: recordedBy,
        sold_at: soldAt.toISOString(),
        notes: DEMO_TAG,
      },
      lines,
    });
  }

  const { data: sales, error: saleError } = await supabase
    .from("inventory_sales")
    .insert(salePayloads.map((p) => p.sale))
    .select("id, sold_at");

  if (saleError || !sales?.length || sales.length !== salePayloads.length) {
    return { error: saleError?.message ?? "Failed to create sales" };
  }

  const saleIdBySoldAt = new Map(
    sales.map((s) => [new Date(s.sold_at).toISOString(), s.id] as const),
  );

  const expectedLineCount = salePayloads.reduce(
    (n, p) => n + p.lines.length,
    0,
  );
  const saleItemRows = salePayloads.flatMap((payload) => {
    const soldAtKey = new Date(payload.sale.sold_at as string).toISOString();
    const saleId = saleIdBySoldAt.get(soldAtKey);
    if (!saleId) return [];
    return payload.lines.map((l) => ({ ...l, sale_id: saleId }));
  });

  if (saleItemRows.length !== expectedLineCount) {
    return { error: "Failed to resolve sale line items" };
  }

  const { error: lineError } = await supabase
    .from("inventory_sale_items")
    .insert(saleItemRows);

  if (lineError) return { error: lineError.message };

  return { error: null };
}

export async function clearDemoDataForGym(
  supabase: SupabaseClient,
  gymId: string,
): Promise<{ error: string | null }> {
  const tag = `%${DEMO_TAG}%`;

  // Collect demo member / staff / sale ids for FK-safe deletes
  const [
    { data: demoMembers },
    { data: demoStaff },
    { data: demoSales },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("id")
      .eq("gym_id", gymId)
      .ilike("notes", tag),
    supabase
      .from("staff")
      .select("id")
      .eq("gym_id", gymId)
      .ilike("notes", tag),
    supabase
      .from("inventory_sales")
      .select("id")
      .eq("gym_id", gymId)
      .ilike("notes", tag),
  ]);
  const memberIds = (demoMembers ?? []).map((m) => m.id);
  const staffIds = (demoStaff ?? []).map((s) => s.id);
  const saleIds = (demoSales ?? []).map((s) => s.id);

  // Wave 1: independent child-table deletes (FK-safe in parallel)
  const wave1: Array<PromiseLike<{ error: { message: string } | null }>> = [
    supabase
      .from("attendance")
      .delete()
      .eq("gym_id", gymId)
      .ilike("notes", tag),
    supabase
      .from("expenses")
      .delete()
      .eq("gym_id", gymId)
      .ilike("notes", tag),
  ];
  if (saleIds.length) {
    wave1.push(
      supabase.from("inventory_sale_items").delete().in("sale_id", saleIds),
    );
  }
  if (memberIds.length) {
    wave1.push(
      supabase
        .from("reminders")
        .delete()
        .eq("gym_id", gymId)
        .in("member_id", memberIds),
      supabase
        .from("payments")
        .delete()
        .eq("gym_id", gymId)
        .in("member_id", memberIds),
      supabase
        .from("fee_dues")
        .delete()
        .eq("gym_id", gymId)
        .in("member_id", memberIds),
    );
  }

  const wave1Results = await Promise.all(wave1);
  for (const r of wave1Results) {
    if (r.error) return { error: r.error.message };
  }

  // Wave 2: sales (after sale items)
  if (saleIds.length) {
    const { error: salesErr } = await supabase
      .from("inventory_sales")
      .delete()
      .eq("gym_id", gymId)
      .in("id", saleIds);
    if (salesErr) return { error: salesErr.message };
  }

  // Wave 3: members + inventory (after children / sales)
  const wave3: Array<PromiseLike<{ error: { message: string } | null }>> = [
    supabase
      .from("inventory_items")
      .delete()
      .eq("gym_id", gymId)
      .ilike("description", tag),
  ];
  if (memberIds.length) {
    wave3.push(
      supabase
        .from("members")
        .delete()
        .eq("gym_id", gymId)
        .in("id", memberIds),
    );
  }
  const wave3Results = await Promise.all(wave3);
  for (const r of wave3Results) {
    if (r.error) return { error: r.error.message };
  }

  // Wave 4: staff + packages (after expenses / members)
  const wave4: Array<PromiseLike<{ error: { message: string } | null }>> = [
    supabase
      .from("packages")
      .delete()
      .eq("gym_id", gymId)
      .ilike("description", tag),
  ];
  if (staffIds.length) {
    wave4.push(
      supabase
        .from("staff")
        .delete()
        .eq("gym_id", gymId)
        .in("id", staffIds),
    );
  }
  const wave4Results = await Promise.all(wave4);
  for (const r of wave4Results) {
    if (r.error) return { error: r.error.message };
  }

  return { error: null };
}
