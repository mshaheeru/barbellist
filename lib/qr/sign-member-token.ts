import { SignJWT } from "jose";
import { getQrSigningSecret } from "@/lib/qr/get-signing-secret";

export async function signMemberQrToken(
  memberId: string,
  gymId: string,
): Promise<string> {
  const secret = getQrSigningSecret();
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
