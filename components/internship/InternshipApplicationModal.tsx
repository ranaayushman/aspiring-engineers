"use client";

import React, { useState } from "react";
import { X, CheckCircle, Send, GraduationCap } from "lucide-react";
import apiClient from "@/lib/api-client";
import { logger } from "@/lib/logger";

interface InternshipApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInternship: string;
}

const yearOptions = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Graduated",
];
const branchOptions = [
  "Computer Science & Engineering (CSE)",
  "Electronics & Communication (ECE)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Electrical Engineering (EE)",
  "Information Technology (IT)",
  "Other",
];

export default function InternshipApplicationModal({
  isOpen,
  onClose,
  selectedInternship,
}: InternshipApplicationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    college: "",
    fathersName: "",
    location: "",
    cgpa: "",
    year: "",
    branch: "",
    otherBranch: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        college: formData.college,
        fathersName: formData.fathersName,
        location: formData.location,
        cgpa: formData.cgpa,
        year: formData.year,
        branch:
          formData.branch === "Other" ? formData.otherBranch : formData.branch,
        internshipType: selectedInternship,
      };

      await apiClient.post("/internship/apply", payload);

      setIsSubmitting(false);
      setSubmitted(true);

      // Close after success
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: "",
          phone: "",
          college: "",
          fathersName: "",
          location: "",
          cgpa: "",
          year: "",
          branch: "",
          otherBranch: "",
        });
        onClose();
      }, 2000);
    } catch (error: any) {
      logger.error("Failed to submit internship application:", error);
      alert(
        error.response?.data?.message ||
          "Failed to submit application. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-linear-to-r from-[var(--color-brand)] to-[var(--color-brand-light)] bg-clip-text text-transparent mb-2">
              Apply for {selectedInternship} Internship
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Fill in your details to start your journey with us.
            </p>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We'll review your application and get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                    placeholder="Enter Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  College Name *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="college"
                    required
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                    placeholder="Enter your college name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Father's Name *
                  </label>
                  <input
                    type="text"
                    name="fathersName"
                    required
                    value={formData.fathersName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                    placeholder="Enter Father's Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location (City/State) *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                    placeholder="e.g., Kolkata, WB"
                  />
                </div>
              </div>

              {/* Academic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Year *
                  </label>
                  <select
                    name="year"
                    required
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                  >
                    <option value="">Select Year</option>
                    {yearOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Branch *
                  </label>
                  <select
                    name="branch"
                    required
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                  >
                    <option value="">Select Branch</option>
                    {branchOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.branch === "Other" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Specify Branch *
                  </label>
                  <input
                    type="text"
                    name="otherBranch"
                    required
                    value={formData.otherBranch}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                    placeholder="Enter your branch name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CGPA / Percentage *
                </label>
                <input
                  type="text"
                  name="cgpa"
                  required
                  value={formData.cgpa}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[var(--color-brand)] focus:border-transparent outline-hidden"
                  placeholder="e.g., 8.5 or 85%"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-brand)] text-white rounded-lg font-semibold hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[var(--color-brand)]/20"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
