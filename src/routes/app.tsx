import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { useAuth } from "@/lib/auth/AuthProvider";
import { profileApi } from "@/lib/api/profile.api";
import { STATUS_LABEL, STATUS_TONE, type ProfileStatus } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, CheckCircle2, ShieldAlert, X } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

export const PENDING_DISCLAIMER =
  "Access to this portal while your approval is pending does not guarantee final membership approval. RCCG National Ushers reserves the right to cancel, suspend, reject, or reverse any application, booking, payment, ID card request, hostel request, training registration, or service access at any time if the information provided is false, incomplete, unverifiable, or if the user violates RCCG National Ushers' code of conduct or operational guidelines. All payments are non-refundable. Payment may be forfeited where wrong information is supplied, eligibility requirements are not met, or conduct requirements are breached. By using this portal, you agree to indemnify RCCG National Ushers, its officers, administrators, and representatives against any claim, loss, dispute, or liability arising from your registration, application, booking, payment, or use of the portal.";

function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<ProfileStatus | null>(null);
  const [correctionNote, setCorrectionNote] = useState<string | null>(null);
  const [disclaimerOpen, setDisclaimerOpen] = useState(true);

  // Auth gate: redirect unauthenticated users to login.
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  // First-login gate: force profile completion.
  useEffect(() => {
    if (!loading && user && !user.profileComplete) navigate({ to: "/onboarding" });
  }, [loading, user, navigate]);

  // Load authoritative status + correction note for banners.
  useEffect(() => {
    if (!user) return;
    let active = true;
    profileApi
      .get()
      .then(({ profile }) => {
        if (!active) return;
        setStatus(profile.status);
        setCorrectionNote(profile.correctionNote);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [user, pathname]);

  if (loading || !user) return null;
  if (!user.profileComplete) return null;

  const effectiveStatus = status ?? user.status;
  const showStatusBanner = effectiveStatus && effectiveStatus !== "approved";
  const isPending =
    effectiveStatus === "pending_phu" ||
    effectiveStatus === "phu_approved" ||
    effectiveStatus === "pending_rhu" ||
    effectiveStatus === "phu_correction" ||
    effectiveStatus === "rhu_correction";
  const needsCorrection = effectiveStatus === "phu_correction" || effectiveStatus === "rhu_correction";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          {showStatusBanner && (
            <div className="p-4 md:px-6 md:pt-6">
              <Alert className={`${STATUS_TONE[effectiveStatus]} border`}>
                {effectiveStatus === "rejected" || needsCorrection ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <AlertTitle>Account status: {STATUS_LABEL[effectiveStatus]}</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-3 flex-wrap">
                  <span>
                    {effectiveStatus === "pending_phu" && "Your profile is awaiting review by the Provincial Head Usher."}
                    {effectiveStatus === "phu_approved" && "PHU approved — awaiting Regional Head Usher final approval."}
                    {effectiveStatus === "pending_rhu" && "Awaiting Regional Head Usher final approval."}
                    {effectiveStatus === "phu_correction" && (correctionNote || "PHU requested corrections to your profile.")}
                    {effectiveStatus === "rhu_correction" && (correctionNote || "RHU requested corrections to your profile.")}
                    {effectiveStatus === "rejected" && "Your application was rejected. Please contact your Provincial Head Usher."}
                  </span>
                  {needsCorrection && (
                    <Button asChild size="sm" variant="brand">
                      <Link to="/onboarding">Update & resubmit</Link>
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
          {isPending && disclaimerOpen && (
            <div className="p-4 md:px-6 md:pt-2">
              <Alert className="border-gold/40 bg-gold/5 relative pr-10">
                <ShieldAlert className="h-4 w-4 text-gold-foreground" />
                <AlertTitle>Important — Pending Approval Disclaimer</AlertTitle>
                <AlertDescription className="text-xs leading-relaxed">{PENDING_DISCLAIMER}</AlertDescription>
                <button
                  aria-label="Dismiss"
                  onClick={() => setDisclaimerOpen(false)}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </Alert>
            </div>
          )}
          {effectiveStatus === "approved" && pathname === "/app" && (
            <div className="p-4 md:px-6 md:pt-6">
              <Alert className="border-success/30 bg-success/5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle>Account active</AlertTitle>
                <AlertDescription>Welcome back, {user.firstName}. All features are unlocked.</AlertDescription>
              </Alert>
            </div>
          )}
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
