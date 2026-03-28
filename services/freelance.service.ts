import apiClient, { handleApiError } from "@/lib/api-client";
import { tokenManager } from "@/lib/utils/tokenManager";
import {
  ContactFreelancerPayload,
  CreateFreelanceProfilePayload,
  FreelanceProfile,
  FreelanceProfilesPagination,
  FreelanceStatistics,
  GetAdminFreelanceProfilesQuery,
  UpdateFreelanceProfileStatusPayload,
} from "@/types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedProfilesEnvelope {
  success: boolean;
  data: FreelanceProfile[];
  pagination: FreelanceProfilesPagination;
  message?: string;
}

const extractData = <T>(payload: ApiEnvelope<T> | T): T => {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in (payload as object) &&
    "data" in (payload as object)
  ) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = tokenManager.getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const freelanceService = {
  createFreelanceProfile: async (
    payload: CreateFreelanceProfilePayload,
  ): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.post<ApiEnvelope<FreelanceProfile>>(
        "/freelance/create",
        payload,
        {
          headers: getAuthHeaders(),
        },
      );
      return extractData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getMyFreelanceProfile: async (): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.get<ApiEnvelope<FreelanceProfile>>(
        "/freelance/my-profile",
      );
      return extractData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateFreelanceProfile: async (
    payload: CreateFreelanceProfilePayload,
  ): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.patch<ApiEnvelope<FreelanceProfile>>(
        "/freelance/update",
        payload,
      );
      return extractData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAdminFreelanceProfiles: async (
    query?: GetAdminFreelanceProfilesQuery,
  ): Promise<{
    data: FreelanceProfile[];
    pagination: FreelanceProfilesPagination;
  }> => {
    try {
      const response = await apiClient.get<PaginatedProfilesEnvelope>(
        "/freelance/admin/all",
        {
          params: query,
        },
      );

      const fallbackPagination: FreelanceProfilesPagination = {
        page: query?.page || 1,
        limit: query?.limit || 10,
        total: response.data.data.length,
        totalPages: 1,
      };

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || fallbackPagination,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getAdminFreelanceProfileById: async (id: string): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.get<ApiEnvelope<FreelanceProfile>>(
        `/freelance/admin/${id}`,
      );
      return extractData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  updateAdminFreelanceStatus: async (
    id: string,
    payload: UpdateFreelanceProfileStatusPayload,
  ): Promise<FreelanceProfile> => {
    try {
      const response = await apiClient.patch<ApiEnvelope<FreelanceProfile>>(
        `/freelance/admin/${id}/status`,
        payload,
      );
      return extractData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  contactFreelancer: async (
    id: string,
    payload: ContactFreelancerPayload,
  ): Promise<{ message?: string }> => {
    try {
      const response = await apiClient.post<ApiEnvelope<{ message?: string }>>(
        `/freelance/admin/${id}/contact`,
        payload,
      );

      return extractData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  archiveFreelanceProfile: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/freelance/admin/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  getFreelanceStatistics: async (): Promise<FreelanceStatistics> => {
    try {
      const response = await apiClient.get<ApiEnvelope<FreelanceStatistics>>(
        "/freelance/admin/statistics",
      );
      return extractData(response.data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default freelanceService;
