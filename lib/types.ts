/** TypeScript types matching the Barbellist database schema. */

export type StaffRole =
  | "owner"
  | "manager"
  | "cashier"
  | "trainer"
  | "cleaner"
  | "other";

export type StaffStatus = "active" | "inactive" | "terminated";

export type SubscriptionPlan = "early_bird" | "standard" | "pro";

export type SubscriptionStatus = "active" | "trial" | "suspended" | "cancelled";

export type Gender = "male" | "female" | "other";

export type MemberStatus = "active" | "frozen" | "expired" | "cancelled";

export type PaymentType =
  | "membership"
  | "personal_training"
  | "product"
  | "other";

export type PaymentMethod =
  | "cash"
  | "easypaisa"
  | "jazzcash"
  | "bank_transfer"
  | "card"
  | "other";

export type SalePaymentMethod = PaymentMethod | "member_tab";

export type FeeDueStatus =
  | "pending"
  | "partial"
  | "paid"
  | "overdue"
  | "waived";

export type PersonType = "member" | "staff";

export type CheckInMethod = "qr" | "fingerprint" | "manual";

export type ExpenseCategory =
  | "salary"
  | "utilities"
  | "maintenance"
  | "cleaning"
  | "repairs"
  | "equipment"
  | "rent"
  | "miscellaneous";

export type ExpenseStatus = "paid" | "pending" | "cancelled";

export type InventoryCategory =
  | "supplements"
  | "drinks"
  | "snacks"
  | "accessories"
  | "apparel"
  | "other";

export type ReminderChannel = "whatsapp" | "sms";

export type ReminderStatus =
  | "queued"
  | "sent"
  | "delivered"
  | "failed"
  | "read";

export type LeadSource =
  | "walk_in"
  | "referral"
  | "social_media"
  | "website"
  | "phone"
  | "other";

export type LeadStage =
  | "new"
  | "contacted"
  | "trial"
  | "negotiating"
  | "converted"
  | "lost";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrganizationMember = {
  id: string;
  organization_id: string;
  auth_user_id: string;
  role: "owner";
  created_at: string;
};

/** A gym row is a branch under an organization. */
export type Gym = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  logo_url: string | null;
  timezone: string;
  currency: string;
  currency_symbol: string;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

/** Lightweight branch row for pickers / switchers. */
export type BranchSummary = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  address: string | null;
};

export type Staff = {
  id: string;
  gym_id: string;
  auth_user_id: string | null;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  role: StaffRole;
  monthly_salary: number;
  commission_rate: number;
  joining_date: string;
  status: StaffStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Package = {
  id: string;
  gym_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_days: number;
  features: unknown;
  bmi_min: number | null;
  bmi_max: number | null;
  recommended_goals: string[] | null;
  color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Member = {
  id: string;
  gym_id: string;
  member_code: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  photo_url: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  bmi: number | null;
  fitness_goals: string[] | null;
  package_id: string | null;
  membership_start: string | null;
  membership_end: string | null;
  status: MemberStatus;
  freeze_start: string | null;
  freeze_end: string | null;
  freeze_reason: string | null;
  card_qr_token: string | null;
  card_issued_at: string | null;
  card_printed: boolean;
  referred_by: string | null;
  notes: string | null;
  joined_at: string;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  gym_id: string;
  member_id: string;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod | null;
  is_partial: boolean;
  covers_from: string | null;
  covers_to: string | null;
  notes: string | null;
  receipt_sent: boolean;
  receipt_generated: boolean;
  recorded_by: string | null;
  paid_at: string;
  created_at: string;
};

export type FeeDue = {
  id: string;
  gym_id: string;
  member_id: string;
  amount_due: number;
  amount_paid: number;
  due_date: string;
  status: FeeDueStatus;
  generated_for_month: string | null;
  last_reminder_sent_at: string | null;
  reminder_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Attendance = {
  id: string;
  gym_id: string;
  member_id: string | null;
  staff_id: string | null;
  person_type: PersonType;
  check_in_method: CheckInMethod;
  check_in_at: string;
  check_out_at: string | null;
  fee_status_at_checkin: string | null;
  notes: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  gym_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  payment_method: PaymentMethod | null;
  staff_id: string | null;
  salary_month: string | null;
  is_salary_full_month: boolean;
  receipt_url: string | null;
  recorded_by: string | null;
  expense_date: string;
  status: ExpenseStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryItem = {
  id: string;
  gym_id: string;
  name: string;
  category: InventoryCategory;
  description: string | null;
  photo_url: string | null;
  sku: string | null;
  unit_cost: number;
  selling_price: number;
  stock_qty: number;
  low_stock_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type InventorySale = {
  id: string;
  gym_id: string;
  member_id: string | null;
  is_walkin: boolean;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: SalePaymentMethod | null;
  recorded_by: string | null;
  sold_at: string;
  notes: string | null;
  created_at: string;
};

export type InventorySaleItem = {
  id: string;
  sale_id: string;
  item_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
};

export type Reminder = {
  id: string;
  gym_id: string;
  member_id: string;
  fee_due_id: string | null;
  channel: ReminderChannel;
  template: string | null;
  message_body: string | null;
  status: ReminderStatus;
  sent_at: string;
  external_id: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  gym_id: string;
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  source: LeadSource;
  stage: LeadStage;
  interested_package_id: string | null;
  follow_up_date: string | null;
  converted_member_id: string | null;
  assigned_to: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  gym_id: string;
  actor_staff_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type UserMetadata = {
  gym_id: string;
  role: StaffRole;
};

export type FeeDisplayKind = "frozen" | "overdue" | "due_soon" | "paid";

export type FeeDisplayStatus = {
  kind: FeeDisplayKind;
  label: string;
  days: number | null;
};

export type MemberListItem = Member & {
  package_name: string | null;
  fee_status: FeeDisplayStatus;
  last_check_in: string | null;
};

export type PaymentWithStaff = Payment & {
  recorded_by_name: string | null;
};

export type MemberProfile = Member & {
  package: Pick<Package, "name" | "price" | "duration_days" | "color"> | null;
  fee_status: FeeDisplayStatus;
  outstanding_dues: FeeDue[];
  recent_payments: PaymentWithStaff[];
  attendance_30d: Attendance[];
  attendance_month: Attendance[];
  check_in_streak: number;
  notes_list: import("@/lib/members/notes").MemberNote[];
};

export type MembersListMeta = {
  nextCursor: string | null;
  total: number;
  counts: {
    all: number;
    active: number;
    overdue: number;
    due_soon: number;
    frozen: number;
    new: number;
  };
};

export type MembersListResult = {
  data: MemberListItem[];
  meta: MembersListMeta;
};

export type StaffListItem = Omit<Staff, "monthly_salary"> & {
  /** Null when caller cannot view salary */
  monthly_salary: number | null;
  attendance_days: number;
  working_days: number;
  last_check_in: string | null;
};

export type SalaryExpenseRow = Expense & {
  recorded_by_name: string | null;
};

export type StaffProfile = Omit<Staff, "monthly_salary" | "commission_rate"> & {
  /** Null when caller cannot view salary */
  monthly_salary: number | null;
  commission_rate: number | null;
  attendance_30d: Attendance[];
  attendance_month: Attendance[];
  check_in_streak: number;
  last_check_in: string | null;
  salary_history: SalaryExpenseRow[];
  last_paid_at: string | null;
  last_paid_method: string | null;
  next_due_at: string | null;
  notes_list: import("@/lib/members/notes").MemberNote[];
  working_days: number;
  attendance_days_month: number;
};

export type StaffListCounts = {
  all: number;
  trainer: number;
  cashier: number;
  cleaner: number;
  manager: number;
  owner: number;
};

export type StaffListMeta = {
  total: number;
  counts: StaffListCounts;
  clockedInToday: number;
  monthlyPayroll: number | null;
};

export type StaffListResult = {
  data: StaffListItem[];
  meta: StaffListMeta;
};

export type FeeOverviewRow = {
  id: string;
  member_id: string;
  member_name: string;
  member_code: string;
  photo_url: string | null;
  package_name: string | null;
  amount_due: number;
  amount_paid: number;
  balance: number;
  due_date: string;
  status: FeeDueStatus;
  days_overdue: number | null;
};

export type FeesOverviewSummary = {
  collectedThisMonth: number;
  outstanding: number;
  dueThisWeek: number;
  overdueMemberCount: number;
};

export type FeesOverviewResult = {
  summary: FeesOverviewSummary;
  data: FeeOverviewRow[];
  meta: {
    total: number;
    nextCursor: string | null;
  };
};

export type ExpenseListRow = Expense & {
  recorded_by_name: string | null;
  staff_name: string | null;
};

export type ExpensesSummary = {
  thisMonthTotal: number;
  lastMonthTotal: number;
  trendPercent: number | null;
  salariesPaid: number;
  salariesPaidCount: number;
  staffTotal: number;
  pendingTotal: number;
  pendingCount: number;
  entryCount: number;
  monthLabel: string;
};

export type ExpensesListResult = {
  summary: ExpensesSummary;
  data: ExpenseListRow[];
  staffOptions: { id: string; name: string; photo_url: string | null; role: string; monthly_salary: number | null }[];
  meta: { total: number };
};

export type InventoryListRow = InventoryItem & {
  margin_percent: number | null;
  stock_status: "in_stock" | "low" | "out";
};

export type InventorySummary = {
  itemsInStock: number;
  stockValueAtCost: number;
  lowStockCount: number;
  outOfStockCount: number;
  salesThisMonth: number;
  salesLastMonth: number;
  salesTrendPercent: number | null;
  monthLabel: string;
};

export type InventoryListResult = {
  summary: InventorySummary;
  data: InventoryListRow[];
  meta: { total: number };
};

export type MemberSalePickerItem = {
  id: string;
  name: string;
  member_code: string;
  photo_url: string | null;
  package_name: string | null;
};

export type MemberPaymentContext = {
  id: string;
  name: string;
  member_code: string;
  photo_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  status: MemberStatus;
  package: Pick<Package, "name" | "price"> | null;
  outstanding_dues: FeeDue[];
  total_balance: number;
  fee_status: FeeDisplayStatus;
};

export type AttendanceDateRange = "today" | "week" | "month";
export type AttendancePersonFilter = "all" | "member" | "staff";
export type FeeSnapshotAtCheckin = "clear" | "overdue" | "due_soon";

export type AttendanceFeedItem = {
  id: string;
  check_in_at: string;
  check_in_method: CheckInMethod;
  person_type: PersonType;
  fee_status_at_checkin: string | null;
  name: string;
  photo_url: string | null;
  member_code: string | null;
  package_name: string | null;
  staff_role: StaffRole | null;
  staff_role_label: string | null;
  subtitle: string;
};

export type LiveGymCounts = {
  membersInGym: number;
  staffInGym: number;
  checkInsToday: number;
  peakHourLabel: string;
};

export type HourlyTrafficBucket = {
  hour: number;
  label: string;
  count: number;
  heightPct: number;
};

export type AttendanceSidebarStats = {
  totalCheckIns: number;
  uniqueMembers: number;
  currentlyInside: number;
  noShowsBooked: number;
  staffClockedIn: number;
  staffTotal: number;
  lateArrivals: number;
  onLeaveToday: number;
  hourlyTraffic: HourlyTrafficBucket[];
};

export type CheckInResult = {
  attendance_id: string;
  member_id: string;
  name: string;
  photo_url: string | null;
  member_code: string;
  package_name: string | null;
  fee_snapshot: FeeSnapshotAtCheckin;
  fee_display: FeeDisplayStatus;
  overdue_amount: number;
  overdue_days: number | null;
  month_check_ins: number;
  streak: number;
  already_checked_in: boolean;
  feed_item: AttendanceFeedItem | null;
};

export type AttendanceFeedPayload = {
  feed: AttendanceFeedItem[];
  liveCounts: LiveGymCounts;
  sidebar: AttendanceSidebarStats;
  timeZone: string;
  dateLabel: string;
};
