import { api, type ApiResponse } from "./client";
import type { FamilyMemberRecord } from "@/types";

export interface FamilyMemberCreate {
  patientId: string;
  name: string;
  relation: string;
  nickname?: string;
  active?: boolean;
}

export interface FamilyMemberUpdate {
  name?: string;
  relation?: string;
  nickname?: string;
  active?: boolean;
}

export const familyApi = {
  /**
   * Create a new family member on the backend
   */
  createFamilyMember: (data: FamilyMemberCreate): Promise<ApiResponse<FamilyMemberRecord>> =>
    api.post<FamilyMemberRecord>("/family-members", data),

  /**
   * Get all family members for a patient from backend
   */
  getFamilyMembers: (patientId: string): Promise<ApiResponse<FamilyMemberRecord[]>> =>
    api.get<FamilyMemberRecord[]>(`/patients/${patientId}/family-members`),

  /**
   * Update a family member on the backend
   */
  updateFamilyMember: (id: string, data: FamilyMemberUpdate): Promise<ApiResponse<FamilyMemberRecord>> =>
    api.patch<FamilyMemberRecord>(`/family-members/${id}`, data),

  /**
   * Delete a family member from the backend
   */
  deleteFamilyMember: (id: string): Promise<ApiResponse<{ status: string }>> =>
    api.delete<{ status: string }>(`/family-members/${id}`),

  /**
   * Upload a photo for a family member
   */
  uploadPhoto: (id: string, file: File): Promise<ApiResponse<{ status: string, photoId: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.uploadFile<{ status: string, photoId: string }>(`/family-members/${id}/photo`, formData);
  },

  /**
   * Get the absolute URL for a family member's photo on the backend
   */
  getPhotoUrl: (id: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
    return `${baseUrl}/family-members/${id}/photo`;
  }
};
