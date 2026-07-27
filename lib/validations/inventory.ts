import { z } from "zod";
import { salePaymentMethodSchema as commonSalePaymentMethodSchema } from "@/lib/validations/common";

export const inventoryCategorySchema = z.enum([
  "supplements",
  "drinks",
  "snacks",
  "accessories",
  "apparel",
  "other",
]);

export const stockStatusFilterSchema = z.enum([
  "all",
  "in_stock",
  "low",
  "out",
]);

export const salePaymentMethodSchema = commonSalePaymentMethodSchema;

export const inventoryFilterSchema = z.object({
  search: z.string().optional(),
  category: z.union([inventoryCategorySchema, z.literal("all")]).optional(),
  stock: stockStatusFilterSchema.optional(),
});

export type InventoryFilterInput = z.infer<typeof inventoryFilterSchema>;
export type StockStatusFilter = z.infer<typeof stockStatusFilterSchema>;

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: inventoryCategorySchema.optional().default("other"),
  description: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  unit_cost: z.coerce.number().min(0).optional().default(0),
  selling_price: z.coerce.number().positive("Selling price is required"),
  stock_qty: z.coerce.number().int().min(0, "Stock must be 0 or more"),
  low_stock_threshold: z.coerce.number().int().min(0).optional().default(5),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).optional(),
  category: inventoryCategorySchema.optional(),
  description: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  unit_cost: z.coerce.number().min(0).optional(),
  selling_price: z.coerce.number().positive().optional(),
  stock_qty: z.coerce.number().int().min(0).optional(),
  low_stock_threshold: z.coerce.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

export const saleLineItemSchema = z.object({
  item_id: z.string().uuid(),
  quantity: z.coerce.number().int().positive(),
  unit_price: z.coerce.number().positive(),
});

export const createSaleSchema = z
  .object({
    member_id: z.string().uuid().optional().nullable(),
    is_walkin: z.boolean().optional().default(false),
    items: z.array(saleLineItemSchema).min(1, "Add at least one item"),
    discount: z.coerce.number().min(0).optional().default(0),
    payment_method: salePaymentMethodSchema,
    notes: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.payment_method === "member_tab" && !data.member_id) {
      ctx.addIssue({
        code: "custom",
        message: "Select a member to add to their tab",
        path: ["member_id"],
      });
    }
    if (data.is_walkin && data.member_id) {
      ctx.addIssue({
        code: "custom",
        message: "Walk-in sales cannot have a member",
        path: ["member_id"],
      });
    }
  });

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
