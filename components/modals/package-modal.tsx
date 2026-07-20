"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Checkbox,
  NumberInput,
  Select,
  Switch,
  Textarea,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Check, Plus, X } from "lucide-react";
import { createPackage, updatePackage } from "@/app/actions/packages";
import {
  DURATION_PRESETS,
  GOAL_LABELS,
  parseFeatures,
} from "@/lib/packages/format";
import {
  PACKAGE_COLOR_PRESETS,
  packageFormSchema,
  type PackageFormInput,
} from "@/lib/validations/packages";
import type { FitnessGoal } from "@/lib/validations/members";
import type { Package } from "@/lib/types";
import styles from "./package-modal.module.css";

type PackageModalProps = {
  opened: boolean;
  onClose: () => void;
  package: Package | null;
  currencySymbol: string;
  onSaved: (pkg: Package) => void;
};

const GOAL_OPTIONS = Object.entries(GOAL_LABELS) as [FitnessGoal, string][];

function emptyForm(): PackageFormInput {
  return {
    name: "",
    description: "",
    price: 0,
    duration_days: 30,
    features: [""],
    bmi_min: null,
    bmi_max: null,
    recommended_goals: [],
    color: "#1B5E3C",
    is_active: true,
    sort_order: 0,
  };
}

function fromPackage(pkg: Package): PackageFormInput {
  const features = parseFeatures(pkg.features);
  return {
    name: pkg.name,
    description: pkg.description ?? "",
    price: Number(pkg.price),
    duration_days: pkg.duration_days,
    features: features.length > 0 ? features : [""],
    bmi_min: pkg.bmi_min,
    bmi_max: pkg.bmi_max,
    recommended_goals: (pkg.recommended_goals ?? []) as FitnessGoal[],
    color: pkg.color || "#1B5E3C",
    is_active: pkg.is_active,
    sort_order: pkg.sort_order,
  };
}

function durationSelectValue(days: number): string {
  const preset = DURATION_PRESETS.find((p) => p.days === days);
  return preset ? preset.value : "custom";
}

export function PackageModal({
  opened,
  onClose,
  package: editing,
  currencySymbol,
  onSaved,
}: PackageModalProps) {
  const [form, setForm] = useState<PackageFormInput>(emptyForm);
  const [durationKey, setDurationKey] = useState("30");
  const [showBmi, setShowBmi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!opened) return;
    if (editing) {
      const next = fromPackage(editing);
      setForm(next);
      setDurationKey(durationSelectValue(next.duration_days));
      setShowBmi(next.bmi_min != null || next.bmi_max != null);
    } else {
      setForm(emptyForm());
      setDurationKey("30");
      setShowBmi(false);
    }
    setError(null);
  }, [opened, editing]);

  if (!opened) return null;

  const setField = <K extends keyof PackageFormInput>(
    key: K,
    value: PackageFormInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateFeature = (index: number, value: string) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[index] = value;
      return { ...prev, features };
    });
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index: number) => {
    setForm((prev) => {
      const features = prev.features.filter((_, i) => i !== index);
      return { ...prev, features: features.length > 0 ? features : [""] };
    });
  };

  const toggleGoal = (goal: FitnessGoal) => {
    setForm((prev) => {
      const has = prev.recommended_goals.includes(goal);
      return {
        ...prev,
        recommended_goals: has
          ? prev.recommended_goals.filter((g) => g !== goal)
          : [...prev.recommended_goals, goal],
      };
    });
  };

  const handleDurationChange = (value: string | null) => {
    if (!value) return;
    setDurationKey(value);
    if (value === "custom") return;
    const days = Number(value);
    if (!Number.isNaN(days)) setField("duration_days", days);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleaned: PackageFormInput = {
      ...form,
      features: form.features.map((f) => f.trim()).filter(Boolean),
      description: form.description?.toString().trim() || null,
      bmi_min: showBmi ? form.bmi_min : null,
      bmi_max: showBmi ? form.bmi_max : null,
    };

    const parsed = packageFormSchema.safeParse(cleaned);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    startTransition(async () => {
      const result = editing
        ? await updatePackage(editing.id, parsed.data)
        : await createPackage(parsed.data);

      if (result.error || !result.data) {
        setError(result.error ?? "Failed to save package");
        notifications.show({
          color: "red",
          message: result.error ?? "Failed to save package",
        });
        return;
      }

      notifications.show({
        color: "green",
        message: editing ? "Package updated" : "Package created",
      });
      onSaved(result.data);
    });
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose();
      }}
    >
      <form className={styles.modal} onSubmit={handleSubmit}>
        <div className={styles.modalHeader}>
          <h2 id="package-modal-title" className={styles.modalTitle}>
            {editing ? "Edit Package" : "Add Package"}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            disabled={pending}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {error ? <div className={styles.errorText}>{error}</div> : null}

          <div className={styles.field}>
            <TextInput
              label="Name"
              required
              value={form.name}
              onChange={(e) => setField("name", e.currentTarget.value)}
              placeholder="e.g. Standard"
            />
          </div>

          <div className={styles.field}>
            <Textarea
              label="Description"
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.currentTarget.value)}
              placeholder="Optional short description"
              minRows={2}
              autosize
            />
          </div>

          <div className={styles.row2}>
            <NumberInput
              label="Price"
              required
              min={0}
              decimalScale={2}
              fixedDecimalScale={false}
              prefix={`${currencySymbol} `}
              value={form.price || ""}
              onChange={(v) =>
                setField("price", typeof v === "number" ? v : 0)
              }
            />
            <div>
              <Select
                label="Duration"
                required
                data={DURATION_PRESETS.map((p) => ({
                  value: p.value,
                  label: p.label,
                }))}
                value={durationKey}
                onChange={handleDurationChange}
                allowDeselect={false}
              />
              {durationKey === "custom" ? (
                <NumberInput
                  mt={8}
                  label="Custom days"
                  min={1}
                  value={form.duration_days}
                  onChange={(v) =>
                    setField(
                      "duration_days",
                      typeof v === "number" ? v : 1,
                    )
                  }
                />
              ) : null}
            </div>
          </div>

          <div className={styles.sectionLabel}>Features</div>
          {form.features.map((feature, index) => (
            <div key={index} className={styles.featureRow}>
              <TextInput
                className={styles.featureInput}
                value={feature}
                onChange={(e) => updateFeature(index, e.currentTarget.value)}
                placeholder={`Feature ${index + 1}`}
              />
              <button
                type="button"
                className={styles.removeFeatureBtn}
                onClick={() => removeFeature(index)}
                aria-label="Remove feature"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.addFeatureBtn}
            onClick={addFeature}
          >
            <Plus size={14} strokeWidth={2.4} />
            Add feature
          </button>

          <div className={styles.sectionLabel}>Color</div>
          <div className={styles.swatchRow}>
            {PACKAGE_COLOR_PRESETS.map((color) => {
              const selected = form.color.toUpperCase() === color.toUpperCase();
              return (
                <button
                  key={color}
                  type="button"
                  className={`${styles.swatch} ${selected ? styles.swatchSelected : ""}`}
                  style={{ background: color }}
                  onClick={() => setField("color", color)}
                  aria-label={`Color ${color}`}
                  aria-pressed={selected}
                >
                  {selected ? <Check size={16} color="#fff" strokeWidth={3} /> : null}
                </button>
              );
            })}
          </div>

          <div className={styles.bmiToggle}>
            <span>Add BMI recommendation</span>
            <Switch
              checked={showBmi}
              onChange={(e) => setShowBmi(e.currentTarget.checked)}
              size="sm"
              color="#1B5E3C"
            />
          </div>
          {showBmi ? (
            <div className={styles.row2}>
              <NumberInput
                label="BMI Min"
                min={0}
                decimalScale={1}
                value={form.bmi_min ?? ""}
                onChange={(v) =>
                  setField("bmi_min", typeof v === "number" ? v : null)
                }
              />
              <NumberInput
                label="BMI Max"
                min={0}
                decimalScale={1}
                value={form.bmi_max ?? ""}
                onChange={(v) =>
                  setField("bmi_max", typeof v === "number" ? v : null)
                }
              />
            </div>
          ) : null}

          <div className={styles.sectionLabel}>Recommended Goals</div>
          <div className={styles.goalsGrid}>
            {GOAL_OPTIONS.map(([value, label]) => (
              <Checkbox
                key={value}
                label={label}
                checked={form.recommended_goals.includes(value)}
                onChange={() => toggleGoal(value)}
                color="#1B5E3C"
              />
            ))}
          </div>

          <div className={styles.row2}>
            <div>
              <div className={styles.sectionLabel}>Active</div>
              <Switch
                checked={form.is_active}
                onChange={(e) =>
                  setField("is_active", e.currentTarget.checked)
                }
                label={form.is_active ? "Active" : "Inactive"}
                color="#1B5E3C"
              />
            </div>
            <NumberInput
              label="Sort Order"
              min={0}
              value={form.sort_order}
              onChange={(v) =>
                setField("sort_order", typeof v === "number" ? v : 0)
              }
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn} disabled={pending}>
            {pending ? "Saving…" : "Save Package"}
          </button>
        </div>
      </form>
    </div>
  );
}
