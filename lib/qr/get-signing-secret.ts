/** Runtime QR HMAC secret (Cloudflare Worker env / .env.local). */
export function getQrSigningSecret(): string {
  // Bracket access avoids any build-time inlining of a missing literal.
  const secret = process.env["QR_SIGNING_SECRET"]?.trim();
  if (!secret) {
    throw new Error(
      "QR signing is not configured. Add QR_SIGNING_SECRET as an encrypted Cloudflare Worker secret, then try again.",
    );
  }
  return secret;
}
