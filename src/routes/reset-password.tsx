import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Lock, AlertTriangle } from "lucide-react";
import { authApi } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/client";

type ResetSearch = { token?: string };

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password — RNUMS" }] }),
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSubmitting(true);
    try {
      await authApi.reset(token, password, confirmPassword);
      toast.success("Password reset", { description: "You can now sign in with your new password." });
      navigate({ to: "/login" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not reset password.";
      toast.error("Reset failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
        <Logo />
        <Card className="border-border/60 shadow-card-elegant">
          <CardContent className="p-6 space-y-4">
            {!token ? (
              <Alert className="border-destructive/40 bg-destructive/5">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertTitle>Invalid link</AlertTitle>
                <AlertDescription>
                  This reset link is missing its token. Please request a new one from the{" "}
                  <Link to="/forgot-password" className="text-primary underline">forgot password</Link> page.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold">Set a new password</h1>
                  <p className="text-muted-foreground text-sm mt-1">Choose a strong password you don't use elsewhere.</p>
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirm new password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="pl-9" />
                  </div>
                </div>
                <Button type="submit" disabled={submitting} variant="brand" size="lg" className="w-full">
                  {submitting ? "Saving…" : "Reset password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
