"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Gym, StaffRole } from "@/lib/types";
import { getInitials } from "@/lib/members/format";

export { getInitials };

type GymContextValue = {
  supabase: SupabaseClient;
  user: User | null;
  gym: Gym | null;
  gymId: string | null;
  gymName: string | null;
  currency: string;
  currencySymbol: string;
  role: StaffRole | null;
  staffId: string | null;
  staffName: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const GymContext = createContext<GymContextValue | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      setUser(authUser);

      if (!authUser) {
        setGym(null);
        setStaffId(null);
        setStaffName(null);
        return;
      }

      const gymId = authUser.user_metadata?.gym_id as string | undefined;
      const metaName = authUser.user_metadata?.name as string | undefined;

      if (gymId) {
        const { data: gymRow } = await supabase
          .from("gyms")
          .select(
            "id, name, slug, address, city, country, phone, whatsapp, email, logo_url, timezone, currency, currency_symbol, settings, subscription_plan, subscription_status, trial_ends_at, created_at, updated_at",
          )
          .eq("id", gymId)
          .maybeSingle();

        setGym((gymRow as Gym | null) ?? null);
      } else {
        setGym(null);
      }

      const { data: staffRow } = await supabase
        .from("staff")
        .select("id, name")
        .eq("auth_user_id", authUser.id)
        .maybeSingle();

      setStaffId(staffRow?.id ?? null);
      setStaffName(staffRow?.name ?? metaName ?? authUser.email ?? null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const role = (user?.user_metadata?.role as StaffRole | undefined) ?? null;

  const value: GymContextValue = {
    supabase,
    user,
    gym,
    gymId: gym?.id ?? (user?.user_metadata?.gym_id as string | undefined) ?? null,
    gymName: gym?.name ?? null,
    currency: gym?.currency ?? "PKR",
    currencySymbol: gym?.currency_symbol ?? "Rs.",
    role,
    staffId,
    staffName,
    loading,
    refresh: load,
  };

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
}

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) {
    throw new Error("useGym must be used within GymProvider");
  }
  return ctx;
}

export function useGymId() {
  return useGym().gymId;
}
