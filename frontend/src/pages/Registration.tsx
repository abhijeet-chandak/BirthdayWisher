import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import OtpPopup from "../components/OtpPopup";
import mainImage from "../assets/Celebrations(Bg).png";
import { apiPost } from "../utils/api";
import { setSession } from "../utils/session";

interface AuthData {
  userId?: string;
  token?: string;
  devOtp?: string;
}

const inputClass =
  "w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400";

const checkboxClass =
  "appearance-none w-5 h-5 border-2 border-white rounded-full checked:bg-yellow-400 checked:border-yellow-400 flex-shrink-0 cursor-pointer transition mt-0.5";

const Registration: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [promotions, setPromotions] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [devOtp, setDevOtp] = useState<string | undefined>();
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const validate = (): string[] => {
    const errors: string[] = [];
    if (!fullName.trim()) errors.push("Full name is required.");
    if (!email.trim()) errors.push("Email ID is required.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.push("Enter a valid email ID.");
    if (!phone.trim()) errors.push("Phone number is required.");
    else if (!/^\d{10}$/.test(phone))
      errors.push("Enter a valid 10-digit phone number.");
    if (!acceptTerms) errors.push("You must accept Terms & Conditions.");
    if (!promotions) errors.push("You must opt-in for promotions.");
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate();
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setLoading(true);
    try {
      const { ok, body } = await apiPost<AuthData>("/api/auth/register", {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      if (ok && body.success && body.data?.userId) {
        setUserId(body.data.userId);
        setDevOtp(body.data.devOtp);
        setOtpError("");
        setShowOtp(true);
        toast.success(body.message || "OTP sent successfully");
      } else {
        toast.error(body.message || "Failed to register. Please try again.");
      }
    } catch {
      toast.error("Network error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    if (!userId) return;
    setVerifying(true);
    try {
      const { ok, body } = await apiPost<AuthData>("/api/auth/verify-otp", {
        userId,
        otp,
      });

      if (ok && body.success && body.data?.token) {
        setSession(userId, body.data.token);
        setShowOtp(false);
        toast.success(body.message || "OTP verified successfully!");
        navigate("/birthday-details");
      } else {
        setOtpError(body.message || "OTP verification failed.");
      }
    } catch {
      setOtpError("Network error during OTP verification.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      const { ok, body } = await apiPost<AuthData>("/api/auth/resend-otp", {
        userId,
      });
      if (ok && body.success) {
        setDevOtp(body.data?.devOtp);
        setOtpError("");
        toast.info("OTP resent");
      } else {
        toast.error(body.message || "Could not resend OTP.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <Layout step={1}>
      <div className="flex flex-col items-center text-center space-y-6 w-full max-w-md mx-auto pt-4">
        <img
          src={mainImage}
          alt="Cadbury Celebrations"
          className="w-48 sm:w-64 h-auto object-contain"
        />
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Register to create
        </h1>

        <form
          className="w-full flex flex-col space-y-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <label className="sr-only" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Full Name"
            autoComplete="name"
            maxLength={60}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />

          <label className="sr-only" htmlFor="email">
            Email ID
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email ID"
            autoComplete="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />

          <label className="sr-only" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            placeholder="Phone Number"
            autoComplete="tel"
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
            className={inputClass}
          />

          <label className="flex items-start space-x-2 text-white text-sm cursor-pointer text-left">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={() => setAcceptTerms((v) => !v)}
              className={checkboxClass}
            />
            <span>
              I accept Terms &amp; Conditions and Privacy Policy of Mondelez
              (Cadbury)
            </span>
          </label>

          <label className="flex items-start space-x-2 text-white text-sm cursor-pointer text-left">
            <input
              type="checkbox"
              checked={promotions}
              onChange={() => setPromotions((v) => !v)}
              className={checkboxClass}
            />
            <span>
              I would like to receive promotional communication from Mondelez
              (Cadbury) about its products and offers.
            </span>
          </label>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-44 py-3 bg-yellow-400 text-purple-900 font-bold rounded-lg shadow-md hover:bg-yellow-500 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

      {showOtp && (
        <OtpPopup
          onClose={() => setShowOtp(false)}
          onSubmit={handleOtpSubmit}
          onResend={handleResend}
          error={otpError}
          devOtp={devOtp}
          loading={verifying}
        />
      )}
    </Layout>
  );
};

export default Registration;
