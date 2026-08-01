import crypto from "crypto";

export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_OTP_ATTEMPTS = 5;

/** Cryptographically random 4-digit OTP. */
export const generateOtp = (): string =>
  crypto.randomInt(0, 10000).toString().padStart(4, "0");

/** Hash an OTP before storing it — never persist the plain value. */
export const hashOtp = (otp: string, phone: string): string =>
  crypto.createHash("sha256").update(`${otp}:${phone}`).digest("hex");

/** Constant-time comparison of a submitted OTP against the stored hash. */
export const otpMatches = (
  otp: string,
  phone: string,
  storedHash: string
): boolean => {
  const submitted = Buffer.from(hashOtp(otp, phone), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return (
    submitted.length === stored.length &&
    crypto.timingSafeEqual(submitted, stored)
  );
};

/**
 * "Send" the OTP. There is no SMS/email provider wired up, so outside of
 * production we log it and hand it back to the caller so the demo stays
 * usable. In production this is where a real provider call would go.
 */
export const deliverOtp = (otp: string, phone: string): string | undefined => {
  if (process.env.NODE_ENV === "production") {
    // TODO: integrate a real SMS/email provider before going live.
    console.warn(`OTP delivery not configured; OTP for ${phone} not sent`);
    return undefined;
  }
  console.log(`[dev] OTP for ${phone}: ${otp}`);
  return otp;
};
