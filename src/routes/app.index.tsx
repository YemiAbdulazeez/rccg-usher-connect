import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BedDouble, IdCard, Wallet, Bell, CheckCircle2, Clock, UserCog, ShieldCheck,
  ArrowUpRight, AlertTriangle, Sparkles, Users, Activity, MapPin,
} from "lucide-react";
import { AppHeader } from "@/components/app/AppHeader";
import { StatCard } from "@/components/app/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { profileApi } from "@/lib/api/profile.api";
import { approvalsApi } from "@/lib/api/approvals.api";
import { adminApi } from "@/lib/api/admin.api";
import { notificationsApi } from "@/lib/api/notifications.api";
import {
  STATUS_LABEL, STATUS_TONE, NATIONAL_ROLES, REVIEWER_ROLES, naira,
  type Profile, type AdminStats,
} from "@/lib/types";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — RNUMS" }] }),
  component: Dashboard,
});

const MEMBER_STEPS = ["Profile completed", "Provincial (PHU) review", "Regional (RHU) review", "Active member"];

function stepIndex(status: string): number {
  switch (status) {
    case "profile_incomplete": return 0;
    case "pending_phu":
    case "phu_correction": return 1;
    case "phu_approved":
    case "pending_rhu":
    case "rhu_correction": return 2;
    case "approved": return 4;
    default: return 1;
  }
}

function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unread, setUnread] = useState(0);
  const [queueCount, setQueueCount] = useState<number | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);

  const isReviewer = !!user && REVIEWER_ROLES.has(user.role);
  const isNational = !!user && NATIONAL_ROLES.has(user.role);

  useEffect(() => {
    if (!user) return;
    profileApi.get().then(({ profile }) => setProfile(profile)).catch(() => {});
    notificationsApi.list().then(({ unread }) => setUnread(unread)).catch(() => {});
    if (REVIEWER_ROLES.has(user.role)) {
      approvalsApi.queue().then(({ queue }) => setQueueCount(queue.length)).catch(() => {});
    }
    if (NATIONAL_ROLES.has(user.role)) {
      adminApi.stats().then(setStats).catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const status = profile?.status ?? user.status;
  const isApproved = status === "approved";
  const isMember = !isReviewer && !isNational;
  const needsCorrection = status === "phu_correction" || status === "rhu_correction";
  const idx = stepIndex(status);

  return (
    <div>
      <AppHeader
        title={`Welcome, ${user.firstName || "Usher"}`}
        description="Your RCCG National Ushering portal at a glance."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/app/notifications"><Bell className="h-4 w-4" /> Notifications{unread > 0 ? ` (${unread})` : ""}</Link>
          </Button>
        }
      />

      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        {/* Member approval journey */}
        {isMember && !isApproved && (
          <Card className="border-border/60 shadow-card-elegant">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Your approval journey</CardTitle>
              <Badge className={`${STATUS_TONE[status]} border`}>{STATUS_LABEL[status]}</Badge>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-4">
                {MEMBER_STEPS.map((label, i) => {
                  const done = idx > i;
                  const active = idx === i;
                  return (
                    <div key={label} className={`rounded-lg border p-3 ${done ? "border-success/40 bg-success/5" : active ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center gap-2">
                        {done ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />}
                        <span className="text-xs font-medium">Step {i + 1}</span>
                      </div>
                      <p className="text-sm mt-1">{label}</p>
                    </div>
                  );
                })}
              </div>

              {status === "profile_incomplete" && (
                <div className="flex items-center justify-between flex-wrap gap-3 rounded-lg bg-muted/40 p-3">
                  <p className="text-sm text-muted-foreground">Complete your profile to enter the approval queue.</p>
                  <Button asChild variant="brand" size="sm"><Link to="/onboarding"><UserCog className="h-4 w-4" /> Complete profile</Link></Button>
                </div>
              )}
              {needsCorrection && (
                <div className="flex items-center justify-between flex-wrap gap-3 rounded-lg bg-destructive/5 border border-destructive/30 p-3">
                  <p className="text-sm text-foreground">{profile?.correctionNote || "A reviewer requested corrections to your profile."}</p>
                  <Button asChild variant="brand" size="sm"><Link to="/onboarding">Update & resubmit</Link></Button>
                </div>
              )}
              {status === "rejected" && (
                <div className="rounded-lg bg-destructive/5 border border-destructive/30 p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm">Your application was rejected. Please contact your Provincial Head Usher.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reviewer overview */}
        {isReviewer && (
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard label="Awaiting your review" value={queueCount ?? "—"} icon={<ShieldCheck className="h-5 w-5" />} tone="gold" />
            {isNational && stats && (
              <>
                <StatCard label="Total ushers" value={stats.users.total} icon={<Users className="h-5 w-5" />} />
                <StatCard label="Approved" value={stats.users.approved} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
                <StatCard label="Revenue" value={naira(stats.revenue.totalKobo)} icon={<Wallet className="h-5 w-5" />} />
              </>
            )}
          </div>
        )}

        {/* Reviewer CTA */}
        {isReviewer && (
          <Card className="border-border/60 shadow-card-elegant">
            <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center"><ShieldCheck className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold">Approvals queue</p>
                  <p className="text-xs text-muted-foreground">
                    {queueCount === null ? "Loading…" : queueCount === 0 ? "No applicants awaiting your action." : `${queueCount} applicant(s) in your jurisdiction.`}
                  </p>
                </div>
              </div>
              <Button asChild variant="brand" size="sm"><Link to="/app/approvals">Open queue <ArrowUpRight className="h-3 w-3" /></Link></Button>
            </CardContent>
          </Card>
        )}

        {/* National admin CTA */}
        {isNational && (
          <Card className="border-border/60 shadow-card-elegant">
            <CardContent className="p-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-brand text-primary-foreground flex items-center justify-center"><Activity className="h-5 w-5" /></div>
                <div>
                  <p className="font-semibold">Super Admin console</p>
                  <p className="text-xs text-muted-foreground">Manage reviewers, hierarchy and audit logs.</p>
                </div>
              </div>
              <Button asChild variant="brand" size="sm"><Link to="/app/admin">Open console <ArrowUpRight className="h-3 w-3" /></Link></Button>
            </CardContent>
          </Card>
        )}

        {/* Member quick actions (approved only) */}
        {isApproved && (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick actions</h3>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {[
                { icon: BedDouble, label: "Book Hostel", to: "/app/hostel" as const },
                { icon: IdCard, label: "ID Card", to: "/app/id-cards" as const },
                { icon: Wallet, label: "Payments", to: "/app/payments" as const },
                { icon: UserCog, label: "My Profile", to: "/app/profile" as const },
              ].map((q) => (
                <Link key={q.label} to={q.to}>
                  <Card className="border-border/60 hover:border-primary/40 hover:-translate-y-0.5 transition-smooth">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                      <div className="h-11 w-11 rounded-xl bg-accent text-primary flex items-center justify-center"><q.icon className="h-5 w-5" /></div>
                      <span className="text-sm font-medium">{q.label}</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Locked notice for pending members */}
        {isMember && !isApproved && status !== "profile_incomplete" && status !== "rejected" && (
          <Card className="border-border/60 shadow-card-elegant">
            <CardContent className="p-6 text-center space-y-3">
              <Sparkles className="h-8 w-8 mx-auto text-gold" />
              <p className="font-semibold">Hostel booking is available now</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                You can book and pay for a hostel while your application is under review. ID cards and
                full access to other modules unlock once your Regional Head Usher grants final approval.
                We'll notify you the moment your status changes.
              </p>
              <Button asChild variant="brand" size="sm"><Link to="/app/hostel"><BedDouble className="h-4 w-4" /> Book Hostel</Link></Button>
            </CardContent>
          </Card>
        )}

        {/* Approval history */}
        {profile && profile.history.length > 0 && (
          <Card className="border-border/60 shadow-card-elegant">
            <CardHeader><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative ml-2 border-l border-border space-y-5">
                {profile.history.slice(0, 6).map((h, i) => (
                  <li key={i} className="pl-4 relative">
                    <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full ring-4 ring-card bg-primary" />
                    <p className="text-sm capitalize">
                      <span className="font-medium">{h.actorRole || "System"}</span> — {h.action} ({h.stage.toUpperCase()})
                    </p>
                    {h.comment && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(h.at).toLocaleString()}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
