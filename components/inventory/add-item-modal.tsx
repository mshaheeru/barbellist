"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Modal,
  NumberInput,
  Select,
  TextInput,
  Textarea,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createItem } from "@/app/actions/inventory";
import { createClient } from "@/lib/supabase/client";
import { INVENTORY_CATEGORY_LABELS } from "@/lib/inventory/format";
import type { InventoryCategory } from "@/lib/types";

type AddItemModalProps = {
  opened: boolean;
  onClose: () => void;
};

const CATEGORY_OPTIONS = (
  Object.keys(INVENTORY_CATEGORY_LABELS) as InventoryCategory[]
).map((key) => ({
  value: key,
  label: INVENTORY_CATEGORY_LABELS[key],
}));

export function AddItemModal({ opened, onClose }: AddItemModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string | null>("supplements");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [unitCost, setUnitCost] = useState<number | string>(0);
  const [sellingPrice, setSellingPrice] = useState<number | string>("");
  const [stockQty, setStockQty] = useState<number | string>(0);
  const [threshold, setThreshold] = useState<number | string>(5);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!opened) return;
    setName("");
    setCategory("supplements");
    setDescription("");
    setSku("");
    setUnitCost(0);
    setSellingPrice("");
    setStockQty(0);
    setThreshold(5);
    setPhotoUrl(null);
  }, [opened]);

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const gymId = user?.user_metadata?.gym_id as string | undefined;
      if (!gymId) throw new Error("Missing gym");

      const path = `${gymId}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from("inventory-photos")
        .upload(path, file, {
          contentType: file.type || "image/webp",
          upsert: false,
        });
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("inventory-photos").getPublicUrl(path);
      setPhotoUrl(publicUrl);
      notifications.show({ color: "green", message: "Photo uploaded." });
    } catch (e) {
      notifications.show({
        color: "red",
        message: e instanceof Error ? e.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const { error } = await createItem({
        name: name.trim(),
        category: (category as InventoryCategory) || "other",
        description: description.trim() || null,
        sku: sku.trim() || null,
        unit_cost: Number(unitCost) || 0,
        selling_price: Number(sellingPrice),
        stock_qty: Number(stockQty) || 0,
        low_stock_threshold: Number(threshold) || 5,
        photo_url: photoUrl,
      });

      if (error) {
        notifications.show({ color: "red", message: error });
        return;
      }

      notifications.show({ color: "green", message: "Item added." });
      onClose();
      router.refresh();
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Item"
      centered
      radius="md"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          mb="sm"
          radius="md"
        />
        <Select
          label="Category"
          data={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          mb="sm"
          radius="md"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
          mb="sm"
          radius="md"
          minRows={2}
        />
        <TextInput
          label="SKU"
          value={sku}
          onChange={(e) => setSku(e.currentTarget.value)}
          mb="sm"
          radius="md"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <NumberInput
            label="Unit Cost"
            value={unitCost}
            onChange={setUnitCost}
            min={0}
            thousandSeparator=","
            hideControls
            radius="md"
          />
          <NumberInput
            label="Selling Price"
            required
            value={sellingPrice}
            onChange={setSellingPrice}
            min={0}
            thousandSeparator=","
            hideControls
            radius="md"
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <NumberInput
            label="Initial Stock Qty"
            required
            value={stockQty}
            onChange={setStockQty}
            min={0}
            hideControls
            radius="md"
          />
          <NumberInput
            label="Low Stock Threshold"
            value={threshold}
            onChange={setThreshold}
            min={0}
            hideControls
            radius="md"
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 6,
              color: "#212529",
            }}
          >
            Photo
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%",
              border: "1.5px dashed #dcd6c8",
              borderRadius: 11,
              padding: "12px 14px",
              background: "#fff",
              color: photoUrl ? "#1b5e3c" : "#8a8a80",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          >
            {uploading
              ? "Uploading…"
              : photoUrl
                ? "Photo uploaded — click to replace"
                : "Upload item photo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadPhoto(file);
            }}
          />
        </div>

        <button
          type="submit"
          disabled={pending || uploading}
          style={{
            width: "100%",
            background: "#1b5e3c",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "12px 16px",
            fontWeight: 700,
            fontSize: 14,
            cursor: pending ? "not-allowed" : "pointer",
            opacity: pending ? 0.65 : 1,
            fontFamily: "inherit",
          }}
        >
          {pending ? "Saving…" : "Add Item"}
        </button>
      </form>
    </Modal>
  );
}
