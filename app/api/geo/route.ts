import { NextResponse } from "next/server";
import { profileFromCountry } from "@/lib/currency";


export async function GET(request: Request) {
  const headers = request.headers;
  let country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    "";

  country = country.toUpperCase();

  if (!country || country === "XX" || country === "T1") {
    try {
      const res = await fetch("https://ipapi.co/country_code/", {
        headers: { Accept: "text/plain" },
        cache: "no-store",
      });
      if (res.ok) {
        const text = (await res.text()).trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(text)) country = text;
      }
    } catch {
      // fall through to USD
    }
  }

  const profile = profileFromCountry(country || "US");
  return NextResponse.json({
    country: profile.countryCode,
    currency: profile.code,
    region: profile.region,
  });
}
