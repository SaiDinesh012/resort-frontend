import crypto from "crypto";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  "royalgrandin-secret-session-key-maredumilli-2026-secure";

export interface AdminSessionUser {
  email: string;
  role: string;
  exp: number;
}

/**
 * Creates an HMAC-SHA256 signed session token
 */
export function signSessionToken(
  payload: { email: string; role?: string },
  expiresInDays = 7
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
  const data: AdminSessionUser = {
    email: payload.email,
    role: payload.role || "admin",
    exp,
  };
  const encodedData = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedData)
    .digest("base64url");
  return `${encodedData}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token
 */
export function verifySessionToken(token: string): AdminSessionUser | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedData, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(encodedData)
      .digest("base64url");

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) return null;

    const data: AdminSessionUser = JSON.parse(
      Buffer.from(encodedData, "base64url").toString("utf8")
    );

    // Check expiration
    if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}
