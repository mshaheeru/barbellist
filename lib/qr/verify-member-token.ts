import { jwtVerify } from "jose";
import { getQrSigningSecret } from "@/lib/qr/get-signing-secret";

export type VerifiedMemberToken = {
  memberId: string;
  gymId: string;
};

export class QrTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QrTokenError";
  }
}

export async function verifyMemberQrToken(
  token: string,
): Promise<VerifiedMemberToken> {
  let secret: string;
  try {
    secret = getQrSigningSecret();
  } catch {
    throw new QrTokenError("QR signing is not configured");
  }

  let payload: Record<string, unknown>;
  let sub: string | undefined;

  try {
    const result = await jwtVerify(
      token,
      new TextEncoder().encode(secret),
      { algorithms: ["HS256"] },
    );
    payload = result.payload as Record<string, unknown>;
    sub = result.payload.sub;
  } catch {
    throw new QrTokenError("Invalid or expired QR code");
  }

  if (payload.type !== "barbellist_member_card") {
    throw new QrTokenError("Invalid QR code");
  }

  const gymId = payload.gym as string | undefined;
  if (!sub || !gymId) {
    throw new QrTokenError("Invalid QR code payload");
  }

  return { memberId: sub, gymId };
}
