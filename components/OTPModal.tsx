"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api-client";

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  email: string;
  darkMode?: boolean;
}

export default function OTPModal({
  isOpen,
  onClose,
  onVerifySuccess,
  email,
  darkMode = false,
}: OTPModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setSuccess(false);
      setSuccessMessage("");
      // Focus first input after a small delay to ensure modal is rendered
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    setOtp((prev) => {
      const newOtp = [...prev];
      newOtp[index] = value.slice(-1);
      return newOtp;
    });

    // Clear any previous error when user starts typing
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace - move to previous input if current is empty
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      // Handle Enter key to submit
      if (e.key === "Enter") {
        const otpString = otp.join("");
        if (otpString.length === 6) {
          handleVerify();
        }
      }
    },
    [otp]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedData) return;

    const newOtp = ["", "", "", "", "", ""];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    setError("");

    // Focus appropriate input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  }, []);

  const handleVerify = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    if (!email) {
      setError("Email address is missing. Please try registering again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await apiClient.post("/auth/verify-email", {
        email: email,
        code: otpString,
      });

      // Handle successful verification
      if (response.data) {
        setSuccess(true);
        setSuccessMessage(
          response.data.message ||
            "Email verified successfully! Redirecting to login..."
        );

        // Wait 2 seconds to show success message, then redirect
        setTimeout(() => {
          onVerifySuccess();
        }, 2000);
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);

      // Extract error message from various response formats
      let errorMessage = "Invalid OTP. Please try again.";

      if (err?.response?.data) {
        const data = err.response.data;
        if (typeof data.message === "string") {
          errorMessage = data.message;
        } else if (typeof data.error === "string") {
          errorMessage = data.error;
        } else if (data.error?.message) {
          errorMessage = data.error.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);

      // Clear OTP fields on error so user can retry
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setResendLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/resend-otp", { email });
      setResendCooldown(60); // 60 second cooldown
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      console.error("Resend OTP error:", err);

      let errorMessage = "Failed to resend OTP. Please try again.";
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        // Intentionally do nothing on backdrop click for OTP so users don't accidentally
        // close the modal when switching tabs to check their email for the code.
        // Only the X button should trigger onClose.
      }}
    >
      <div
        className={`w-full max-w-md p-6 sm:p-8 rounded-2xl border shadow-2xl transform transition-all ${
          darkMode ? "bg-[#071219] border-white/10" : "bg-white border-gray-200"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-bold ${
              darkMode ? "text-white" : "text-[#2596be]"
            }`}
          >
            Verify Your Email
          </h2>
          {!success && !loading && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
              aria-label="Close modal"
            >
              <X
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              />
            </button>
          )}
        </div>

        {/* Description */}
        <p
          className={`text-sm mb-6 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          We've sent a 6-digit verification code to{" "}
          <span
            className={`font-semibold ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {email}
          </span>
          . Please enter it below.
        </p>

        {/* Success Message */}
        {success && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
              darkMode
                ? "bg-green-500/10 border border-green-500/30"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <CheckCircle
              className={`w-6 h-6 shrink-0 ${
                darkMode ? "text-green-400" : "text-green-600"
              }`}
            />
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-green-400" : "text-green-700"
              }`}
            >
              {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && !success && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${
              darkMode
                ? "bg-red-500/10 border border-red-500/30"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <AlertCircle
              className={`w-6 h-6 shrink-0 ${
                darkMode ? "text-red-400" : "text-red-600"
              }`}
            />
            <p
              className={`text-sm ${
                darkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              {error}
            </p>
          </div>
        )}

        {/* OTP Input Fields */}
        <div className="flex gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading || success}
              className={`w-full h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none ${
                darkMode
                  ? "bg-white/5 border-white/20 text-white focus:border-[#2596be] focus:bg-white/10 disabled:opacity-50"
                  : "bg-white border-gray-200 text-gray-900 focus:border-[#2596be] focus:bg-blue-50/50 disabled:opacity-50"
              } ${
                digit
                  ? darkMode
                    ? "border-[#2596be]/50"
                    : "border-[#2596be]/30"
                  : ""
              }`}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.some((d) => !d) || success}
          className={`w-full py-3.5 px-4 font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
            success
              ? "bg-green-500 text-white cursor-default"
              : "bg-[#2596be] text-white hover:bg-[#1e7ca0] disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : success ? (
            <>
              <CheckCircle className="w-5 h-5" />
              Verified!
            </>
          ) : (
            "Verify Email"
          )}
        </button>

        {/* Resend OTP */}
        {!success && (
          <div className="mt-6 text-center">
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Didn't receive the code?{" "}
            </span>
            <button
              onClick={handleResend}
              disabled={resendLoading || resendCooldown > 0}
              className={`text-sm font-semibold transition-colors disabled:opacity-50 ${
                darkMode
                  ? "text-[#60DFFF] hover:text-[#2596be]"
                  : "text-[#2596be] hover:text-[#1e7ca0]"
              }`}
            >
              {resendLoading
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Code"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
