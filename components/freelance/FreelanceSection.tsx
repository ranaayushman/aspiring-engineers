"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileText, Loader2, Pencil, Search, Upload, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import freelanceService from "@/services/freelance.service";
import {
  CreateFreelanceProfilePayload,
  FreelanceDomain,
  FreelanceProfile,
  FreelanceStatus,
  FreelanceWorkMode,
} from "@/types";

const FREELANCE_DOMAINS: Array<{ value: FreelanceDomain; label: string }> = [
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "full-stack", label: "Full Stack" },
  { value: "technical-writer", label: "Technical Writer" },
  { value: "graphic-designer", label: "Graphic Designer" },
  { value: "social-media-manager", label: "Social Media Manager" },
  { value: "video-editor", label: "Video Editor" },
  { value: "ui-ux-designer", label: "UI/UX Designer" },
  { value: "app-developer", label: "App Developer" },
  { value: "devops", label: "DevOps" },
  { value: "data-scientist", label: "Data Scientist" },
  { value: "qa-engineer", label: "QA Engineer" },
];

const FREELANCE_WORK_MODES: Array<{ value: FreelanceWorkMode; label: string }> = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

type TabKey = "apply" | "my-profile" | "edit";

const emptyForm: CreateFreelanceProfilePayload = {
  fullName: "",
  email: "",
  phoneNumber: "",
  bio: "",
  domain: "frontend",
  portfolioUrl: "",
  githubUrl: "",
  linkedinUrl: "",
  cvFileBase64: "",
  yearsOfExperience: undefined,
  skills: [],
  expectedHourlyRate: undefined,
  availableHoursPerDay: undefined,
  availableDaysPerWeek: undefined,
  preferredWorkMode: "remote",
  availabilityNotes: "",
};

const statusStyles: Record<FreelanceStatus, string> = {
  submitted:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  "under-review":
    "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  verified:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
  rejected:
    "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border-rose-200 dark:border-rose-500/30",
  contacted:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border-violet-200 dark:border-violet-500/30",
  archived:
    "bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300 border-gray-200 dark:border-gray-500/30",
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

const statusLabel = (status: FreelanceStatus): string => {
  if (status === "under-review") return "Under Review";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatDate = (value?: string): string => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString();
};

const normalizeSkills = (skillsInput: string): string[] => {
  return skillsInput
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
};

const isValidUrl = (value: string): boolean => {
  if (!value.trim()) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const buildValidationErrors = (
  payload: CreateFreelanceProfilePayload,
): string[] => {
  const errors: string[] = [];

  if (payload.fullName.trim().length < 2 || payload.fullName.trim().length > 100) {
    errors.push("Full name must be between 2 and 100 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.push("Please provide a valid email address.");
  }

  if (!payload.phoneNumber.trim()) {
    errors.push("Phone number is required.");
  }

  if (payload.bio.trim().length < 20 || payload.bio.trim().length > 1000) {
    errors.push("Bio must be between 20 and 1000 characters.");
  }

  if (!payload.cvFileBase64.trim()) {
    errors.push("CV PDF upload is required.");
  }

  if (payload.yearsOfExperience !== undefined && payload.yearsOfExperience > 70) {
    errors.push("Years of experience must be 70 or less.");
  }

  if (payload.expectedHourlyRate !== undefined && payload.expectedHourlyRate <= 0) {
    errors.push("Expected hourly rate must be greater than 0.");
  }

  if (
    payload.availableHoursPerDay !== undefined &&
    (payload.availableHoursPerDay < 1 || payload.availableHoursPerDay > 24)
  ) {
    errors.push("Available hours per day must be between 1 and 24.");
  }

  if (
    payload.availableDaysPerWeek !== undefined &&
    (payload.availableDaysPerWeek < 1 || payload.availableDaysPerWeek > 7)
  ) {
    errors.push("Available days per week must be between 1 and 7.");
  }

  if (!isValidUrl(payload.portfolioUrl || "")) {
    errors.push("Portfolio URL must be a valid URL.");
  }

  if (!isValidUrl(payload.githubUrl || "")) {
    errors.push("GitHub URL must be a valid URL.");
  }

  if (!isValidUrl(payload.linkedinUrl || "")) {
    errors.push("LinkedIn URL must be a valid URL.");
  }

  return errors;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Unable to read CV file."));
        return;
      }

      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Failed to convert CV file."));
    reader.readAsDataURL(file);
  });
};

export default function FreelanceSection() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("apply");

  const [applyForm, setApplyForm] =
    useState<CreateFreelanceProfilePayload>(emptyForm);
  const [applySkillsInput, setApplySkillsInput] = useState("");
  const [applyCvName, setApplyCvName] = useState("");
  const [applyCvPreviewUrl, setApplyCvPreviewUrl] = useState("");
  const [applyCvUploading, setApplyCvUploading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState("");
  const [applyError, setApplyError] = useState("");
  const [applyValidationErrors, setApplyValidationErrors] = useState<string[]>(
    [],
  );

  const [myProfile, setMyProfile] = useState<FreelanceProfile | null>(null);
  const [myProfileLoading, setMyProfileLoading] = useState(false);
  const [myProfileError, setMyProfileError] = useState("");

  const [editForm, setEditForm] = useState<CreateFreelanceProfilePayload>(
    emptyForm,
  );
  const [editSkillsInput, setEditSkillsInput] = useState("");
  const [editCvName, setEditCvName] = useState("");
  const [editCvPreviewUrl, setEditCvPreviewUrl] = useState("");
  const [editCvUploading, setEditCvUploading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editValidationErrors, setEditValidationErrors] = useState<string[]>(
    [],
  );

  const applyCvInputRef = useRef<HTMLInputElement | null>(null);
  const editCvInputRef = useRef<HTMLInputElement | null>(null);
  const applyMessageRef = useRef<HTMLDivElement | null>(null);
  const editMessageRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!user) return;

    setApplyForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || "",
      email: prev.email || user.email || "",
      phoneNumber: prev.phoneNumber || user.phone || "",
    }));

    setEditForm((prev) => ({
      ...prev,
      fullName: prev.fullName || user.name || "",
      email: prev.email || user.email || "",
      phoneNumber: prev.phoneNumber || user.phone || "",
    }));
  }, [user]);

  const ensureAuthenticated = useCallback((): boolean => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/internship");
      return false;
    }
    return true;
  }, [isAuthenticated, router]);

  const loadMyProfile = useCallback(async () => {
    if (!ensureAuthenticated()) return;

    setMyProfileLoading(true);
    setMyProfileError("");

    try {
      const profile = await freelanceService.getMyFreelanceProfile();
      setMyProfile(profile);

      setEditForm({
        fullName: profile.fullName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        bio: profile.bio || "",
        domain: profile.domain,
        portfolioUrl: (profile.portfolioUrl as string) || "",
        githubUrl: (profile.githubUrl as string) || "",
        linkedinUrl: (profile.linkedinUrl as string) || "",
        cvFileBase64: "",
        yearsOfExperience:
          typeof profile.yearsOfExperience === "number"
            ? profile.yearsOfExperience
            : undefined,
        skills: (profile.skills as string[]) || [],
        expectedHourlyRate:
          typeof profile.expectedHourlyRate === "number"
            ? profile.expectedHourlyRate
            : undefined,
        availableHoursPerDay:
          typeof profile.availableHoursPerDay === "number"
            ? profile.availableHoursPerDay
            : undefined,
        availableDaysPerWeek:
          typeof profile.availableDaysPerWeek === "number"
            ? profile.availableDaysPerWeek
            : undefined,
        preferredWorkMode:
          profile.preferredWorkMode === "remote" ||
          profile.preferredWorkMode === "hybrid" ||
          profile.preferredWorkMode === "onsite"
            ? profile.preferredWorkMode
            : "remote",
        availabilityNotes: (profile.availabilityNotes as string) || "",
      });

      setEditSkillsInput(
        Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
      );
    } catch (error) {
      setMyProfileError(toErrorMessage(error));
    } finally {
      setMyProfileLoading(false);
    }
  }, [ensureAuthenticated]);

  useEffect(() => {
    if (activeTab === "my-profile" || activeTab === "edit") {
      loadMyProfile();
    }
  }, [activeTab, loadMyProfile]);

  const onApplyInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    if (
      name === "yearsOfExperience" ||
      name === "expectedHourlyRate" ||
      name === "availableHoursPerDay" ||
      name === "availableDaysPerWeek"
    ) {
      setApplyForm((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
      return;
    }

    setApplyForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onEditInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;

    if (
      name === "yearsOfExperience" ||
      name === "expectedHourlyRate" ||
      name === "availableHoursPerDay" ||
      name === "availableDaysPerWeek"
    ) {
      setEditForm((prev) => ({
        ...prev,
        [name]: value ? Number(value) : undefined,
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onCvSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
    mode: "apply" | "edit",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      if (mode === "apply") setApplyError("Only PDF files are supported.");
      if (mode === "edit") setEditError("Only PDF files are supported.");
      return;
    }

    try {
      if (mode === "apply") setApplyCvUploading(true);
      if (mode === "edit") setEditCvUploading(true);

      const base64 = await fileToBase64(file);
      const previewUrl = `data:application/pdf;base64,${base64}`;

      if (mode === "apply") {
        setApplyCvName(file.name);
        setApplyForm((prev) => ({ ...prev, cvFileBase64: base64 }));
        setApplyCvPreviewUrl(previewUrl);
        setApplyError("");
      }

      if (mode === "edit") {
        setEditCvName(file.name);
        setEditForm((prev) => ({ ...prev, cvFileBase64: base64 }));
        setEditCvPreviewUrl(previewUrl);
        setEditError("");
      }
    } catch (error) {
      const message = toErrorMessage(error);
      if (mode === "apply") setApplyError(message);
      if (mode === "edit") setEditError(message);
    } finally {
      if (mode === "apply") setApplyCvUploading(false);
      if (mode === "edit") setEditCvUploading(false);
    }
  };

  const submitApply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ensureAuthenticated()) {
      setApplyError("Please login to submit your freelance profile.");
      return;
    }

    setApplyLoading(true);
    setApplySuccess("");
    setApplyError("");

    const payload: CreateFreelanceProfilePayload = {
      ...applyForm,
      fullName: applyForm.fullName.trim(),
      email: applyForm.email.trim(),
      phoneNumber: applyForm.phoneNumber.trim(),
      bio: applyForm.bio.trim(),
      portfolioUrl: applyForm.portfolioUrl?.trim() || undefined,
      githubUrl: applyForm.githubUrl?.trim() || undefined,
      linkedinUrl: applyForm.linkedinUrl?.trim() || undefined,
      availabilityNotes: applyForm.availabilityNotes?.trim() || undefined,
      skills: normalizeSkills(applySkillsInput),
    };

    const validationErrors = buildValidationErrors(payload);
    setApplyValidationErrors(validationErrors);

    if (validationErrors.length > 0) {
      setApplyError("Please fix the highlighted validation errors and try again.");
      requestAnimationFrame(() => {
        applyMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      setApplyLoading(false);
      return;
    }

    try {
      const profile = await freelanceService.createFreelanceProfile(payload);
      setApplySuccess("Freelance profile submitted successfully.");
      setMyProfile(profile);
      setApplyForm(emptyForm);
      setApplySkillsInput("");
      setApplyCvName("");
      setApplyCvPreviewUrl("");
    } catch (error) {
      setApplyError(toErrorMessage(error));
    } finally {
      setApplyLoading(false);
    }
  };

  const submitEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ensureAuthenticated()) {
      setEditError("Please login to update your freelance profile.");
      return;
    }

    setEditLoading(true);
    setEditSuccess("");
    setEditError("");

    const payload: CreateFreelanceProfilePayload = {
      ...editForm,
      fullName: editForm.fullName.trim(),
      email: editForm.email.trim(),
      phoneNumber: editForm.phoneNumber.trim(),
      bio: editForm.bio.trim(),
      portfolioUrl: editForm.portfolioUrl?.trim() || undefined,
      githubUrl: editForm.githubUrl?.trim() || undefined,
      linkedinUrl: editForm.linkedinUrl?.trim() || undefined,
      availabilityNotes: editForm.availabilityNotes?.trim() || undefined,
      skills: normalizeSkills(editSkillsInput),
    };

    const validationErrors = buildValidationErrors(payload);
    setEditValidationErrors(validationErrors);

    if (validationErrors.length > 0) {
      setEditError("Please fix the highlighted validation errors and try again.");
      requestAnimationFrame(() => {
        editMessageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      setEditLoading(false);
      return;
    }

    try {
      const updated = await freelanceService.updateFreelanceProfile(payload);
      setMyProfile(updated);
      setEditSuccess("Freelance profile updated successfully.");
    } catch (error) {
      setEditError(toErrorMessage(error));
    } finally {
      setEditLoading(false);
    }
  };

  const renderAlert = (type: "error" | "success", message: string) => {
    if (!message) return null;

    const baseClass =
      type === "error"
        ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-300"
        : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300";

    return <div className={`rounded-lg border p-3 text-sm ${baseClass}`}>{message}</div>;
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto">
        <div
          className={`rounded-2xl border p-6 md:p-8 backdrop-blur-2xl ${
            darkMode
              ? "bg-white/5 border-white/10"
              : "bg-white/80 border-gray-200 shadow-lg"
          }`}
        >
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-(--color-brand) to-(--color-brand-accent)">
              Freelance Opportunities
            </h2>
            <p className={`mt-3 text-base ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Submit your freelance profile, track your application status, and
              keep your profile updated.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { key: "apply", label: "Apply", icon: FileText },
              { key: "my-profile", label: "My Profile", icon: UserCircle },
              { key: "edit", label: "Edit Profile", icon: Pencil },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    active
                      ? "bg-(--color-brand) text-white border-(--color-brand)"
                      : darkMode
                        ? "border-white/10 text-gray-300 hover:bg-white/5"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "apply" && (
            <form onSubmit={submitApply} className="space-y-4">
              <div ref={applyMessageRef} />
              {renderAlert("success", applySuccess)}
              {renderAlert("error", applyError)}

              {applyValidationErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                  {applyValidationErrors.map((error) => (
                    <div key={error}>- {error}</div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  value={applyForm.fullName}
                  onChange={onApplyInputChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="email"
                  type="email"
                  value={applyForm.email}
                  onChange={onApplyInputChange}
                  placeholder="Email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="phoneNumber"
                  value={applyForm.phoneNumber}
                  onChange={onApplyInputChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <select
                  name="domain"
                  value={applyForm.domain}
                  onChange={onApplyInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {FREELANCE_DOMAINS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                name="bio"
                value={applyForm.bio}
                onChange={onApplyInputChange}
                rows={5}
                placeholder="Write a short bio (20-1000 chars)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  name="portfolioUrl"
                  value={applyForm.portfolioUrl || ""}
                  onChange={onApplyInputChange}
                  placeholder="Portfolio URL (optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="githubUrl"
                  value={applyForm.githubUrl || ""}
                  onChange={onApplyInputChange}
                  placeholder="GitHub URL (optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="linkedinUrl"
                  value={applyForm.linkedinUrl || ""}
                  onChange={onApplyInputChange}
                  placeholder="LinkedIn URL (optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="yearsOfExperience"
                  min={0}
                  max={70}
                  value={applyForm.yearsOfExperience ?? ""}
                  onChange={onApplyInputChange}
                  placeholder="Years of Experience (optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  name="expectedHourlyRate"
                  min={1}
                  value={applyForm.expectedHourlyRate ?? ""}
                  onChange={onApplyInputChange}
                  placeholder="Expected Hourly Rate (INR, optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  name="availableHoursPerDay"
                  min={1}
                  max={24}
                  value={applyForm.availableHoursPerDay ?? ""}
                  onChange={onApplyInputChange}
                  placeholder="Available Hours Per Day (optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  name="availableDaysPerWeek"
                  min={1}
                  max={7}
                  value={applyForm.availableDaysPerWeek ?? ""}
                  onChange={onApplyInputChange}
                  placeholder="Available Days Per Week (optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <select
                  name="preferredWorkMode"
                  value={applyForm.preferredWorkMode || "remote"}
                  onChange={onApplyInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {FREELANCE_WORK_MODES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  value={applySkillsInput}
                  onChange={(event) => setApplySkillsInput(event.target.value)}
                  placeholder="Skills (comma separated, optional)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <textarea
                name="availabilityNotes"
                value={applyForm.availabilityNotes || ""}
                onChange={onApplyInputChange}
                rows={3}
                placeholder="Availability Notes (optional)"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />

              <div className="space-y-3">
                <label
                  className={`block text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  CV PDF Upload
                </label>
                <input
                  ref={applyCvInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => onCvSelected(event, "apply")}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => applyCvInputRef.current?.click()}
                  disabled={applyCvUploading}
                  className="inline-flex mt-1 items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                >
                  {applyCvUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading CV...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Choose CV PDF
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload your CV in PDF format.
                </p>
                {applyCvName && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-300">
                    Selected: {applyCvName}
                  </p>
                )}

                {applyCvPreviewUrl && (
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden mt-3">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        CV Preview
                      </p>
                      <a
                        href={applyCvPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-(--color-brand)"
                      >
                        Open
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <iframe
                      title="Apply CV Preview"
                      src={applyCvPreviewUrl}
                      className="w-full h-72 bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={applyLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-(--color-brand) text-white font-semibold hover:bg-(--color-brand-hover) disabled:opacity-60"
              >
                {applyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit Freelance Profile"
                )}
              </button>
            </form>
          )}

          {activeTab === "my-profile" && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={loadMyProfile}
                  disabled={myProfileLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-(--color-brand) text-white text-sm font-semibold disabled:opacity-60"
                >
                  {myProfileLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Refresh Profile
                </button>
              </div>

              {renderAlert("error", myProfileError)}

              {!myProfileLoading && !myProfile && !myProfileError && (
                <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6 text-sm text-gray-600 dark:text-gray-400">
                  No profile found yet. Submit one from the Apply tab.
                </div>
              )}

              {myProfile && (
                <div className="rounded-xl border border-gray-200 dark:border-white/10 p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-bold">{myProfile.fullName}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[myProfile.status]}`}
                    >
                      {statusLabel(myProfile.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>Email: {myProfile.email}</div>
                    <div>Phone: {myProfile.phoneNumber}</div>
                    <div>Domain: {myProfile.domain}</div>
                    <div>Experience: {myProfile.yearsOfExperience ?? "-"} years</div>
                    <div>Expected Rate: {myProfile.expectedHourlyRate ?? "-"} INR/hr</div>
                    <div>Availability: {myProfile.availableHoursPerDay ?? "-"} hrs/day</div>
                    <div>Days/Week: {myProfile.availableDaysPerWeek ?? "-"}</div>
                    <div>Work Mode: {myProfile.preferredWorkMode ?? "-"}</div>
                    <div>Created: {formatDate(myProfile.createdAt)}</div>
                    <div>Updated: {formatDate(myProfile.updatedAt)}</div>
                  </div>

                  <div className="text-sm">
                    <p className="font-semibold mb-1">Bio</p>
                    <p className={darkMode ? "text-gray-300" : "text-gray-700"}>{myProfile.bio}</p>
                  </div>

                  {Array.isArray(myProfile.skills) && myProfile.skills.length > 0 && (
                    <div className="text-sm">
                      <p className="font-semibold mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {myProfile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-gray-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {myProfile.availabilityNotes && (
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Availability Notes</p>
                      <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                        {myProfile.availabilityNotes}
                      </p>
                    </div>
                  )}

                  {(myProfile.cvUrl || myProfile.cvFileBase64) && (
                    <a
                      href={
                        typeof myProfile.cvUrl === "string"
                          ? myProfile.cvUrl
                          : `data:application/pdf;base64,${myProfile.cvFileBase64}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-(--color-brand)"
                    >
                      <FileText className="w-4 h-4" />
                      View CV
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "edit" && (
            <form onSubmit={submitEdit} className="space-y-4">
              <div ref={editMessageRef} />
              {renderAlert("success", editSuccess)}
              {renderAlert("error", editError)}

              {editValidationErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                  {editValidationErrors.map((error) => (
                    <div key={error}>- {error}</div>
                  ))}
                </div>
              )}

              {!myProfile && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                  Load your profile first from My Profile tab or refresh this tab.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  value={editForm.fullName}
                  onChange={onEditInputChange}
                  placeholder="Full Name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={onEditInputChange}
                  placeholder="Email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={onEditInputChange}
                  placeholder="Phone Number"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <select
                  name="domain"
                  value={editForm.domain}
                  onChange={onEditInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {FREELANCE_DOMAINS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                name="bio"
                value={editForm.bio}
                onChange={onEditInputChange}
                rows={5}
                placeholder="Write a short bio"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  name="portfolioUrl"
                  value={editForm.portfolioUrl || ""}
                  onChange={onEditInputChange}
                  placeholder="Portfolio URL"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="githubUrl"
                  value={editForm.githubUrl || ""}
                  onChange={onEditInputChange}
                  placeholder="GitHub URL"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  name="linkedinUrl"
                  value={editForm.linkedinUrl || ""}
                  onChange={onEditInputChange}
                  placeholder="LinkedIn URL"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  name="yearsOfExperience"
                  min={0}
                  max={70}
                  value={editForm.yearsOfExperience ?? ""}
                  onChange={onEditInputChange}
                  placeholder="Years of Experience"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  name="expectedHourlyRate"
                  min={1}
                  value={editForm.expectedHourlyRate ?? ""}
                  onChange={onEditInputChange}
                  placeholder="Expected Hourly Rate (INR)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  name="availableHoursPerDay"
                  min={1}
                  max={24}
                  value={editForm.availableHoursPerDay ?? ""}
                  onChange={onEditInputChange}
                  placeholder="Available Hours Per Day"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <input
                  type="number"
                  name="availableDaysPerWeek"
                  min={1}
                  max={7}
                  value={editForm.availableDaysPerWeek ?? ""}
                  onChange={onEditInputChange}
                  placeholder="Available Days Per Week"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
                <select
                  name="preferredWorkMode"
                  value={editForm.preferredWorkMode || "remote"}
                  onChange={onEditInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                >
                  {FREELANCE_WORK_MODES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  value={editSkillsInput}
                  onChange={(event) => setEditSkillsInput(event.target.value)}
                  placeholder="Skills (comma separated)"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              <textarea
                name="availabilityNotes"
                value={editForm.availabilityNotes || ""}
                onChange={onEditInputChange}
                rows={3}
                placeholder="Availability Notes"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              />

              <div className="space-y-3">
                <label
                  className={`block text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  CV PDF Upload (required for update)
                </label>
                <input
                  ref={editCvInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => onCvSelected(event, "edit")}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editCvInputRef.current?.click()}
                  disabled={editCvUploading}
                  className="inline-flex mt-1 items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
                >
                  {editCvUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading CV...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Choose CV PDF
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload your CV in PDF format.
                </p>
                {editCvName && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-300">
                    Selected: {editCvName}
                  </p>
                )}

                {editCvPreviewUrl && (
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden mt-3">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-white/10">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        CV Preview
                      </p>
                      <a
                        href={editCvPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-(--color-brand)"
                      >
                        Open
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <iframe
                      title="Edit CV Preview"
                      src={editCvPreviewUrl}
                      className="w-full h-72 bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={editLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-(--color-brand) text-white font-semibold hover:bg-(--color-brand-hover) disabled:opacity-60"
              >
                {editLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating
                  </>
                ) : (
                  "Update Freelance Profile"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
