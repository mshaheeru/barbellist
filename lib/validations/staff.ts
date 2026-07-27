import { z } from "zod";
import {
  noteTextSchema,
  paymentMethodSchema,
} from "@/lib/validations/common";

export const staffRoleSchema = z.enum([
  "owner",
  "manager",
  "cashier",
  "trainer",
  "cleaner",
  "other",
]);

export const staffFilterSchema = z.enum([
  "all",
  "trainer",
  "cashier",
  "cleaner",
  "manager",
  "owner",
]);

export const staffSortSchema = z.enum([
  "name_asc",
  "name_desc",
  "joined_desc",
  "joined_asc",
  "salary_desc",
  "salary_asc",
]);

export type StaffFilter = z.infer<typeof staffFilterSchema>;
export type StaffSort = z.infer<typeof staffSortSchema>;

export const createStaffSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    role: staffRoleSchema,
    phone: z.string().optional().nullable(),
    whatsapp: z.string().optional().nullable(),
    email: z
      .string()
      .email("Invalid email")
      .optional()
      .nullable()
      .or(z.literal("")),
    monthly_salary: z.coerce.number().min(0).optional().default(0),
    commission_rate: z.coerce.number().min(0).max(100).optional().default(0),
    joining_date: z.string().optional().nullable(),
    photo_url: z.string().optional().nullable(),
    give_app_access: z.boolean().optional().default(false),
    password: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.give_app_access) {
      if (!data.email?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Email is required for app access",
          path: ["email"],
        });
      }
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: "custom",
          message: "Password must be at least 6 characters",
          path: ["password"],
        });
      }
    }
  });

export type CreateStaffInput = z.infer<typeof createStaffSchema>;

export const updateStaffSchema = z.object({
  name: z.string().min(1).optional(),
  role: staffRoleSchema.optional(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  monthly_salary: z.coerce.number().min(0).optional(),
  commission_rate: z.coerce.number().min(0).max(100).optional(),
  joining_date: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  status: z.enum(["active", "inactive", "terminated"]).optional(),
});

export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

export const recordSalarySchema = z.object({
  staff_id: z.string().uuid(),
  amount: z.coerce.number().positive("Amount must be positive"),
  payment_method: paymentMethodSchema,
  salary_month: z.string().min(1, "Salary month is required"),
  expense_date: z.string().optional(),
  notes: z.string().optional().nullable(),
  is_salary_full_month: z.boolean().optional().default(true),
});

export type RecordSalaryInput = z.infer<typeof recordSalarySchema>;

export const staffNoteSchema = noteTextSchema;