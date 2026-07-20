import { SignJWT } from "jose";

export async function signMemberQrToken(
  memberId: string,
  gymId: string,
): Promise<string> {
  const secret = process.env.QR_SIGNING_SECRET;
  if (!secret) {
    throw new Error("QR_SIGNING_SECRET is not configured");
  }

  const key = new TextEncoder().encode(secret);

  return new SignJWT({
    gym: gymId,
    type: "barbellist_member_card",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(memberId)
    .setIssuedAt()
    .sign(key);
}
