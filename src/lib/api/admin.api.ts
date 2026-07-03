import type { AdminStats, AdminUser, AuditLog } from "../types";
import { api } from "./client";

export type ReviewerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
};

export const adminApi = {
  stats: () => api.get<AdminStats>("/admin/stats"),
  users: (params?: { role?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.status) q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString();
    return api.get<{ users: AdminUser[] }>(`/admin/users${qs ? `?${qs}` : ""}`);
  },
  auditLogs: () => api.get<{ logs: AuditLog[] }>("/admin/audit-logs"),

  createPhu: (input: ReviewerInput & { provinceId: number }) =>
    api.post<{ id: number }>("/admin/users/phu", input),
  createRhu: (input: ReviewerInput & { regionId: number }) =>
    api.post<{ id: number }>("/admin/users/rhu", input),
  createOfficer: (
    input: ReviewerInput & { role: string; regionId?: number; provinceId?: number },
  ) => api.post<{ id: number }>("/admin/users/officer", input),

  createRegion: (input: { name: string; code: string }) =>
    api.post<{ id: number }>("/admin/hierarchy/regions", input),
  createProvince: (input: { regionId: number; name: string; code: string }) =>
    api.post<{ id: number }>("/admin/hierarchy/provinces", input),
  createZone: (input: { provinceId: number; name: string; code: string }) =>
    api.post<{ id: number }>("/admin/hierarchy/zones", input),
  createArea: (input: { zoneId: number; name: string; code: string }) =>
    api.post<{ id: number }>("/admin/hierarchy/areas", input),
  createParish: (input: { areaId: number; name: string; code: string; address?: string }) =>
    api.post<{ id: number }>("/admin/hierarchy/parishes", input),
  removeHierarchy: (entity: string, id: number) =>
    api.del<{ ok: boolean }>(`/admin/hierarchy/${entity}/${id}`),
};
