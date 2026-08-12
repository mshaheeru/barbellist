"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Dumbbell, X } from "lucide-react";
import { notifications } from "@mantine/notifications";
import { useMemo, useState, useTransition } from "react";
import { createMemberWithPayment } from "@/app/actions/members";
import type { Package } from "@/lib/types";
import type { OnboardingPaymentInput } from "@/lib/validations/members";
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingPaymentSchema,
  type CreateMemberWithPaymentInput,
} from "@/lib/validations/members";
import { getStepLabel, OnboardingProgress } from "./onboarding-progress";
import { PersonalInfoStep } from "./steps/personal-info-step";
import { HealthAssessmentStep } from "./steps/health-assessment-step";
import { PackageSelectionStep } from "./steps/package-selection-step";
import { PaymentStep } from "./steps/payment-step";
import styles from "./onboarding.module.css";

export const FITNESS_GOAL_OPTIONS = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "general_fitness", label: "General Fitness" },
  { value: "endurance", label: "Endurance" },
  { value: "flexibility", label: "Flexibility" },
  { value: "rehabilitation", label: "Rehabilitation" },
] as const;

export type OnboardingState = {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  date_of_birth: string | null;
  gender: "male" | "female" | "other" | null;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  photo_url: string | null;
  photo_preview: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  fitness_goals: string[];
  package_id: string | null;
  payment_method: OnboardingPaymentInput["payment_method"];
  amount: number;
  is_partial: boolean;
  notes: string;
  send_whatsapp_receipt: boolean;
};

function createInitialState(): OnboardingState {
  return {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    date_of_birth: null,
    gender: null,
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    photo_url: null,
    photo_preview: null,
    height_cm: null,
    weight_kg: null,
    fitness_goals: [],
    package_id: null,
    payment_method: "cash",
    amount: 0,
    is_partial: false,
    notes: "",
    send_whatsapp_receipt: false,
  };
}

type OnboardingWizardProps = {
  packages: Package[];
};

export function OnboardingWizard({ packages }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardingState>(createInitialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === state.package_id) ?? null,
    [packages, state.package_id],
  );

  function patchState(patch: Partial<OnboardingState>) {
    setState((prev) => {
      const next = { ...prev, ...patch };
      if (patch.whatsapp !== undefined && patch.whatsapp) {
        next.send_whatsapp_receipt = true;
      }
      return next;
    });
    setErrors({});
  }

  function validateStep(currentStep: number): boolean {
    if (currentStep === 1) {
      const result = onboardingStep1Schema.safeParse({
        name: state.name,
        phone: state.phone,
        whatsapp: state.whatsapp || null,
        email: state.email || null,
        date_of_birth: state.date_of_birth,
        gender: state.gender,
        address: state.address || null,
        emergency_contact_name: state.emergency_contact_name || null,
        emergency_contact_phone: state.emergency_contact_phone || null,
        photo_url: state.photo_url,
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0]?.toString() ?? "form";
          fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return false;
      }
    }

    if (currentStep === 2) {
      const result = onboardingStep2Schema.safeParse({
        height_cm: state.height_cm,
        weight_kg: state.weight_kg,
        fitness_goals: state.fitness_goals,
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0]?.toString() ?? "form";
          fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return false;
      }
    }

    if (currentStep === 3) {
      if (!state.package_id) {
        setErrors({ package_id: "Please select a package" });
        return false;
      }
    }

    if (currentStep === 4) {
      const pkgPrice = selectedPackage ? Number(selectedPackage.price) : 0;
      const amount = state.is_partial ? state.amount : pkgPrice;
      const result = onboardingPaymentSchema.safeParse({
        package_id: state.package_id,
        payment_method: state.payment_method,
        amount,
        is_partial: state.is_partial,
        notes: state.notes || null,
        send_whatsapp_receipt: state.send_whatsapp_receipt,
      });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0]?.toString() ?? "form";
          fieldErrors[key] = issue.message;
        }
        setErrors(fieldErrors);
        return false;
      }
    }

    setErrors({});
    return true;
  }

  function handleNext() {
    if (!validateStep(step)) return;

    if (step === 3 && selectedPackage) {
      setState((prev) => ({
        ...prev,
        amount: Number(selectedPackage.price),
        is_partial: false,
        send_whatsapp_receipt: Boolean(prev.whatsapp || prev.phone),
      }));
    }

    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    submitRegistration();
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function submitRegistration() {
    const pkgPrice = selectedPackage ? Number(selectedPackage.price) : 0;
    const amount = state.is_partial ? state.amount : pkgPrice;

    if (!state.package_id) return;

    startTransition(async () => {
      const { memberId, error } = await createMemberWithPayment({
        name: state.name,
        phone: state.phone,
        whatsapp: state.whatsapp || null,
        email: state.email || null,
        date_of_birth: state.date_of_birth,
        gender: state.gender,
        address: state.address || null,
        emergency_contact_name: state.emergency_contact_name || null,
        emergency_contact_phone: state.emergency_contact_phone || null,
        photo_url: state.photo_url,
        height_cm: state.height_cm!,
        weight_kg: state.weight_kg!,
        fitness_goals: state.fitness_goals as CreateMemberWithPaymentInput["fitness_goals"],
        package_id: state.package_id!,
        payment_method: state.payment_method,
        amount,
        is_partial: state.is_partial,
        notes: state.notes || null,
        send_whatsapp_receipt: state.send_whatsapp_receipt,
      });

      if (error || !memberId) {
        notifications.show({
          color: "red",
          title: "Registration failed",
          message: error ?? "Something went wrong",
        });
        return;
      }

      notifications.show({
        color: "green",
        title: "Member registered",
        message: `${state.name} has been added successfully.`,
        autoClose: 5000,
      });

      router.push(`/dashboard/members/${memberId}`);
    });
  }

  const nextLabel =
    step === 4
      ? pending
        ? "Registering…"
        : "Complete Registration"
      : step === 3
        ? "Continue to Payment"
        : "Continue";

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <div className={styles.logoMark}>
            <Dumbbell size={19} color="var(--color-accent)" strokeWidth={2.2} />
          </div>
          <div>
            <span className={styles.topBarTitle}>New Member — Onboarding</span>
            <span className={styles.topBarStepMeta}>
              Step {step} of 4 · {getStepLabel(step)}
            </span>
          </div>
        </div>
        <OnboardingProgress currentStep={step} compact />
        <Link href="/dashboard/members" className={styles.closeBtn} aria-label="Close">
          <X size={17} strokeWidth={2} />
        </Link>
      </header>

      <div className={styles.body}>
        {step === 1 ? (
          <PersonalInfoStep state={state} errors={errors} onChange={patchState} />
        ) : null}
        {step === 2 ? (
          <HealthAssessmentStep state={state} errors={errors} onChange={patchState} />
        ) : null}
        {step === 3 ? (
          <PackageSelectionStep
            state={state}
            packages={packages}
            errors={errors}
            onChange={patchState}
          />
        ) : null}
        {step === 4 ? (
          <PaymentStep
            state={state}
            packages={packages}
            errors={errors}
            onChange={patchState}
          />
        ) : null}
      </div>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={handleBack}
          disabled={step === 1 || pending}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back
        </button>
        <span className={styles.footerStep}>Step {step} of 4</span>
        <button
          type="button"
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={pending}
        >
          {nextLabel}
          {step < 4 ? <ArrowRight size={16} strokeWidth={2} /> : null}
        </button>
      </footer>
    </div>
  );
}
