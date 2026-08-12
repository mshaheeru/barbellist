"use client";

import { useState, useTransition } from "react";
import { Modal, NumberInput, Select, TextInput, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { recordSalaryPayment } from "@/app/actions/staff";
import type { StaffProfile } from "@/lib/types";
import { firstOfMonthIso } from "@/lib/staff/format";

type RecordSalaryModalProps = {
  opened: boolean;
  onClose: () => void;
  staff: StaffProfile;
  currencySymbol: string;
};

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "easypaisa", label: "EasyPaisa" },
  { value: "jazzcash", label: "JazzCash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "card", label: "Card" },
  { value: "other", label: "Other" },
];

export function RecordSalaryModal({
  opened,
  onClose,
  staff,
  currencySymbol,
}: RecordSalaryModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [amount, setAmount] = useState<number | string>(
    staff.monthly_salary ?? 0,
  );
  const [method, setMethod] = useState<string | null>("cash");
  const defaultMonth = firstOfMonthIso().slice(0, 7);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const { error } = await recordSalaryPayment({
        staff_id: staff.id,
        amount: Number(amount),
        payment_method: (method as
          | "cash"
          | "easypaisa"
          | "jazzcash"
          | "bank_transfer"
          | "card"
          | "other") || "cash",
        salary_month: String(fd.get("salary_month") || defaultMonth),
        expense_date: String(fd.get("expense_date") || "") || undefined,
        notes: String(fd.get("notes") || "") || null,
        is_salary_full_month: true,
      });

      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }

      notifications.show({ color: "green", message: "Salary payment recorded." });
      onClose();
      router.refresh();
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Record Salary — ${staff.name}`}
      centered
      radius="md"
      size="md"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <NumberInput
          label={`Amount (${currencySymbol})`}
          value={amount}
          onChange={setAmount}
          min={1}
          required
          thousandSeparator=","
        />
        <Select
          label="Payment Method"
          data={METHODS}
          value={method}
          onChange={setMethod}
          required
        />
        <TextInput
          label="Salary Month"
          name="salary_month"
          type="month"
          defaultValue={defaultMonth}
          required
        />
        <TextInput
          label="Paid On"
          name="expense_date"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
        <Textarea label="Notes" name="notes" minRows={2} />
        <button
          type="submit"
          disabled={pending}
          style={{
            background: "var(--color-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 11,
            padding: "12px 18px",
            fontWeight: 600,
            fontSize: 14,
            cursor: pending ? "wait" : "pointer",
          }}
        >
          {pending ? "Saving…" : "Record Payment"}
        </button>
      </form>
    </Modal>
  );
}
