import type { AdminIdCard, IdCardApplication, IdCardStatus } from "../types";
import { api } from "./client";

export const idcardsApi = {
  mine: () => api.get<{ applications: IdCardApplication[] }>("/id-cards/me"),
  apply: () => api.post<{ application: IdCardApplication }>("/id-cards/apply"),

  // Admin
  adminList: () => api.get<{ applications: AdminIdCard[] }>("/id-cards/admin/applications"),
  adminSetStatus: (id: number, status: Exclude<IdCardStatus, "submitted">) =>
    api.post<{ id: number; status: string }>(`/id-cards/admin/applications/${id}/status`, { status }),
};
