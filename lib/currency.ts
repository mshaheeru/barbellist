export type CurrencyCode = "USD" | "AED" | "SAR" | "QAR" | "KWD" | "BHD" | "OMR" | "PKR";

export type Region = "usd" | "gulf" | "pakistan";

export type CurrencyProfile = {
  code: CurrencyCode;
  region: Region;
  /** Human label for footer / notes */
  label: string;
  /** Symbol or short prefix shown before amounts */
  symbol: string;
  /** Early-access price per member / month */
  earlyRate: number;
  /** Standard price per member / month */
  standardRate: number;
  /** Monthly minimum — early */
  earlyMin: number;
  /** Monthly minimum — standard */
  standardMin: number;
  /** Approx multiplier vs USD for demo/mock figures */
  demoFactor: number;
  countryCode: string;
};

/** Country ISO → currency mapping */
const GULF_MAP: Record<string, CurrencyCode> = {
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
};

const PROFILES: Record<CurrencyCode, Omit<CurrencyProfile, "countryCode">> = {
  USD: {
    code: "USD",
    region: "usd",
    label: "USD",
    symbol: "$",
    earlyRate: 1,
    standardRate: 3,
    earlyMin: 9,
    standardMin: 15,
    demoFactor: 1,
  },
  AED: {
    code: "AED",
    region: "gulf",
    label: "AED",
    symbol: "AED ",
    earlyRate: 1,
    standardRate: 2,
    earlyMin: 9,
    standardMin: 15,
    demoFactor: 3.67,
  },
  SAR: {
    code: "SAR",
    region: "gulf",
    label: "SAR",
    symbol: "SAR ",
    earlyRate: 1,
    standardRate: 2,
    earlyMin: 9,
    standardMin: 15,
    demoFactor: 3.75,
  },
  QAR: {
    code: "QAR",
    region: "gulf",
    label: "QAR",
    symbol: "QAR ",
    earlyRate: 1,
    standardRate: 2,
    earlyMin: 9,
    standardMin: 15,
    demoFactor: 3.64,
  },
  KWD: {
    code: "KWD",
    region: "gulf",
    label: "KWD",
    symbol: "KWD ",
    earlyRate: 1,
    standardRate: 2,
    earlyMin: 9,
    standardMin: 15,
    demoFactor: 0.31,
  },
  BHD: {
    code: "BHD",
    region: "gulf",
    label: "BHD",
    symbol: "BHD ",
    earlyRate: 1,
    standardRate: 2,
    earlyMin: 9,
    standardMin: 15,
    demoFactor: 0.38,
  },
  OMR: {
    code: "OMR",
    region: "gulf",
    label: "OMR",
    symbol: "OMR ",
    earlyRate: 1,
    standardRate: 2,
    earlyMin: 9,
    standardMin: 15,
    demoFactor: 0.38,
  },
  PKR: {
    code: "PKR",
    region: "pakistan",
    label: "PKR",
    symbol: "Rs ",
    earlyRate: 30,
    standardRate: 100,
    earlyMin: 270,
    standardMin: 900,
    demoFactor: 280,
  },
};

export function profileFromCountry(countryCode: string | null | undefined): CurrencyProfile {
  const cc = (countryCode || "").toUpperCase();
  if (cc === "PK") {
    return { ...PROFILES.PKR, countryCode: "PK" };
  }
  const gulf = GULF_MAP[cc];
  if (gulf) {
    return { ...PROFILES[gulf], countryCode: cc };
  }
  return { ...PROFILES.USD, countryCode: cc || "US" };
}

/** Format a currency amount (already in local units). */
export function formatMoney(amount: number, profile: CurrencyProfile, opts?: { decimals?: number }): string {
  const decimals =
    opts?.decimals ?? (Math.abs(amount - Math.round(amount)) < 0.001 ? 0 : 2);

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  if (profile.code === "USD") return `$${formatted}`;
  if (profile.code === "PKR") return `Rs ${formatted}`;
  return `${profile.code} ${formatted}`;
}

/** Convert a USD demo figure into the visitor's local display currency. */
export function formatDemoUsd(usdAmount: number, profile: CurrencyProfile): string {
  const local = usdAmount * profile.demoFactor;
  const rounded =
    profile.code === "PKR"
      ? Math.round(local / 10) * 10
      : profile.region === "gulf" && profile.demoFactor < 1
        ? Math.round(local * 100) / 100
        : Math.round(local);
  return formatMoney(rounded, profile);
}

export function rateLabel(profile: CurrencyProfile, which: "early" | "standard"): string {
  const rate = which === "early" ? profile.earlyRate : profile.standardRate;
  return formatMoney(rate, profile, {
    decimals: profile.code === "USD" || profile.region === "gulf" ? (rate % 1 ? 2 : 0) : 0,
  });
}
