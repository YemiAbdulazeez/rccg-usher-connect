import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Logo";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { paymentsApi } from "@/lib/api/payments.api";

type CallbackSearch = { reference?: string; trxref?: string };

export const Route = createFileRoute("/payments/callback")({
  head: () => ({ meta: [{ title: "Verifying payment — RNUMS" }] }),
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    reference: typeof search.reference === "string" ? search.reference : undefined,
    trxref: typeof search.trxref === "string" ? search.trxref : undefined,
  }),
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const { reference, trxref } = Route.useSearch();
  const ref = reference || trxref;
  const [state, setState] = useState<"verifying" | "success" | "failed">("verifying");
  const [purpose, setPurpose] = useState<"hostel" | "id_card" | null>(null);

  useEffect(() => {
    if (!ref) {
      setState("failed");
      return;
    }
    paymentsApi
      .verify(ref)
      .then((res) => {
        setPurpose(res.purpose);
        setState(res.status === "success" ? "success" : "failed");
      })
      .catch(() => setState("failed"));
  }, [ref]);

  const goTo = purpose === "id_card" ? "/app/id-cards" : "/app/hostel";

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex justify-center"><Logo /></div>
        <Card className="border-border/60 shadow-card-elegant">
          <CardContent className="p-8 space-y-4">
            {state === "verifying" && (
              <>
                <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
                <p className="font-medium">Verifying your payment…</p>
              </>
            )}
            {state === "success" && (
              <>
                <CheckCircle2 className="h-12 w-12 mx-auto text-success" />
                <h1 className="text-xl font-bold">Payment successful</h1>
                <p className="text-sm text-muted-foreground">Your transaction has been confirmed.</p>
                <Button variant="brand" className="w-full" onClick={() => navigate({ to: goTo })}>Continue</Button>
              </>
            )}
            {state === "failed" && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-destructive" />
                <h1 className="text-xl font-bold">Payment not confirmed</h1>
                <p className="text-sm text-muted-foreground">We couldn't verify this transaction. You can retry from your dashboard.</p>
                <Button variant="outline" className="w-full" onClick={() => navigate({ to: "/app" })}>Back to dashboard</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
