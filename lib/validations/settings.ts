import { z } from "zod";
import { staffRoleSchema } from "@/lib/validations/staff";

export const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  PKR: "Rs.",
  USD: "$",
  SAR: "SAR",
  AED: "AED",
  GBP: "£",
};

export const gymProfileSchema = z.object({
  name: z.string().min(1, "Gym name is required"),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  country: z.string().min(1).default("PK"),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  timezone: z.string().min(1).default("Asia/Karachi"),
  currency: z.enum(["PKR", "USD", "SAR", "AED", "GBP"]),
  currency_symbol: z.string().min(1),
});

export type GymProfileInput = z.infer<typeof gymProfileSchema>;

export const cardTemplateSchema = z.object({
  background_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  show_gym_logo: z.boolean(),
  show_member_photo: z.boolean(),
  show_qr: z.boolean(),
  show_expiry: z.boolean(),
  show_package_badge: z.boolean(),
});

export type CardTemplateInput = z.infer<typeof cardTemplateSchema>;

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color");

export const gymThemeSchema = z.object({
  primary: hexColorSchema,
  accent: hexColorSchema.optional(),
});

export type GymThemeInput = z.infer<typeof gymThemeSchema>;

export const whatsappCredentialsSchema = z.object({
  api_token: z.string().optional().nullable(),
  phone_number_id: z.string().optional().nullable(),
});

export type WhatsAppCredentialsInput = z.infer<
  typeof whatsappCredentialsSchema
>;

export const inviteStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["manager", "cashier", "trainer", "cleaner", "other"]),
});

export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;

export const updateStaffRoleSchema = z.object({
  staffId: z.string().uuid(),
  role: staffRoleSchema,
});

export const deleteGymSchema = z.object({
  confirmationName: z.string().min(1),
});

export const createBranchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

export type CreateBranchInput = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = z.object({
  gymId: z.string().uuid(),
  name: z.string().min(1, "Branch name is required"),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type UpdateBranchInput = z.infer<typeof updateBranchSchema>;
