import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle2, Clock, XCircle } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments.api";
import { ApiError } from "@/lib/api/client";
import { naira, type PaymentRecord } from "@/lib/types";

export const Route = createFileRoute("/app/payments")({
  head: () => ({ meta: [{ title: "Payment History — RNUMS" }] }),
  component: PaymentsPage,
});

const PURPOSE_LABEL: Record<string, string> = { hostel: "Hostel booking", id_card: "ID card" };

function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsApi
      .history()
      .then(({ payments }) => setPayments(payments))
      .catch((err) => {
        if (err instanceof ApiError) toast.error("Could not load payments", { description: err.message });
      })
      .finally(() => setLoading(false));
  }, []);

  const total = payments.filter((p) => p.status === "success").reduce((s, p) => s + p.amountKobo, 0);

  return (
    <div>
      <AppHeader title="Payment History" description="Every payment you've made through the portal." />
      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        <Card className="border-border/60 shadow-card-elegant">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent text-primary flex items-center justify-center"><Receipt className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold">{naira(total)}</p>
              <p className="text-xs text-muted-foreground">Total paid successfully</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card-elegant">
          <CardContent className="p-0 divide-y divide-border">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : payments.length === 0 ? (
              <p className="p-10 text-center text-sm text-muted-foreground">No payments yet.</p>
            ) : (
              payments.map((p) => {
                const tone = p.status === "success" ? { i: CheckCircle2, c: "bg-success/15 text-success" }
                  : p.status === "failed" ? { i: XCircle, c: "bg-destructive/15 text-destructive" }
                  : { i: Clock, c: "bg-gold/15 text-gold-foreground" };
                const Icon = tone.i;
                return (
                  <div key={p.reference} className="p-4 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tone.c}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{PURPOSE_LABEL[p.purpose] ?? p.purpose}</p>
                      <p className="text-xs text-muted-foreground">{p.reference} · {new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="font-semibold text-sm">{naira(p.amountKobo)}</span>
                    <Badge variant="secondary" className="capitalize">{p.status}</Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
