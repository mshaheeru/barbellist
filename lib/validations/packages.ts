import { z } from "zod";
import { fitnessGoalSchema } from "@/lib/validations/members";

export const PACKAGE_COLOR_PRESETS = [
  "#1B5E3C",
  "#C9861B",
  "#2563EB",
  "#7C3AED",
  "#0D9488",
  "#1F1F1F",
] as const;

export const packageColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color");

export const packageFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional().nullable(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    duration_days: z.coerce
      .number()
      .int("Duration must be a whole number")
      .positive("Duration is required"),
    features: z
      .array(z.string().min(1, "Feature cannot be empty"))
      .default([]),
    bmi_min: z.coerce.number().positive().optional().nullable(),
    bmi_max: z.coerce.number().positive().optional().nullable(),
    recommended_goals: z.array(fitnessGoalSchema).default([]),
    color: packageColorSchema.default("#1B5E3C"),
    is_active: z.boolean().default(true),
    sort_order: z.coerce.number().int().min(0).default(0),
  })
  .superRefine((data, ctx) => {
    if (
      data.bmi_min != null &&
      data.bmi_max != null &&
      data.bmi_max < data.bmi_min
    ) {
      ctx.addIssue({
        code: "custom",
        message: "BMI max must be greater than or equal to BMI min",
        path: ["bmi_max"],
      });
    }
  });

export type PackageFormInput = z.infer<typeof packageFormSchema>;

export const reorderPackagesSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

export type ReorderPackagesInput = z.infer<typeof reorderPackagesSchema>;
