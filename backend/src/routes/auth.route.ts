import express from "express";
import {
  registerUser,
  verifyOtp,
  resendOtp,
} from "../controllers/auth.controller";

const router = express.Router();

router.post("/register", registerUser);
router.post("/resend-otp", resendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
