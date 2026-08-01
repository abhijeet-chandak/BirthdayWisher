import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isValidObjectId } from "mongoose";
import UserModel from "../models/user.model";
import { getJwtSecret } from "../middleware/auth";
import {
  generateOtp,
  hashOtp,
  otpMatches,
  deliverOtp,
  OTP_TTL_MS,
  MAX_OTP_ATTEMPTS,
} from "../utils/otp";
import {
  EMAIL_REGEX,
  PHONE_REGEX,
  NAME_REGEX,
  cleanText,
} from "../utils/validate";

const issueToken = (userId: string): string =>
  jwt.sign({ userId }, getJwtSecret(), { expiresIn: "2h" });

/**
 * Register User
 * - Accepts: name, email, phone
 * - Creates (or re-uses) the user and sends a fresh one-time OTP
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const name = cleanText(req.body?.name);
    const email = cleanText(req.body?.email).toLowerCase();
    const phone = cleanText(req.body?.phone);

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (!NAME_REGEX.test(name)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid name" });
    }
    if (!EMAIL_REGEX.test(email) || email.length > 254) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a valid email address" });
    }
    if (!PHONE_REGEX.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit phone number",
      });
    }

    let user = await UserModel.findOne({ phone });

    if (!user) {
      const emailTaken = await UserModel.findOne({ email });
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: "This email is already registered with another number",
        });
      }
      user = new UserModel({ name, email, phone, isVerified: false });
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp, phone);
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    user.otpAttempts = 0;
    await user.save();

    const devOtp = deliverOtp(otp, phone);

    return res.json({
      success: true,
      message: "OTP sent to your phone",
      data: { userId: user._id, ...(devOtp ? { devOtp } : {}) },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error registering user" });
  }
};

/**
 * Resend OTP for an existing (not-yet-verified) registration.
 */
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const userId = cleanText(req.body?.userId);
    if (!userId || !isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "A valid userId is required" });
    }

    const user = await UserModel.findById(userId).select(
      "+otpHash +otpExpiresAt +otpAttempts"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp, user.phone);
    user.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
    user.otpAttempts = 0;
    await user.save();

    const devOtp = deliverOtp(otp, user.phone);

    return res.json({
      success: true,
      message: "OTP resent",
      data: { userId: user._id, ...(devOtp ? { devOtp } : {}) },
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error resending OTP" });
  }
};

/**
 * Verify OTP
 * - Checks the hashed OTP with expiry and attempt limits
 * - Marks the user verified and issues a session token (JWT)
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const userId = cleanText(req.body?.userId);
    const otp = cleanText(req.body?.otp);

    if (!userId || !otp || !isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "UserId and OTP are required" });
    }

    const user = await UserModel.findById(userId).select(
      "+otpHash +otpExpiresAt +otpAttempts"
    );
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No OTP pending. Please request a new one.",
      });
    }
    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }
    if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please request a new OTP.",
      });
    }

    if (!/^\d{4}$/.test(otp) || !otpMatches(otp, user.phone, user.otpHash)) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    return res.json({
      success: true,
      message: "User verified successfully",
      data: { userId: user._id, token: issueToken(String(user._id)) },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying OTP" });
  }
};
