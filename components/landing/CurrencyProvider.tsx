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
  memberCap: number;
  example100: string;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const DEFAULT = profileFromCountry("US");

/** Soft fallback when IP geo fails (common on localhost). */
function countryFromTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const map: Record<string, string> = {
      "Asia/Karachi": "PK",
      "Asia/Dubai": "AE",
      "Asia/Muscat": "OM",
      "Asia/Qatar": "QA",
      "Asia/Bahrain": "BH",
      "Asia/Kuwait": "KW",
      "Asia/Riyadh": "SA",
    };
    return map[tz] ?? null;
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CurrencyProfile>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/geo");
        if (!res.ok) throw new Error("geo failed");
        const data = (await res.json()) as {
          country?: string;
          source?: string;
        };
        let country = data.country;
        // IP lookup often fails on localhost / rate limits → use timezone
        if (!country || data.source === "default") {
          country = countryFromTimezone() ?? country;
        }
        if (!cancelled) setProfile(profileFromCountry(country));
      } catch {
        const tzCountry = countryFromTimezone();
        if (!cancelled) {
          setProfile(profileFromCountry(tzCountry ?? "US"));
        }
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
      memberCap: profile.memberCap,
      example100: formatMoney(profile.earlyRate * 100, profile, {
        decimals: profile.earlyRate % 1 ? 2 : 0,
      }),
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
