import { api } from "./client";
export interface CaregiverCreate {
  name: string;
  email: string;
  password?: string;
}

export interface CaregiverResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export const authApi = {
  login: async (email: string, password: string) => {
    // OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString()
    });
    
    if (!response.ok) {
        return { ok: false, error: "Invalid email or password", data: null };
    }
    const data = await response.json();
    return { ok: true, data: data as Token };
  },
  
  register: (caregiver: CaregiverCreate) => {
    return api.post<CaregiverResponse>("/auth/register", caregiver);
  },
  
  logout: () => {
    localStorage.removeItem("caregiver_token");
    window.location.href = "/caregiver/login";
  },
  
  getCaregiverId: (): string | null => {
    const token = localStorage.getItem("caregiver_token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }
};
