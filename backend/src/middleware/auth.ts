import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthedRequest extends Request {
  userId?: string;
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
};

/**
 * Requires a valid `Authorization: Bearer <token>` header issued by
 * verify-otp. The user id comes from the signed token — never from the
 * request body, so clients cannot act on behalf of other users.
 */
export const requireAuth = (
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(header.slice(7), getJwtSecret()) as {
      userId: string;
    };
    req.userId = payload.userId;
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired session" });
  }
};
