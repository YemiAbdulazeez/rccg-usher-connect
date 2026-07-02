import type { ApplicantDetail, QueueItem } from "../types";
import { api } from "./client";

export type ApprovalAction = "approve" | "reject" | "correction";

export const approvalsApi = {
  queue: () => api.get<{ queue: QueueItem[] }>("/approvals/queue"),
  applicant: (userId: number) => api.get<ApplicantDetail>(`/approvals/${userId}`),
  act: (userId: number, action: ApprovalAction, comment?: string) =>
    api.post<{ ok: boolean; id: number; status: string }>(`/approvals/${userId}/action`, {
      action,
      comment,
    }),
};
