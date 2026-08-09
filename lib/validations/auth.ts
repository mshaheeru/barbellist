import { z } from "zod";

export const signUpSchema = z.object({
  gymName: z
    .string()
    .trim()
    .min(2, "Gym name must be at least 2 characters"),
  ownerName: z
    .string()
    .trim()
    .min(2, "Your name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number"),
  city: z
    .string()
    .trim()
    .min(2, "City is required"),
  country: z
    .string()
    .trim()
    .min(2, "Country is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Map raw auth/API errors to clearer copy for signup. */
export function friendlySignUpError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("user already exists") ||
    lower.includes("duplicate") ||
    lower.includes("unique constraint")
  ) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (lower.includes("password") && lower.includes("least")) {
    return "Password must be at least 8 characters.";
  }
  if (lower.includes("password")) {
    return message;
  }
  if (lower.includes("invalid email") || lower.includes("email")) {
    return message;
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait a moment and try again.";
  }
  return message || "Registration failed. Please try again.";
}
