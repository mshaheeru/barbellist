import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Runtime QR HMAC secret (Cloudflare Worker env / .env.local). */
export function getQrSigningSecret(): string {
  // Bracket access avoids any build-time inlining of a missing literal.
  let secret = process.env["QR_SIGNING_SECRET"]?.trim();

  if (!secret) {
    try {
      const env = getCloudflareContext({ async: false }).env as Record<
        string,
        unknown
      >;
      const fromCf = env["QR_SIGNING_SECRET"];
      if (typeof fromCf === "string") secret = fromCf.trim();
    } catch {
      // Outside a request / non-CF runtime — ignore.
    }
  }

  if (!secret) {
    throw new Error(
      "QR signing is not configured. Add QR_SIGNING_SECRET as an encrypted Cloudflare Worker secret, then try again.",
    );
  }
  return secret;
}
