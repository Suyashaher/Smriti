/**
 * Centralized HTTP client for FastAPI backend.
 *
 * - All requests go through this module
 * - Adds X-Device-Id header automatically
 * - Never blocks UI on failure — returns null/throws for caller to handle
 * - Base URL from VITE_API_URL env var or falls back to localhost:8000
 */

import { db } from "@/db/database";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 10_000;

let cachedDeviceId: string | null = null;

async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  try {
    const meta = await db.meta.get("device");
    if (meta?.deviceId) {
      cachedDeviceId = meta.deviceId;
      return meta.deviceId;
    }
  } catch {
    // IndexedDB unavailable
  }
  return "unknown";
}

export interface ApiResponse<T> {
  data: T | null;
  ok: boolean;
  status: number;
  error: string | null;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | undefined>,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const deviceId = await getDeviceId();
    let url = `${BASE_URL}${path}`;

    // Add query params
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const token = localStorage.getItem("caregiver_token");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Device-Id": deviceId,
      ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (res.ok) {
      const data = (await res.json()) as T;
      return { data, ok: true, status: res.status, error: null };
    }

    // Parse error
    let errorMessage = `HTTP ${res.status}`;
    try {
      const errBody = await res.json();
      errorMessage = errBody.detail ?? errorMessage;
    } catch {
      // Non-JSON error body
    }

    return { data: null, ok: false, status: res.status, error: errorMessage };
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === "AbortError"
        ? "Request timed out"
        : err instanceof TypeError
          ? "Network error — backend may be unavailable"
          : String(err);

    return { data: null, ok: false, status: 0, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>("GET", path, undefined, params),

  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),

  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),

  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),

  delete: <T>(path: string) => request<T>("DELETE", path),

  uploadFile: async <T>(path: string, formData: FormData): Promise<ApiResponse<T>> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const deviceId = await getDeviceId();
      const token = localStorage.getItem("caregiver_token");
      const headers: Record<string, string> = {
        "X-Device-Id": deviceId,
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
      };
      // Note: We deliberately do NOT set Content-Type header here.
      // fetch will automatically set it to multipart/form-data with the correct boundary.

      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers,
        body: formData,
        signal: controller.signal,
      });

      if (res.ok) {
        const data = (await res.json()) as T;
        return { data, ok: true, status: res.status, error: null };
      }

      let errorMessage = `HTTP ${res.status}`;
      try {
        const errBody = await res.json();
        errorMessage = errBody.detail ?? errorMessage;
      } catch {}
      return { data: null, ok: false, status: res.status, error: errorMessage };
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out"
          : "Network error";
      return { data: null, ok: false, status: 0, error: message };
    } finally {
      clearTimeout(timeout);
    }
  },
};
