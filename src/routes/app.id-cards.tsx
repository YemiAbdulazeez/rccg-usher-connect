import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { IdCard, Lock, Wallet, CheckCircle2, AlertTriangle, QrCode } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { idcardsApi } from "@/lib/api/idcards.api";
import { runPayment } from "@/lib/api/payments.api";
import { profileApi } from "@/lib/api/profile.api";
import { ApiError } from "@/lib/api/client";
import { NATIONAL_ROLES, type AdminIdCard, type IdCardApplication, type IdCardStatus } from "@/lib/types";
import { logoUrl } from "@/assets/images";

export const Route = createFileRoute("/app/id-cards")({
  head: () => ({ meta: [{ title: "ID Cards — RNUMS" }] }),
  component: IdCardsPage,
});

const ID_CARD_PRICE = "₦1,000";
const STAGES: IdCardStatus[] = ["submitted", "approved", "printing", "completed"];

function IdCardsPage() {
  const { user } = useAuth();
  const isAdmin = !!user && NATIONAL_ROLES.has(user.role);
  const isApproved = user?.status === "approved";

  return (
    <div>
      <AppHeader title="Digital ID Card" description="Apply for and manage your official RCCG Ushering ID card." />
      <div className="p-4 md:p-6 animate-fade-in">
        {isAdmin ? (
          <Tabs defaultValue="mine">
            <TabsList>
              <TabsTrigger value="mine">My ID Card</TabsTrigger>
              <TabsTrigger value="admin">Manage</TabsTrigger>
            </TabsList>
            <TabsContent value="mine" className="mt-4">{isApproved ? <UserIdCard /> : <LockedNotice />}</TabsContent>
            <TabsContent value="admin" className="mt-4"><AdminPanel /></TabsContent>
          </Tabs>
        ) : isApproved ? (
          <UserIdCard />
        ) : (
          <LockedNotice />
        )}
      </div>
    </div>
  );
}

function LockedNotice() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-10 text-center text-muted-foreground">
        <Lock className="h-10 w-10 mx-auto mb-3 opacity-40" />
        ID card applications unlock once your account is fully approved.
      </CardContent>
    </Card>
  );
}

function UserIdCard() {
  const { user } = useAuth();
  const [apps, setApps] = useState<IdCardApplication[]>([]);
  const [hasPassport, setHasPassport] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ applications }, { profile }] = await Promise.all([idcardsApi.mine(), profileApi.get()]);
      setApps(applications);
      setHasPassport(!!profile.fields.passportUrl);
    } catch (err) {
      toast.error("Could not load ID cards", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const applyAndPay = async () => {
    setBusy(true);
    try {
      const { application } = await idcardsApi.apply();
      toast.info("Application created — proceeding to payment…");
      const res = await runPayment("id_card", application.id);
      if (res.status === "success") {
        toast.success("Payment successful — ID card application submitted");
      } else {
        toast.error("Payment not completed", { description: "You can retry from below." });
      }
      await load();
    } catch (err) {
      toast.error("Could not apply", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const paidApp = apps.find((a) => a.paid);
  const unpaidApp = apps.find((a) => !a.paid);

  return (
    <div className="space-y-6">
      {!hasPassport && (
        <Alert className="border-gold/40 bg-gold/5">
          <AlertTriangle className="h-4 w-4 text-gold-foreground" />
          <AlertTitle>Passport photo required</AlertTitle>
          <AlertDescription>
            You need a passport photograph before applying.{" "}
            <Link to="/app/profile" className="text-primary underline">Update your profile</Link>.
          </AlertDescription>
        </Alert>
      )}

      {paidApp ? (
        <DigitalCard app={paidApp} name={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()} />
      ) : (
        <Card className="border-border/60 shadow-card-elegant">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="h-16 w-16 rounded-xl bg-accent text-primary flex items-center justify-center"><IdCard className="h-8 w-8" /></div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-lg">Apply for your digital ID card</h3>
              <p className="text-sm text-muted-foreground">One-time fee of {ID_CARD_PRICE}. Auto-filled from your profile, with a QR verification code.</p>
            </div>
            <Button variant="brand" size="lg" disabled={!hasPassport || busy} onClick={applyAndPay}>
              <Wallet className="h-4 w-4" /> {unpaidApp ? `Pay ${ID_CARD_PRICE}` : `Apply · ${ID_CARD_PRICE}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status timeline for the active (paid) application */}
      {paidApp && (
        <Card className="border-border/60 shadow-card-elegant">
          <CardHeader><CardTitle className="text-base">Application status</CardTitle></CardHeader>
          <CardContent>
            <Timeline status={paidApp.status} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Timeline({ status }: { status: IdCardStatus }) {
  const currentIdx = STAGES.indexOf(status);
  const labels: Record<IdCardStatus, string> = {
    submitted: "Submitted & paid",
    approved: "Approved",
    printing: "Printing",
    completed: "Completed",
  };
  return (
    <ol className="flex flex-col sm:flex-row gap-4 sm:gap-0">
      {STAGES.map((s, i) => {
        const done = i <= currentIdx;
        return (
          <li key={s} className="flex sm:flex-col items-center sm:flex-1 gap-3 sm:gap-2">
            <div className="flex items-center sm:flex-col w-full">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              {i < STAGES.length - 1 && <div className={`h-0.5 sm:h-0.5 flex-1 sm:w-full mx-2 sm:mx-0 sm:mt-2 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />}
            </div>
            <span className={`text-xs ${done ? "font-medium" : "text-muted-foreground"}`}>{labels[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}

function DigitalCard({ app, name }: { app: IdCardApplication; name: string }) {
  const s = app.snapshot ?? {};
  return (
    <div className="max-w-md mx-auto">
      <div className="rounded-2xl overflow-hidden shadow-elegant border border-border">
        <div className="bg-gradient-hero text-white p-4 flex items-center gap-3">
          <img src={logoUrl} alt="RNUMS" className="h-10 w-10 rounded-full bg-white/10" />
          <div className="leading-tight">
            <p className="font-bold text-sm">RCCG NATIONAL USHERING</p>
            <p className="text-[10px] text-white/70">Official Identification Card</p>
          </div>
          <Badge className="ml-auto bg-white/20 text-white text-[10px] uppercase">{app.status}</Badge>
        </div>
        <div className="bg-card p-5 flex gap-4">
          {app.passportUrl ? (
            <img src={app.passportUrl} alt={name} className="h-24 w-24 rounded-lg object-cover border" />
          ) : (
            <div className="h-24 w-24 rounded-lg bg-muted" />
          )}
          <div className="flex-1 text-sm space-y-0.5">
            <p className="font-bold text-base">{name}</p>
            <p className="text-muted-foreground">{s.designation ?? "Usher"}</p>
            <p className="text-xs text-muted-foreground">{[s.parish, s.province].filter(Boolean).join(" · ")}</p>
            <p className="text-xs text-muted-foreground">{s.region}</p>
            <p className="text-[11px] text-muted-foreground pt-1">No: {app.applicationNumber}</p>
          </div>
          {app.qrUrl && <img src={app.qrUrl} alt="QR" className="h-20 w-20 self-end rounded bg-white p-1 border" />}
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
        <QrCode className="h-3 w-3" /> Scan the QR to verify authenticity.
      </p>
    </div>
  );
}

// ── Admin ────────────────────────────────────────────────────────────────────

const NEXT: Record<IdCardStatus, Exclude<IdCardStatus, "submitted"> | null> = {
  submitted: "approved",
  approved: "printing",
  printing: "completed",
  completed: null,
};

function AdminPanel() {
  const [apps, setApps] = useState<AdminIdCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setApps((await idcardsApi.adminList()).applications);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const advance = async (a: AdminIdCard) => {
    const next = NEXT[a.status];
    if (!next) return;
    try {
      await idcardsApi.adminSetStatus(a.id, next);
      toast.success(`Marked ${next}`);
      await load();
    } catch (err) {
      toast.error("Could not update", { description: err instanceof ApiError ? err.message : undefined });
    }
  };

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base">ID card applications</CardTitle></CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : apps.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {apps.map((a) => (
              <div key={a.id} className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium text-sm">{a.userName} <span className="text-xs text-muted-foreground">· {a.applicationNumber}</span></p>
                  <p className="text-xs text-muted-foreground">{a.userEmail}</p>
                </div>
                {!a.paid && <Badge className="bg-destructive/10 text-destructive border-destructive/30">Unpaid</Badge>}
                <Badge variant="secondary" className="uppercase text-[10px]">{a.status}</Badge>
                {a.paid && NEXT[a.status] && (
                  <Button size="sm" variant="brand" onClick={() => advance(a)}>Mark {NEXT[a.status]}</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
