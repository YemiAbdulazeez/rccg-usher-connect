import type { AppNotification } from "../types";
import { api } from "./client";

export const notificationsApi = {
  list: () => api.get<{ notifications: AppNotification[]; unread: number }>("/notifications"),
  read: (id: number) => api.post<{ ok: boolean }>(`/notifications/${id}/read`),
  readAll: () => api.post<{ ok: boolean }>("/notifications/read-all"),
};
