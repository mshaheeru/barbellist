"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NumberInput, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  Banknote,
  Camera,
  Check,
  ChevronDown,
  Landmark,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import { createExpense } from "@/app/actions/expenses";
import { useGym } from "@/components/gym-provider";
import { getUserGymId } from "@/lib/auth/claims";
import { createClient } from "@/lib/supabase/client";
import {
  EXPENSE_CATEGORY_LABELS,
  firstOfMonth,
} from "@/lib/expenses/format";
import { formatCurrency, getInitials } from "@/lib/members/format";
import type { ExpenseCategory, PaymentMethod } from "@/lib/types";
import styles from "./record-expense-modal.module.css";

type StaffOption = {
  id: string;
  name: string;
  photo_url: string | null;
  role: string;
  monthly_salary: number | null;
};

type SalaryMode = "full" | "partial" | "advance";

type OnboardingPaymentMethod = Extract<
  PaymentMethod,
  "cash" | "easypaisa" | "jazzcash" | "bank_transfer"
>;

const CATEGORIES: ExpenseCategory[] = [
  "salary",
  "utilities",
  "maintenance",
  "cleaning",
  "repairs",
  "equipment",
  "rent",
  "miscellaneous",
];

const METHODS: {
  value: OnboardingPaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "cash",
    label: "Cash",
    icon: <Banknote size={17} strokeWidth={2} />,
  },
  {
    value: "easypaisa",
    label: "EasyPaisa",
    icon: (
      <span className={styles.methodIcon} style={{ background: "#2E9E4B" }}>
        <Smartphone size={12} color="#fff" strokeWidth={2.4} />
      </span>
    ),
  },
  {
    value: "jazzcash",
    label: "JazzCash",
    icon: (
      <span className={styles.methodIcon} style={{ background: "#C0392B" }}>
        <Smartphone size={12} color="#fff" strokeWidth={2.4} />
      </span>
    ),
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    icon: <Landmark size={17} strokeWidth={2} />,
  },
];

type RecordExpenseModalProps = {
  opened: boolean;
  onClose: () => void;
  staffOptions: StaffOption[];
  currentStaffId: string | null;
  canRecordSalary: boolean;
  initialCategory?: ExpenseCategory;
  initialStaffId?: string;
};

export function RecordExpenseModal({
  opened,
  onClose,
  staffOptions,
  currentStaffId,
  canRecordSalary,
  initialCategory = "utilities",
  initialStaffId,
}: RecordExpenseModalProps) {
  const router = useRouter();
  const { currencySymbol } = useGym();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const visibleCategories = canRecordSalary
    ? CATEGORIES
    : CATEGORIES.filter((c) => c !== "salary");

  const [category, setCategory] = useState<ExpenseCategory>(
    initialCategory === "salary" && !canRecordSalary
      ? "utilities"
      : initialCategory,
  );
  const [staffId, setStaffId] = useState<string | null>(
    initialStaffId ?? null,
  );
  const [staffOpen, setStaffOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [salaryMode, setSalaryMode] = useState<SalaryMode>("full");
  const [salaryMonth, setSalaryMonth] = useState(
    firstOfMonth().slice(0, 7),
  );
  const [amount, setAmount] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [method, setMethod] =
    useState<OnboardingPaymentMethod>("cash");
  const [recordedBy, setRecordedBy] = useState<string | null>(
    currentStaffId,
  );
  const [notes, setNotes] = useState("");
  const [receiptPath, setReceiptPath] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const selectedStaff = staffOptions.find((s) => s.id === staffId) ?? null;
  const recorder =
    staffOptions.find((s) => s.id === recordedBy) ??
    staffOptions.find((s) => s.id === currentStaffId) ??
    null;

  useEffect(() => {
    if (!opened) return;
    setCategory(
      initialCategory === "salary" && !canRecordSalary
        ? "utilities"
        : initialCategory,
    );
    setStaffId(initialStaffId ?? null);
    setRecordedBy(currentStaffId);
    setSalaryMode("full");
    setSalaryMonth(firstOfMonth().slice(0, 7));
    setAmount("");
    setDescription("");
    setMethod("cash");
    setNotes("");
    setReceiptPath(null);
    setReceiptName(null);
    setStaffOpen(false);
  }, [
    opened,
    initialCategory,
    initialStaffId,
    currentStaffId,
    canRecordSalary,
  ]);

  useEffect(() => {
    if (category !== "salary" || !selectedStaff) return;
    if (salaryMode === "full" && selectedStaff.monthly_salary != null) {
      setAmount(selectedStaff.monthly_salary);
    }
    const monthName = new Date(`${salaryMonth}-01T12:00:00`).toLocaleDateString(
      "en-GB",
      { month: "long" },
    );
    setDescription(`${selectedStaff.name} — ${monthName} salary`);
  }, [category, selectedStaff, salaryMode, salaryMonth]);

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase();
    if (!q) return staffOptions;
    return staffOptions.filter((s) => s.name.toLowerCase().includes(q));
  }, [staffOptions, staffSearch]);

  if (!opened) return null;

  const amountNum = Number(amount) || 0;

  const uploadReceipt = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const gymId = getUserGymId(user);
      if (!gymId) throw new Error("Missing gym");

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${gymId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("receipts")
        .upload(path, file, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
      if (error) throw error;
      setReceiptPath(path);
      setReceiptName(file.name);
      notifications.show({ color: "green", message: "Receipt uploaded." });
    } catch (e) {
      notifications.show({
        color: "red",
        message: e instanceof Error ? e.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      notifications.show({ color: "red", message: "Description is required" });
      return;
    }
    if (amountNum <= 0) {
      notifications.show({ color: "red", message: "Enter a valid amount" });
      return;
    }
    if (category === "salary" && !staffId) {
      notifications.show({ color: "red", message: "Select a staff member" });
      return;
    }

    startTransition(async () => {
      const { error } = await createExpense({
        category,
        description: description.trim(),
        amount: amountNum,
        payment_method: method,
        staff_id: category === "salary" ? staffId : null,
        salary_month: category === "salary" ? salaryMonth : null,
        salary_mode: category === "salary" ? salaryMode : null,
        is_salary_full_month: salaryMode === "full",
        recorded_by: recordedBy,
        receipt_url: receiptPath,
        notes: notes.trim() || null,
        status: "paid",
      });

      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }

      notifications.show({ color: "green", message: "Expense recorded." });
      onClose();
      router.refresh();
    });
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Record Expense</h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.sectionLabel}>Category</div>
          <div className={styles.categoryPills}>
            {visibleCategories.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.categoryPill} ${
                  category === c ? styles.categoryPillActive : ""
                }`}
                onClick={() => setCategory(c)}
              >
                {EXPENSE_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          {category === "salary" ? (
            <div className={styles.salaryBox}>
              <div className={styles.salaryLabel}>Pay salary to</div>
              <div className={styles.staffPicker}>
                <button
                  type="button"
                  className={styles.staffTrigger}
                  onClick={() => setStaffOpen((o) => !o)}
                >
                  <div className={styles.staffAvatar}>
                    {selectedStaff?.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedStaff.photo_url} alt="" />
                    ) : (
                      getInitials(selectedStaff?.name)
                    )}
                  </div>
                  <div className={styles.staffInfo}>
                    <div className={styles.staffName}>
                      {selectedStaff?.name ?? "Select staff member"}
                    </div>
                    <div className={styles.staffSub}>
                      {selectedStaff
                        ? `${selectedStaff.role} · ${formatCurrency(
                            selectedStaff.monthly_salary ?? 0,
                            currencySymbol,
                          )}/mo`
                        : "Search by name"}
                    </div>
                  </div>
                  <ChevronDown size={16} color="#8A8A80" />
                </button>
                {staffOpen ? (
                  <div className={styles.staffDropdown}>
                    <input
                      className={styles.staffSearch}
                      placeholder="Search staff…"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      autoFocus
                    />
                    {filteredStaff.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={styles.staffOption}
                        onClick={() => {
                          setStaffId(s.id);
                          setStaffOpen(false);
                          setStaffSearch("");
                        }}
                      >
                        <div className={styles.staffAvatar}>
                          {s.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.photo_url} alt="" />
                          ) : (
                            getInitials(s.name)
                          )}
                        </div>
                        <div>
                          <div className={styles.staffName}>{s.name}</div>
                          <div className={styles.staffSub}>
                            {s.role} ·{" "}
                            {formatCurrency(
                              s.monthly_salary ?? 0,
                              currencySymbol,
                            )}
                            /mo
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className={styles.monthField}>
                <TextInput
                  type="month"
                  label="Salary month"
                  value={salaryMonth}
                  onChange={(e) => setSalaryMonth(e.currentTarget.value)}
                  size="sm"
                  radius="md"
                />
              </div>

              <div className={styles.modeToggle}>
                {(
                  [
                    ["full", "Full month"],
                    ["partial", "Partial"],
                    ["advance", "Advance"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.modeBtn} ${
                      salaryMode === value ? styles.modeBtnActive : ""
                    }`}
                    onClick={() => setSalaryMode(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <div className={styles.sectionLabel}>Amount</div>
              <NumberInput
                value={amount}
                onChange={setAmount}
                min={0}
                thousandSeparator=","
                prefix={`${currencySymbol} `}
                hideControls
                classNames={{ input: styles.amountInput }}
                radius="md"
              />
            </div>
            <div className={styles.fieldWide}>
              <div className={styles.sectionLabel}>Description</div>
              <input
                className={styles.fieldInput}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this for?"
              />
            </div>
          </div>

          <div className={styles.sectionLabel}>Payment Method</div>
          <div className={styles.paymentGrid}>
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                className={`${styles.paymentPill} ${
                  method === m.value ? styles.paymentPillSelected : ""
                }`}
                onClick={() => setMethod(m.value)}
              >
                {m.icon}
                {m.label}
                {method === m.value ? (
                  <Check
                    size={14}
                    strokeWidth={3}
                    color="var(--color-primary)"
                    style={{ marginLeft: "auto" }}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <div className={styles.sectionLabel}>Added by</div>
              <select
                className={styles.fieldInput}
                value={recordedBy ?? ""}
                onChange={(e) => setRecordedBy(e.target.value || null)}
              >
                {staffOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {recorder ? (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#8a8a80",
                  }}
                >
                  Recording as {recorder.name}
                </div>
              ) : null}
            </div>
            <div className={styles.field}>
              <div className={styles.sectionLabel}>Receipt</div>
              <button
                type="button"
                className={`${styles.receiptZone} ${
                  receiptName ? styles.receiptZoneHasFile : ""
                }`}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <Camera size={17} strokeWidth={2} />
                {receiptName ?? "Take photo"}
                <span style={{ color: "#CFCCC2" }}>·</span>
                <Upload size={16} strokeWidth={2} />
                Upload
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className={styles.hiddenFile}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadReceipt(file);
                }}
              />
            </div>
          </div>

          <textarea
            className={styles.notesInput}
            placeholder="Add a note (optional)…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={pending || uploading}
          >
            <Check size={18} strokeWidth={2.2} />
            Record Expense · {formatCurrency(amountNum, currencySymbol)}
          </button>
        </div>
      </div>
    </div>
  );
}
