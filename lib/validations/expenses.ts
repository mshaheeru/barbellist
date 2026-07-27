import { z } from "zod";
import { paymentMethodSchema } from "@/lib/validations/common";

export const expenseCategorySchema = z.enum([
  "salary",
  "utilities",
  "maintenance",
  "cleaning",
  "repairs",
  "equipment",
  "rent",
  "miscellaneous",
]);

export const expensePaymentMethodSchema = paymentMethodSchema;

export const expenseStatusSchema = z.enum(["paid", "pending", "cancelled"]);

export const salaryModeSchema = z.enum(["full", "partial", "advance"]);

export const expensesFilterSchema = z.object({
  category: z.union([expenseCategorySchema, z.literal("all")]).optional(),
  payment_method: z
    .union([expensePaymentMethodSchema, z.literal("all")])
    .optional(),
  recorded_by: z.string().uuid().optional().or(z.literal("all")),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: expenseStatusSchema.optional(),
});

export type ExpensesFilterInput = z.infer<typeof expensesFilterSchema>;

export const createExpenseSchema = z
  .object({
    category: expenseCategorySchema,
    description: z.string().min(1, "Description is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    payment_method: expensePaymentMethodSchema,
    staff_id: z.string().uuid().optional().nullable(),
    salary_month: z.string().optional().nullable(),
    salary_mode: salaryModeSchema.optional().nullable(),
    is_salary_full_month: z.boolean().optional().default(true),
    recorded_by: z.string().uuid().optional().nullable(),
    expense_date: z.string().optional(),
    status: expenseStatusSchema.optional().default("paid"),
    receipt_url: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.category === "salary") {
      if (!data.staff_id) {
        ctx.addIssue({
          code: "custom",
          message: "Staff member is required for salary expenses",
          path: ["staff_id"],
        });
      }
      if (!data.salary_month) {
        ctx.addIssue({
          code: "custom",
          message: "Salary month is required",
          path: ["salary_month"],
        });
      }
    }
  });

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = z.object({
  id: z.string().uuid(),
  category: expenseCategorySchema.optional(),
  description: z.string().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  payment_method: expensePaymentMethodSchema.optional(),
  staff_id: z.string().uuid().optional().nullable(),
  salary_month: z.string().optional().nullable(),
  is_salary_full_month: z.boolean().optional(),
  expense_date: z.string().optional(),
  status: expenseStatusSchema.optional(),
  receipt_url: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
