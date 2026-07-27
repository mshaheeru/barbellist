import { z } from "zod";
import { feePaymentMethodSchema } from "@/lib/validations/common";

export const feeStatusFilterSchema = z.enum([
  "all",
  "paid",
  "pending",
  "overdue",
  "partial",
  "waived",
]);

export const feeSortSchema = z.enum([
  "due_date_asc",
  "due_date_desc",
  "amount_desc",
  "amount_asc",
  "overdue_desc",
  "overdue_asc",
]);

export type FeeStatusFilter = z.infer<typeof feeStatusFilterSchema>;
export type FeeSort = z.infer<typeof feeSortSchema>;

export const feesFilterSchema = z.object({
  status: feeStatusFilterSchema.optional(),
  sort: feeSortSchema.optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  cursor: z.string().optional(),
});

export type FeesFilterInput = z.infer<typeof feesFilterSchema>;

export const recordPaymentSchema = z.object({
  member_id: z.string().uuid(),
  payment_method: feePaymentMethodSchema,
  amount: z.coerce.number().positive("Amount must be positive"),
  is_partial: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  send_whatsapp_receipt: z.boolean().default(false),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const waiveFeeDueSchema = z.object({
  fee_due_id: z.string().uuid(),
});

export type WaiveFeeDueInput = z.infer<typeof waiveFeeDueSchema>;
