"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { BranchSummary, Gym, Organization, StaffRole } from "@/lib/types";
import {
  getUserDisplayName,
  getUserGymId,
  getUserOrganizationId,
  getUserRole,
} from "@/lib/auth/claims";
import { getInitials } from "@/lib/members/format";

export { getInitials };

const GYM_SELECT =
  "id, organization_id, name, slug, address, city, country, phone, whatsapp, email, logo_url, timezone, currency, currency_symbol, settings, created_at, updated_at";

const ORG_SELECT =
  "id, name, slug, subscription_plan, subscription_status, trial_ends_at, created_at, updated_at";

type GymContextValue = {
  supabase: SupabaseClient;
  user: User | null;
  gym: Gym | null;
  gymId: string | null;
  gymName: string | null;
  organization: Organization | null;
  organizationId: string | null;
  branches: BranchSummary[];
  currency: string;
  currencySymbol: string;
  role: StaffRole | null;
  staffId: string | null;
  staffName: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Call before signOut so in-flight fetches cannot empty the dashboard shell. */
  freezeForLogout: () => void;
};

const GymContext = createContext<GymContextValue | null>(null);

export function GymProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadGen = useRef(0);
  const logoutFrozenRef = useRef(false);

  const freezeForLogout = useCallback(() => {
    logoutFrozenRef.current = true;
    loadGen.current += 1;
  }, []);

  const load = useCallback(async () => {
    if (logoutFrozenRef.current) return;
    const gen = ++loadGen.current;
    const alive = () => gen === loadGen.current && !logoutFrozenRef.current;

    setLoading(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!alive()) return;

      if (!authUser) {
        // Keep last gym/theme/nav until the document unloads. Clearing here
        // made logout flash default green, a missing logo, and an empty sidebar.
        return;
      }

      setUser(authUser);

      const gymId = getUserGymId(authUser);
      const metaName = getUserDisplayName(authUser);
      const role = getUserRole(authUser);
      let orgId = getUserOrganizationId(authUser);

      if (gymId) {
        const { data: gymRow } = await supabase
          .from("gyms")
          .select(GYM_SELECT)
          .eq("id", gymId)
          .maybeSingle();
        if (!alive()) return;

        if (gymRow) {
          setGym(gymRow as Gym);
          if (gymRow.organization_id) {
            orgId = gymRow.organization_id;
          }
        }
      } else if (alive()) {
        setGym(null);
      }

      if (orgId) {
        const { data: orgRow } = await supabase
          .from("organizations")
          .select(ORG_SELECT)
          .eq("id", orgId)
          .maybeSingle();
        if (!alive()) return;
        setOrganization((orgRow as Organization | null) ?? null);
      } else {
        setOrganization(null);
      }

      if (role === "owner" && orgId) {
        const { data: gyms } = await supabase
          .from("gyms")
          .select("id, name, slug, city, address")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: true });
        if (!alive()) return;
        setBranches((gyms as BranchSummary[] | null) ?? []);
      } else {
        setBranches([]);
      }

      if (gymId) {
        const { data: staffRow } = await supabase
          .from("staff")
          .select("id, name")
          .eq("gym_id", gymId)
          .eq("auth_user_id", authUser.id)
          .maybeSingle();
        if (!alive()) return;

        setStaffId(staffRow?.id ?? null);
        setStaffName(staffRow?.name ?? metaName ?? authUser.email ?? null);
      } else {
        setStaffId(null);
        setStaffName(metaName ?? authUser.email ?? null);
      }
    } finally {
      if (logoutFrozenRef.current || gen === loadGen.current) {
        setLoading(false);
      }
    }
  }, [supabase]);

  useEffect(() => {
    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" || logoutFrozenRef.current) {
        loadGen.current += 1;
        return;
      }
      void load();
    });

    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const role = getUserRole(user);

  const value: GymContextValue = {
    supabase,
    user,
    gym,
    gymId: gym?.id ?? getUserGymId(user) ?? null,
    gymName: gym?.name ?? null,
    organization,
    organizationId:
      organization?.id ??
      gym?.organization_id ??
      getUserOrganizationId(user) ??
      null,
    branches,
    currency: gym?.currency ?? "PKR",
    currencySymbol: gym?.currency_symbol ?? "Rs.",
    role,
    staffId,
    staffName,
    loading,
    refresh: load,
    freezeForLogout,
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
