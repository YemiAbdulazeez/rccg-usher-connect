import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, ShieldCheck, RefreshCw, XCircle, AlertTriangle, Clock, Inbox } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { approvalsApi, type ApprovalAction } from "@/lib/api/approvals.api";
import { ApiError } from "@/lib/api/client";
import { REVIEWER_ROLES, STATUS_LABEL, STATUS_TONE, type ApplicantDetail, type QueueItem } from "@/lib/types";

export const Route = createFileRoute("/app/approvals")({
  head: () => ({ meta: [{ title: "Approvals — RNUMS" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApplicantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const isReviewer = !!user && REVIEWER_ROLES.has(user.role);

  const load = async () => {
    setLoading(true);
    try {
      const { queue } = await approvalsApi.queue();
      setQueue(queue);
    } catch (err) {
      if (err instanceof ApiError && err.code !== "NOT_A_REVIEWER") {
        toast.error("Could not load queue", { description: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReviewer) void load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReviewer]);

  const openApplicant = async (id: number) => {
    setDetailLoading(true);
    try {
      const detail = await approvalsApi.applicant(id);
      setSelected(detail);
    } catch (err) {
      toast.error("Could not load applicant", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setDetailLoading(false);
    }
  };

  if (!isReviewer) {
    return (
      <div>
        <AppHeader title="Approvals" description="Review and approve usher applications." />
        <div className="p-6">
          <Card className="border-border/60">
            <CardContent className="p-10 text-center text-muted-foreground">
              <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
              You do not have reviewer permissions.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const phuCount = queue.filter((q) => q.stage === "phu").length;
  const rhuCount = queue.filter((q) => q.stage === "rhu").length;

  return (
    <div>
      <AppHeader
        title="Approvals"
        description="Applicants in your jurisdiction awaiting review."
        actions={<Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>}
      />
      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <StatBox label="In queue" value={queue.length} icon={<Inbox className="h-5 w-5" />} />
          <StatBox label="PHU stage" value={phuCount} icon={<Clock className="h-5 w-5" />} />
          <StatBox label="RHU stage" value={rhuCount} icon={<ShieldCheck className="h-5 w-5" />} />
        </div>

        <Card className="border-border/60 shadow-card-elegant">
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading queue…</p>
            ) : queue.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-success/60" />
                No applications awaiting your review. You're all caught up.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {queue.map((q) => (
                  <div key={q.id} className="p-4 flex flex-wrap items-center gap-3 hover:bg-accent/40 transition-smooth">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{q.name}</p>
                        <Badge className={`${STATUS_TONE[q.status]} border text-[10px]`}>{STATUS_LABEL[q.status]}</Badge>
                        <Badge variant="secondary" className="text-[10px] uppercase">{q.stage}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{q.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[q.designation, q.province, q.region].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    <Button size="sm" variant="brand" onClick={() => openApplicant(q.id)}>Review</Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ReviewDialog
        detail={selected}
        loading={detailLoading}
        onClose={() => setSelected(null)}
        onActed={() => {
          setSelected(null);
          void load();
        }}
      />
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-accent text-primary flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewDialog({ detail, loading, onClose, onActed }: {
  detail: ApplicantDetail | null;
  loading: boolean;
  onClose: () => void;
  onActed: () => void;
}) {
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState<ApprovalAction | null>(null);

  useEffect(() => setComment(""), [detail?.applicant.id]);

  const act = async (action: ApprovalAction) => {
    if (!detail) return;
    if ((action === "reject" || action === "correction") && comment.trim().length < 3) {
      toast.error("A comment is required", { description: "Explain what needs correcting or why it's rejected." });
      return;
    }
    setBusy(action);
    try {
      await approvalsApi.act(detail.applicant.id, action, comment.trim() || undefined);
      toast.success(
        action === "approve" ? "Approved" : action === "correction" ? "Correction requested" : "Rejected",
      );
      onActed();
    } catch (err) {
      toast.error("Action failed", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setBusy(null);
    }
  };

  const open = detail !== null || loading;
  const f = detail?.profile.fields;
  const loc = detail?.profile.location;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detail ? detail.applicant.name : "Loading…"}</DialogTitle>
          <DialogDescription>{detail?.applicant.email}</DialogDescription>
        </DialogHeader>

        {detail && f && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              {f.passportUrl && <img src={f.passportUrl} alt="passport" className="h-20 w-20 rounded object-cover bg-muted" />}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm flex-1">
                <Field k="Designation" v={f.designation} />
                <Field k="Gender" v={f.gender} />
                <Field k="Region" v={loc?.regionName} />
                <Field k="Province" v={loc?.provinceName} />
                <Field k="Zone" v={loc?.zoneName} />
                <Field k="Area" v={loc?.areaName} />
                <Field k="Parish" v={loc?.parishName} />
                <Field k="WhatsApp" v={f.whatsapp} />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm border-t border-border pt-3">
              <Field k="DOB" v={f.dob} />
              <Field k="Marital status" v={f.maritalStatus} />
              <Field k="Occupation" v={f.occupation} />
              <Field k="Place of work" v={f.placeOfWork} />
              <Field k="Education" v={f.education} />
              <Field k="Year joined RCCG" v={f.yearJoinedRccg} />
              <Field k="Year joined ushering" v={f.yearJoinedUshers} />
              <Field k="Ordination" v={f.ordinationType} />
              <Field k="Pastor in charge" v={f.pastorInCharge} />
              <Field k="Home address" v={f.homeAddress} />
            </div>

            {detail.profile.history.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">History</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {detail.profile.history.map((h, i) => (
                    <li key={i}>
                      <span className="font-medium text-foreground">{h.stage.toUpperCase()} {h.action}</span>
                      {h.comment ? ` — ${h.comment}` : ""} · {new Date(h.at).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="border-t border-border pt-3 space-y-2">
              <label className="text-sm font-medium">Comment (required for correction/rejection)</label>
              <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Reason / what to fix…" />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => act("correction")} disabled={!!busy || !detail}>
            <AlertTriangle className="h-4 w-4" /> Request correction
          </Button>
          <Button variant="destructive" onClick={() => act("reject")} disabled={!!busy || !detail}>
            <XCircle className="h-4 w-4" /> Reject
          </Button>
          <Button variant="brand" onClick={() => act("approve")} disabled={!!busy || !detail}>
            <CheckCircle2 className="h-4 w-4" /> {busy === "approve" ? "Approving…" : "Approve"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex justify-between gap-3 py-0.5">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v || "—"}</span>
    </div>
  );
}
