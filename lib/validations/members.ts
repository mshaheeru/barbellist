import { z } from "zod";

export const memberFilterSchema = z.enum([
  "all",
  "active",
  "overdue",
  "due_soon",
  "frozen",
  "new",
]);

export const memberSortSchema = z.enum([
  "name_asc",
  "name_desc",
  "joined_desc",
  "joined_asc",
]);

export type MemberFilter = z.infer<typeof memberFilterSchema>;
export type MemberSort = z.infer<typeof memberSortSchema>;

export const updateMemberSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  height_cm: z.coerce.number().positive().optional().nullable(),
  weight_kg: z.coerce.number().positive().optional().nullable(),
  fitness_goals: z.array(z.string()).optional().nullable(),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

export const freezeMemberSchema = z.object({
  freeze_start: z.string().min(1),
  freeze_end: z.string().min(1),
  reason: z.string().min(1),
});

export type FreezeMemberInput = z.infer<typeof freezeMemberSchema>;

export const memberNoteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty"),
});

export const fitnessGoalSchema = z.enum([
  "weight_loss",
  "muscle_gain",
  "general_fitness",
  "endurance",
  "flexibility",
  "rehabilitation",
]);

export type FitnessGoal = z.infer<typeof fitnessGoalSchema>;

export const onboardingStep1Schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  whatsapp: z.string().optional().nullable(),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  address: z.string().optional().nullable(),
  emergency_contact_name: z.string().optional().nullable(),
  emergency_contact_phone: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
});

export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;

export const onboardingStep2Schema = z.object({
  height_cm: z.coerce
    .number({ error: "Height is required" })
    .positive("Height must be positive"),
  weight_kg: z.coerce
    .number({ error: "Weight is required" })
    .positive("Weight must be positive"),
  fitness_goals: z.array(fitnessGoalSchema).default([]),
});

export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;

export const onboardingPaymentSchema = z.object({
  package_id: z.string().uuid("Please select a package"),
  payment_method: z.enum([
    "cash",
    "easypaisa",
    "jazzcash",
    "bank_transfer",
  ]),
  amount: z.coerce.number().positive("Amount must be positive"),
  is_partial: z.boolean().default(false),
  notes: z.string().optional().nullable(),
  send_whatsapp_receipt: z.boolean().default(false),
});

export type OnboardingPaymentInput = z.infer<typeof onboardingPaymentSchema>;

export const createMemberWithPaymentSchema = onboardingStep1Schema
  .merge(onboardingStep2Schema)
  .merge(onboardingPaymentSchema);

export type CreateMemberWithPaymentInput = z.infer<
  typeof createMemberWithPaymentSchema
>;
