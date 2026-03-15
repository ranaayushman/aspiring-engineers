"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { isValidEmail, isValidPassword } from "@/lib/utils/validators";
import { ExamType } from "@/types";
import OTPModal from "@/components/OTPModal";
import * as analytics from "@/lib/analytics";
import { Eye, EyeOff } from "lucide-react";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    targetYear: new Date().getFullYear() + 1,
  });
  const [examTargets, setExamTargets] = useState<ExamType[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");

  useEffect(() => {
    setMounted(true);
  }, []);

  const darkMode = mounted && resolvedTheme === "dark";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!isValidPassword(formData.password)) {
      setError(
        "Password must be at least 8 characters with uppercase, lowercase, and number",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate phone number with libphonenumber-js
    if (!formData.phone) {
      setError("Please enter a phone number");
      return;
    }

    // Combine country code with phone number
    const fullPhoneNumber = `${countryCode}${formData.phone.replace(/^\+/, "")}`;

    if (!isValidPhoneNumber(fullPhoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    if (!formData.dateOfBirth) {
      setError("Please enter your date of birth");
      return;
    }

    if (examTargets.length === 0) {
      setError("Please select at least one exam target");
      return;
    }

    try {
      setLoading(true);

      // Normalize phone number to E.164 format before submission
      const fullPhoneNumber = `${countryCode}${formData.phone.replace(/^\+/, "")}`;
      const phoneNumber = parsePhoneNumber(fullPhoneNumber);
      const normalizedPhone = phoneNumber.format("E.164");

      const { confirmPassword, ...registrationData } = formData;
      await register({
        ...registrationData,
        phone: normalizedPhone, // Use normalized phone number
        examTargets,
      });
      analytics.event("signup_success", "conversion", "user_signup");
      // Registration successful - show OTP modal for email verification
      setShowOTPModal(true);
    } catch (err: any) {
      const errorMessage =
        err?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerifySuccess = () => {
    setShowOTPModal(false);
    // Redirect to login page after successful verification
    router.push("/login?verified=true");
  };

  const handleOTPClose = () => {
    // Allow user to close but warn them
    setShowOTPModal(false);
    setError(
      "Please verify your email to complete registration. Check your inbox for the verification code.",
    );
  };

  const toggleExam = (exam: ExamType) => {
    setExamTargets((prev) =>
      prev.includes(exam) ? prev.filter((e) => e !== exam) : [...prev, exam],
    );
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
        darkMode ? "bg-[var(--color-dark-bg)]" : "bg-gray-50"
      }`}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl transition-all ${
            darkMode
              ? "bg-[var(--color-brand)]/10"
              : "bg-[var(--color-brand)]/20"
          }`}
        />
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl transition-all ${
            darkMode
              ? "bg-[var(--color-brand-accent)]/15"
              : "bg-[var(--color-brand-accent)]/25"
          }`}
        />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div
          className={`p-6 sm:p-8 rounded-2xl border backdrop-blur-2xl shadow-2xl ${
            darkMode
              ? "bg-white/5 border-white/10"
              : "bg-white/90 border-gray-200"
          }`}
        >
          <div className="text-center mb-6 sm:mb-8">
            <Link href="/" className="inline-block mb-4">
              <span className="font-clash text-3xl font-bold text-[var(--color-brand)]">
                AE
              </span>
            </Link>
            <h1
              className={`text-2xl sm:text-3xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-[var(--color-brand)]"
              }`}
            >
              Create Account
            </h1>
            <p
              className={`text-sm sm:text-base ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Join thousands preparing for competitive exams
            </p>
          </div>

          {error && (
            <div
              className={`p-3 rounded-lg mb-4 ${
                darkMode
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-sm ${
                  darkMode ? "text-red-400" : "text-red-600"
                }`}
              >
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email - 2 column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                  }`}
                  placeholder="Enter Full Name"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                  }`}
                  placeholder="Enter Email Address"
                />
              </div>
            </div>

            {/* Password and Confirm Password - 2 column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                    }`}
                    placeholder="Enter Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-white/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors ${
                      darkMode
                        ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                    }`}
                    placeholder="Enter Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-gray-300 hover:bg-white/5"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Number - Full width */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Phone Number *
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className={`px-3 py-3 rounded-lg border transition-colors w-[110px] ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-white focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                      : "bg-white border-gray-200 text-gray-900 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                  }`}
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+86">🇨🇳 +86</option>
                  <option value="+81">🇯🇵 +81</option>
                  <option value="+82">🇰🇷 +82</option>
                  <option value="+65">🇸🇬 +65</option>
                  <option value="+971">🇦🇪 +971</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+49">🇩🇪 +49</option>
                  <option value="+33">🇫🇷 +33</option>
                  <option value="+39">🇮🇹 +39</option>
                  <option value="+34">🇪🇸 +34</option>
                  <option value="+7">🇷🇺 +7</option>
                  <option value="+55">🇧🇷 +55</option>
                  <option value="+27">🇿🇦 +27</option>
                  <option value="+234">🇳🇬 +234</option>
                  <option value="+20">🇪🇬 +20</option>
                  <option value="+60">🇲🇾 +60</option>
                  <option value="+62">🇮🇩 +62</option>
                  <option value="+63">🇵🇭 +63</option>
                  <option value="+84">🇻🇳 +84</option>
                  <option value="+66">🇹🇭 +66</option>
                  <option value="+880">🇧🇩 +880</option>
                  <option value="+92">🇵🇰 +92</option>
                  <option value="+94">🇱🇰 +94</option>
                  <option value="+977">🇳🇵 +977</option>
                </select>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // Remove any non-digit characters
                    const value = e.target.value.replace(/[^\d]/g, "");
                    setFormData({ ...formData, phone: value });
                  }}
                  required
                  className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                  }`}
                  placeholder="9876543210"
                />
              </div>
              {formData.phone && (
                <p
                  className={`text-xs mt-1.5 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  Complete number: {countryCode} {formData.phone}
                </p>
              )}
            </div>

            {/* Date of Birth and Target Year - 2 column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({ ...formData, dateOfBirth: e.target.value })
                  }
                  required
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Target Year *
                </label>
                <input
                  type="number"
                  value={formData.targetYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetYear: parseInt(e.target.value),
                    })
                  }
                  required
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 5}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                    darkMode
                      ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                  }`}
                  placeholder="Enter Target Year"
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Target Exams *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  ExamType.JEE_MAIN,
                  ExamType.JEE_ADVANCED,
                  ExamType.NEET,
                  ExamType.WBJEE,
                  ExamType.BITSAT,
                  ExamType.COMEDK,
                ].map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => toggleExam(exam)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      examTargets.includes(exam)
                        ? darkMode
                          ? "bg-[var(--color-brand)]/20 text-[var(--color-brand-light)] border-2 border-[var(--color-brand)]"
                          : "bg-[var(--color-brand)]/10 text-[var(--color-brand)] border-2 border-[var(--color-brand)]"
                        : darkMode
                          ? "bg-white/5 text-gray-400 border-2 border-white/10 hover:bg-white/10"
                          : "bg-gray-100 text-gray-600 border-2 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {exam.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[var(--color-brand)] text-white font-semibold rounded-lg shadow-lg hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className={`text-sm font-semibold ${
                darkMode
                  ? "text-[var(--color-brand-light)] hover:text-[var(--color-brand)]"
                  : "text-[var(--color-brand)] hover:text-[var(--color-brand-hover)]"
              }`}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={handleOTPClose}
        onVerifySuccess={handleOTPVerifySuccess}
        email={formData.email}
      />
    </div>
  );
}
