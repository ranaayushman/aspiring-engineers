"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { X, CheckCircle } from "lucide-react";
import { isValidEmail } from "@/lib/utils/validators";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

export default function LoginModal({ isOpen, onClose, redirectPath }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const update = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      await login({ email, password }, redirectPath);
      onClose();
    } catch (err: any) {
      const errorMessage =
        err?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Content */}
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl transform transition-all ${
          darkMode ? "bg-[#071219] border border-white/10" : "bg-white"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2
              className={`text-2xl font-bold mb-2 ${
                darkMode ? "text-white" : "text-[#2596be]"
              }`}
            >
              Welcome Back
            </h2>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Sign in to continue to Admission Guidance
            </p>
          </div>

          {/* Error Message */}
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
            {/* Email */}
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors outline-hidden ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]"
                }`}
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className={`text-xs font-medium ${
                    darkMode
                      ? "text-[#60DFFF] hover:text-[#2596be]"
                      : "text-[#2596be] hover:text-[#1e7ca0]"
                  }`}
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-2.5 rounded-lg border transition-colors outline-hidden ${
                  darkMode
                    ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]"
                    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]"
                }`}
                placeholder="••••••••"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#2596be] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1e7ca0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Signing in..." : "Sign In & Continue"}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <span
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Don't have an account?{" "}
            </span>
            <Link
              href="/register"
              className={`text-sm font-semibold ${
                darkMode
                  ? "text-[#60DFFF] hover:text-[#2596be]"
                  : "text-[#2596be] hover:text-[#1e7ca0]"
              }`}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
