import type { Contact, Deal, PipelineSummary, User } from "./types";

// Local dev default; the production build points this at the deployed Render backend (set
// via import.meta.env.VITE_API_BASE at build time once the backend is deployed).
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const TOKEN_KEY = "pursuit_token";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(body.error || `request failed (${res.status})`, res.status);
  }
  return body as T;
}

export const api = {
  register(email: string, password: string, displayName: string) {
    return request<{ token: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, displayName }),
    });
  },

  login(email: string, password: string) {
    return request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return request<User>("/auth/me");
  },

  listContacts() {
    return request<Contact[]>("/api/contacts");
  },

  createContact(data: { company: string; person: string; title?: string; region?: string }) {
    return request<Contact>("/api/contacts", { method: "POST", body: JSON.stringify(data) });
  },

  deleteContact(id: number) {
    return request<void>(`/api/contacts/${id}`, { method: "DELETE" });
  },

  listDeals() {
    return request<Deal[]>("/api/deals");
  },

  getSummary() {
    return request<PipelineSummary>("/api/deals/summary");
  },

  createDeal(data: { contactId: number; valueCents: number; stage?: string; note?: string }) {
    return request<Deal>("/api/deals", { method: "POST", body: JSON.stringify(data) });
  },

  updateDeal(id: number, data: Partial<{ stage: string; valueCents: number; note: string }>) {
    return request<Deal>(`/api/deals/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  deleteDeal(id: number) {
    return request<void>(`/api/deals/${id}`, { method: "DELETE" });
  },
};
