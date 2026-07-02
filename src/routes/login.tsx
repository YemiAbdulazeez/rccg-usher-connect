import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/site/Logo";
import { ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import { heroUshers as heroImg } from "@/assets/images";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — RNUMS" }, { name: "description", content: "Sign in to your RNUMS account." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter your email and password");
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      toast.success("Welcome back", { description: user.email });
      if (!user.profileComplete) {
        navigate({ to: "/onboarding" });
      } else {
        navigate({ to: "/app" });
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to sign in. Please try again.";
      toast.error("Sign in failed", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:block bg-gradient-hero">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        <div className="relative h-full flex flex-col p-12 text-white">
          <Logo variant="light" />
          <div className="mt-auto max-w-md">
            <h2 className="text-4xl font-bold leading-tight">Serving God Through Excellence.</h2>
            <p className="mt-4 text-white/80 text-lg">
              The official National Ushering Management Portal of the Redeemed Christian Church of God.
            </p>
            <div className="mt-8 flex items-center gap-4 text-sm text-white/70">
              <ShieldCheck className="h-5 w-5" /> Secured with industry-standard authentication.
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, brethren</h1>
            <p className="text-muted-foreground mt-1">Sign in to access your dashboard.</p>
          </div>

          <Card className="border-border/60 shadow-card-elegant">
            <CardContent className="p-6">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal">Remember me on this device</Label>
                </div>
                <Button type="submit" disabled={submitting} variant="brand" size="lg" className="w-full">
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            New to the department?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
