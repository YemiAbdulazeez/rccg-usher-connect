import type { PaymentInit, PaymentRecord, PaymentVerify } from "../types";
import { api } from "./client";

export const paymentsApi = {
  init: (purpose: "hostel" | "id_card", relatedId: number) =>
    api.post<PaymentInit>("/payments/init", { purpose, relatedId }),
  verify: (reference: string) => api.get<PaymentVerify>(`/payments/verify/${reference}`),
  history: () => api.get<{ payments: PaymentRecord[] }>("/payments/me"),
};

/**
 * Drive a payment to completion. In mock mode (no live Paystack key) the backend
 * returns no authorization URL, so we verify directly. In live mode we hand off
 * to Paystack's hosted page (which returns to /payments/callback).
 */
export async function runPayment(
  purpose: "hostel" | "id_card",
  relatedId: number,
): Promise<PaymentVerify> {
  const init = await paymentsApi.init(purpose, relatedId);
  if (init.authorizationUrl) {
    window.location.href = init.authorizationUrl;
    // Redirecting away; resolve as pending-ish. Callers should not rely on this
    // resolving in live mode.
    return { reference: init.reference, status: "failed", purpose, relatedId };
  }
  return paymentsApi.verify(init.reference);
}
