import { z } from "zod";

/** Fee / membership payment methods (narrow set). */
export const feePaymentMethodSchema = z.enum([
  "cash",
  "easypaisa",
  "jazzcash",
  "bank_transfer",
]);

/** Full payment methods used by expenses / salary. */
export const paymentMethodSchema = z.enum([
  "cash",
  "easypaisa",
  "jazzcash",
  "bank_transfer",
  "card",
  "other",
]);

/** Sale payment methods (+ member tab). */
export const salePaymentMethodSchema = z.enum([
  "cash",
  "easypaisa",
  "jazzcash",
  "bank_transfer",
  "card",
  "member_tab",
  "other",
]);

export const noteTextSchema = z.object({
  text: z.string().min(1, "Note cannot be empty"),
});

export type FeePaymentMethod = z.infer<typeof feePaymentMethodSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type SalePaymentMethodInput = z.infer<typeof salePaymentMethodSchema>;
