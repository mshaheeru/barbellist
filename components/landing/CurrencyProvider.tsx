"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  formatDemoUsd,
  formatMoney,
  profileFromCountry,
  rateLabel,
  type CurrencyProfile,
} from "@/lib/currency";

type CurrencyContextValue = {
  profile: CurrencyProfile;
  loading: boolean;
  money: (amount: number, opts?: { decimals?: number }) => string;
  demo: (usdAmount: number) => string;
  earlyRate: string;
  standardRate: string;
  earlyMin: string;
  standardMin: string;
  barbellist200: string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const DEFAULT = profileFromCountry("US");

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CurrencyProfile>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/geo");
        if (!res.ok) throw new Error("geo failed");
        const data = (await res.json()) as { country?: string };
        if (!cancelled) setProfile(profileFromCountry(data.country));
      } catch {
        if (!cancelled) setProfile(DEFAULT);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CurrencyContextValue>(() => {
    return {
      profile,
      loading,
      money: (amount, opts) => formatMoney(amount, profile, opts),
      demo: (usd) => formatDemoUsd(usd, profile),
      earlyRate: rateLabel(profile, "early"),
      standardRate: rateLabel(profile, "standard"),
      earlyMin: formatMoney(profile.earlyMin, profile),
      standardMin: formatMoney(profile.standardMin, profile),
      barbellist200: formatMoney(profile.standardRate * 200, profile),
    };
  }, [profile, loading]);

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
