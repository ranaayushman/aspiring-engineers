export type FreelanceDomain =
  | "frontend"
  | "backend"
  | "full-stack"
  | "technical-writer"
  | "graphic-designer"
  | "social-media-manager"
  | "video-editor"
  | "ui-ux-designer"
  | "app-developer"
  | "devops"
  | "data-scientist"
  | "qa-engineer";

export type FreelanceWorkMode = "remote" | "hybrid" | "onsite";

export type FreelanceStatus =
  | "submitted"
  | "under-review"
  | "verified"
  | "rejected"
  | "contacted"
  | "archived";

export interface CreateFreelanceProfilePayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  domain: FreelanceDomain;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  cvFileBase64: string;
  yearsOfExperience?: number;
  skills?: string[];
  expectedHourlyRate?: number;
  availableHoursPerDay?: number;
  availableDaysPerWeek?: number;
  preferredWorkMode?: FreelanceWorkMode;
  availabilityNotes?: string;
}

export interface UpdateFreelanceProfileStatusPayload {
  status: FreelanceStatus;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ContactFreelancerPayload {
  contactMessage: string;
  internalNotes?: string;
}

export interface FreelanceProfile {
  _id: string;
  userId?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  domain: FreelanceDomain;
  status: FreelanceStatus;
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  cvFileBase64?: string;
  cvUrl?: string;
  yearsOfExperience?: number;
  skills?: string[];
  expectedHourlyRate?: number;
  availableHoursPerDay?: number;
  availableDaysPerWeek?: number;
  preferredWorkMode?: FreelanceWorkMode;
  availabilityNotes?: string;
  adminNotes?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface FreelanceProfilesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetAdminFreelanceProfilesQuery {
  status?: FreelanceStatus;
  domain?: FreelanceDomain;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FreelanceStatistics {
  totalProfiles: number;
  byStatus: Record<FreelanceStatus, number>;
  byDomain: Partial<Record<FreelanceDomain, number>>;
}
