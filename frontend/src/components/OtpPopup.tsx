import React, { useEffect, useRef, useState } from "react";

const OTP_LENGTH = 4;
const RESEND_COOLDOWN_S = 30;

interface OtpPopupProps {
  onClose: () => void;
  onSubmit: (otp: string) => void;
  onResend: () => void;
  error?: string;
  /** Dev-mode OTP returned by the API when no SMS provider is configured. */
  devOtp?: string;
  loading?: boolean;
}

const OtpPopup: React.FC<OtpPopupProps> = ({
  onClose,
  onSubmit,
  onResend,
  error,
  devOtp,
  loading,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const setDigit = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    setOtp((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "Enter" && otp.every(Boolean)) {
      onSubmit(otp.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!digits) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    digits.split("").forEach((d, i) => (next[i] = d));
    setOtp(next);
    inputsRef.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN_S);
    setOtp(Array(OTP_LENGTH).fill(""));
    inputsRef.current[0]?.focus();
    onResend();
  };

  const complete = otp.every(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Enter OTP"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs sm:max-w-sm p-6 text-center relative">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-2 right-3 text-2xl leading-none text-gray-400 hover:text-gray-700"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-purple-900 mb-1">Enter OTP</h2>
        <p className="text-gray-500 text-sm mb-4">
          We&apos;ve sent a {OTP_LENGTH}-digit code to your phone
        </p>

        {devOtp && (
          <p className="text-xs text-purple-700 bg-purple-50 rounded-md py-1.5 px-3 mb-4">
            Demo mode &mdash; your OTP is <strong>{devOtp}</strong>
          </p>
        )}

        <div className="flex justify-center gap-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength={1}
              value={digit}
              aria-label={`Digit ${index + 1}`}
              onChange={(e) => setDigit(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="w-12 h-12 text-center text-lg font-bold border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-700 focus:ring-2 focus:ring-purple-200"
            />
          ))}
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-2" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-purple-900 text-sm font-semibold mb-4 hover:underline disabled:text-gray-400 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
        </button>

        <button
          onClick={() => onSubmit(otp.join(""))}
          disabled={!complete || loading}
          className="w-full py-3 bg-yellow-400 text-purple-900 font-bold rounded-lg shadow-md hover:bg-yellow-500 active:scale-[0.98] transition disabled:opacity-50 disabled:hover:bg-yellow-400"
        >
          {loading ? "Verifying..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default OtpPopup;
