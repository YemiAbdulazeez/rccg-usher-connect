import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site/Logo";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { ApiError } from "@/lib/api/client";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Join Ushering — RNUMS" }, { name: "description", content: "Register to join the RCCG National Ushering Department." }] }),
  component: RegisterPage,
});

const perks = [
  "Digital ID card with QR verification",
  "Hostel booking at Redemption Camp",
  "Structured provincial & regional approval",
  "In-app and email notifications",
  "One secure profile across every event",
];

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(form).some((v) => !v.trim())) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register({ ...form, email: form.email.trim().toLowerCase() });
      toast.success("Account created", { description: "Let's complete your profile." });
      navigate({ to: "/onboarding" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Registration failed. Please try again.";
      toast.error("Could not create account", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-5">
      <div className="lg:col-span-3 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-xl space-y-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <div>
            <Logo />
            <h1 className="text-3xl font-bold tracking-tight mt-6">Join the Ushering family</h1>
            <p className="text-muted-foreground mt-1">Create your account in less than 2 minutes.</p>
          </div>

          <Card className="border-border/60 shadow-card-elegant">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Adeyemi" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+234 …" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min. 8 characters" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} placeholder="Re-enter password" />
                  </div>
                </div>
                <Button type="submit" disabled={submitting} variant="brand" size="lg" className="w-full">
                  {submitting ? "Creating account…" : "Create account"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By creating an account you agree to our Terms and acknowledge our Privacy Policy.
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Already a member? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="lg:col-span-2 relative hidden lg:flex bg-gradient-hero text-white p-12 flex-col">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="relative mt-auto max-w-sm">
          <h2 className="text-3xl font-bold">Why join RNUMS?</h2>
          <ul className="mt-6 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-white/90">
                <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
