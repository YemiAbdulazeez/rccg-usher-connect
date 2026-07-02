import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ImageIcon, PenTool, KeyRound, MapPin, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { profileApi } from "@/lib/api/profile.api";
import { authApi } from "@/lib/api/auth.api";
import { ApiError } from "@/lib/api/client";
import { STATUS_LABEL, STATUS_TONE, type Profile } from "@/lib/types";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "My Profile — RNUMS" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => profileApi.get().then(({ profile }) => setProfile(profile)).catch(() => {});

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const upload = async (kind: "passport" | "signature", file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large", { description: "Max 5MB." }); return; }
    try {
      await profileApi.upload(kind, file);
      await load();
      toast.success(`${kind === "passport" ? "Passport" : "Signature"} updated`);
    } catch (err) {
      toast.error("Upload failed", { description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const f = profile?.fields;
  const loc = profile?.location;
  const status = profile?.status ?? user?.status ?? "profile_incomplete";

  return (
    <div>
      <AppHeader
        title="My Profile"
        description="Your personal, church and identification details."
        actions={
          <Button asChild variant="brand" size="sm">
            <Link to="/onboarding"><Pencil className="h-4 w-4" /> Edit full profile</Link>
          </Button>
        }
      />
      <div className="p-4 md:p-6 space-y-6 animate-fade-in">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your profile…</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Identity card */}
            <Card className="lg:col-span-1 border-border/60 shadow-card-elegant overflow-hidden">
              <div className="bg-gradient-hero h-24" />
              <CardContent className="-mt-12 p-6">
                <Avatar className="h-20 w-20 ring-4 ring-card mx-auto">
                  {f?.passportUrl ? <AvatarImage src={f.passportUrl} alt={fullName} /> : null}
                  <AvatarFallback className="bg-gradient-brand text-primary-foreground text-2xl font-bold">
                    {fullName ? fullName.split(" ").map((s) => s[0]).slice(0, 2).join("") : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center mt-3">
                  <h3 className="font-bold text-lg">{fullName || "Usher"}</h3>
                  <p className="text-sm text-muted-foreground">{f?.designation ?? "Usher"}</p>
                  <div className="flex justify-center mt-3">
                    <Badge className={`${STATUS_TONE[status]} border`}>{STATUS_LABEL[status]}</Badge>
                  </div>
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  <Row k="Email" v={user?.email} />
                  <Row k="Region" v={loc?.regionName} />
                  <Row k="Province" v={loc?.provinceName} />
                  <Row k="Parish" v={loc?.parishName} />
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/60 shadow-card-elegant">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Profile summary</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                  <Row k="Gender" v={f?.gender} />
                  <Row k="Date of Birth" v={f?.dob} />
                  <Row k="Marital Status" v={f?.maritalStatus} />
                  <Row k="WhatsApp" v={f?.whatsapp} />
                  <Row k="Zone" v={loc?.zoneName} />
                  <Row k="Area" v={loc?.areaName} />
                  <Row k="Occupation" v={f?.occupation} />
                  <Row k="Employer" v={f?.employer} />
                  <Row k="Place of Work" v={f?.placeOfWork} />
                  <Row k="Education" v={f?.education} />
                  <Row k="Year Joined RCCG" v={f?.yearJoinedRccg} />
                  <Row k="Year Joined Ushering" v={f?.yearJoinedUshers} />
                  <Row k="Ordination" v={f?.ordinationType} />
                  <Row k="Ordination Year" v={f?.ordinationYear} />
                  <Row k="Pastor in Charge" v={f?.pastorInCharge} />
                  <Row k="Home Address" v={f?.homeAddress} />
                </CardContent>
              </Card>

              {/* Uploads */}
              <Card className="border-border/60 shadow-card-elegant">
                <CardHeader><CardTitle className="text-base">Identification uploads</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4">
                  <UploadField label="Passport Photograph" icon={<ImageIcon className="h-4 w-4" />} url={f?.passportUrl ?? null} onFile={(file) => upload("passport", file)} />
                  <UploadField label="Signature" icon={<PenTool className="h-4 w-4" />} url={f?.signatureUrl ?? null} onFile={(file) => upload("signature", file)} />
                </CardContent>
              </Card>

              <ChangePasswordCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 border-b border-border/50 last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right break-words">{v || <span className="text-muted-foreground">—</span>}</span>
    </div>
  );
}

function UploadField({ label, icon, url, onFile }: {
  label: string; icon: React.ReactNode; url: string | null; onFile: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">{icon}{label}</Label>
      <div className="rounded-md border-2 border-dashed p-3 flex items-center gap-3 border-border">
        {url ? (
          <img src={url} alt={label} className="h-16 w-16 object-cover rounded bg-muted" />
        ) : (
          <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          {url && <p className="text-[11px] text-success mt-1">Uploaded ✓ — choose another to replace</p>}
        </div>
      </div>
    </div>
  );
}

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (next !== confirm) { toast.error("Passwords do not match"); return; }
    setSaving(true);
    try {
      await authApi.changePassword(current, next, confirm);
      toast.success("Your password has been changed successfully.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err) {
      toast.error("Could not change password", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Change password</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Current password</Label>
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Confirm new password</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <Button type="submit" variant="brand" disabled={saving}>{saving ? "Saving…" : "Update password"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
