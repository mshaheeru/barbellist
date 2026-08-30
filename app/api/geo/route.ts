import { NextResponse } from "next/server";
import { profileFromCountry } from "@/lib/currency";

function headerCountry(headers: Headers): string {
  const raw =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("cloudfront-viewer-country") ||
    headers.get("x-country-code") ||
    "";
  return raw.trim().toUpperCase();
}

function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real =
    headers.get("cf-connecting-ip") ||
    headers.get("x-real-ip") ||
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    "";
  return real || null;
}

function isPrivateOrLocal(ip: string): boolean {
  if (ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:")) {
    return true;
  }
  return false;
}

async function lookupCountryByIp(ip: string | null): Promise<string> {
  const targets = ip && !isPrivateOrLocal(ip) ? [ip] : [null];

  for (const target of targets) {
    // ipwho.is — free, no key, accepts IP or auto-detects caller
    try {
      const url = target ? `https://ipwho.is/${target}` : "https://ipwho.is/";
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          success?: boolean;
          country_code?: string;
        };
        const code = data.country_code?.toUpperCase();
        if (data.success !== false && code && /^[A-Z]{2}$/.test(code)) {
          return code;
        }
      }
    } catch {
      // try next provider
    }

    // ipapi.co — free tier; pass IP when we have one
    try {
      const url = target
        ? `https://ipapi.co/${target}/country_code/`
        : "https://ipapi.co/country_code/";
      const res = await fetch(url, {
        headers: { Accept: "text/plain" },
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const text = (await res.text()).trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(text)) return text;
      }
    } catch {
      // fall through
    }
  }

  return "";
}

export async function GET(request: Request) {
  const headers = request.headers;

  // Local / preview override: GEO_COUNTRY_OVERRIDE=PK
  const override = process.env.GEO_COUNTRY_OVERRIDE?.trim().toUpperCase();
  if (override && /^[A-Z]{2}$/.test(override)) {
    const profile = profileFromCountry(override);
    return NextResponse.json({
      country: profile.countryCode,
      currency: profile.code,
      region: profile.region,
      source: "override",
    });
  }

  let country = headerCountry(headers);
  let source = country ? "header" : "";

  if (!country || country === "XX" || country === "T1") {
    country = await lookupCountryByIp(clientIp(headers));
    source = country ? "ip" : "";
  }

  const profile = profileFromCountry(country || "US");
  return NextResponse.json({
    country: profile.countryCode,
    currency: profile.code,
    region: profile.region,
    source: source || "default",
  });
}
