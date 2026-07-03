import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/site/Logo";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Info, AlertTriangle, ImageIcon, PenTool, Upload, Save } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hierarchyApi } from "@/lib/api/hierarchy.api";
import { profileApi, type ProfileFieldsPayload } from "@/lib/api/profile.api";
import { ApiError } from "@/lib/api/client";
import type { HierarchyNode } from "@/lib/types";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Complete your profile — RNUMS" }] }),
  component: OnboardingPage,
});

// Self-registration is limited to Zonal Head Usher and below. Regional/Provincial
// head ushers (and above) are created by the Super Admin, so they are not offered here.
const DESIGNATIONS = [
  "Zonal H/Usher", "Assist Zonal H/Usher",
  "Area H/Usher", "Assist Area H/Usher",
  "Parish H/Usher", "Assist Parish H/Usher", "Usher",
];
const MARITAL = ["Single", "Married", "Widow", "Divorced", "Separated"];
const ORDINATIONS = ["Pastor", "Assistant Pastor", "Deacon", "Deaconess", "Worker", "Member"];
const EDUCATION = ["Primary", "Secondary", "Graduate", "Post Graduate", "Masters", "PhD", "None"];
const SEX = ["Male", "Female"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1965 + 1 }, (_, i) => String(CURRENT_YEAR - i));

type FormState = {
  regionId?: number; provinceId?: number; zone?: string; area?: string; parish?: string;
  designation?: string; gender?: string; dob?: string; maritalStatus?: string;
  whatsapp?: string; homeAddress?: string; occupation?: string; employer?: string;
  officeAddress?: string; education?: string; placeOfWork?: string;
  yearJoinedRccg?: string; yearJoinedUshers?: string;
  ordinationType?: string; ordinationYear?: string; pastorInCharge?: string; areaHqParish?: string;
};

const REQUIRED: (keyof FormState)[] = [
  "regionId", "provinceId", "zone", "area", "parish", "designation",
  "gender", "dob", "maritalStatus", "whatsapp", "homeAddress", "occupation",
  "placeOfWork", "officeAddress", "education", "yearJoinedRccg", "yearJoinedUshers",
  "ordinationType", "ordinationYear", "pastorInCharge", "areaHqParish",
];

const FIELD_LABELS: Partial<Record<keyof FormState, string>> = {
  regionId: "Region", provinceId: "Province", zone: "Zone", area: "Area", parish: "Parish",
  designation: "Designation", gender: "Gender", dob: "Date of Birth", maritalStatus: "Marital Status",
  whatsapp: "WhatsApp Number", homeAddress: "Home Address", occupation: "Occupation",
  placeOfWork: "Place of Work", officeAddress: "Office Address", education: "Highest Education",
  yearJoinedRccg: "Year Joined RCCG", yearJoinedUshers: "Year Joined Ushering",
  ordinationType: "Type of Ordination", ordinationYear: "Year of Current Ordination",
  pastorInCharge: "Name of Pastor in Charge", areaHqParish: "Area HQ Parish",
};

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, refresh } = useAuth();

  const [f, setF] = useState<FormState>({});
  const [regions, setRegions] = useState<HierarchyNode[]>([]);
  const [provinces, setProvinces] = useState<HierarchyNode[]>([]);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("profile_incomplete");
  const [correctionNote, setCorrectionNote] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  // Initial load: regions + existing profile (with dependent lists).
  useEffect(() => {
    (async () => {
      try {
        const [{ regions }, { profile }] = await Promise.all([hierarchyApi.regions(), profileApi.get()]);
        setRegions(regions);
        const fields = profile.fields;
        setStatus(profile.status);
        setCorrectionNote(profile.correctionNote);
        setPassportUrl(fields.passportUrl);
        setSignatureUrl(fields.signatureUrl);
        setF({
          regionId: fields.regionId ?? undefined,
          provinceId: fields.provinceId ?? undefined,
          zone: fields.zone ?? undefined,
          area: fields.area ?? undefined,
          parish: fields.parish ?? undefined,
          designation: fields.designation ?? undefined,
          gender: fields.gender ?? undefined,
          dob: fields.dob ?? undefined,
          maritalStatus: fields.maritalStatus ?? undefined,
          whatsapp: fields.whatsapp ?? undefined,
          homeAddress: fields.homeAddress ?? undefined,
          occupation: fields.occupation ?? undefined,
          employer: fields.employer ?? undefined,
          officeAddress: fields.officeAddress ?? undefined,
          education: fields.education ?? undefined,
          placeOfWork: fields.placeOfWork ?? undefined,
          yearJoinedRccg: fields.yearJoinedRccg ?? undefined,
          yearJoinedUshers: fields.yearJoinedUshers ?? undefined,
          ordinationType: fields.ordinationType ?? undefined,
          ordinationYear: fields.ordinationYear ?? undefined,
          pastorInCharge: fields.pastorInCharge ?? undefined,
          areaHqParish: fields.areaHqParish ?? undefined,
        });
        // Hydrate provinces for the saved region selection.
        if (fields.regionId) setProvinces((await hierarchyApi.provinces(fields.regionId)).provinces);
      } catch (err) {
        if (err instanceof ApiError && err.code === "NO_TOKEN") navigate({ to: "/login" });
        else toast.error("Could not load your profile", { description: "Please refresh and try again." });
      } finally {
        setLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRegion = async (id: number) => {
    set("regionId", id); set("provinceId", undefined);
    setProvinces([]);
    setProvinces((await hierarchyApi.provinces(id)).provinces);
  };

  const payload = (): ProfileFieldsPayload => {
    const p: ProfileFieldsPayload = {};
    (Object.keys(f) as (keyof FormState)[]).forEach((k) => {
      const v = f[k];
      if (v !== undefined && v !== "") (p as Record<string, unknown>)[k] = v;
    });
    return p;
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      await profileApi.update(payload());
      toast.success("Draft saved");
    } catch (err) {
      toast.error("Could not save", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  };

  const missing = (k: keyof FormState) => showErrors && (f[k] === undefined || String(f[k]).trim() === "");

  const handleSubmit = async () => {
    const missingKeys = REQUIRED.filter((k) => f[k] === undefined || String(f[k]).trim() === "");
    if (missingKeys.length) {
      setShowErrors(true);
      const names = missingKeys.map((k) => FIELD_LABELS[k] ?? k);
      const shown = names.slice(0, 4).join(", ");
      const more = names.length > 4 ? ` and ${names.length - 4} more` : "";
      toast.error(`Please complete: ${shown}${more}`, {
        description: "Passport and signature are optional and can be added later.",
      });
      return;
    }
    setSubmitting(true);
    try {
      await profileApi.submit(payload());
      await refresh();
      toast.success("Submitted for review", { description: "You'll be notified once a reviewer takes action." });
      navigate({ to: "/app" });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Submission failed.";
      toast.error("Could not submit", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const uploadFile = async (kind: "passport" | "signature", file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large", { description: "Max 5MB." }); return; }
    try {
      const { url } = await profileApi.upload(kind, file);
      if (kind === "passport") setPassportUrl(url); else setSignatureUrl(url);
      toast.success(`${kind === "passport" ? "Passport" : "Signature"} uploaded`);
    } catch (err) {
      toast.error("Upload failed", { description: err instanceof ApiError ? err.message : undefined });
    }
  };

  const isCorrection = status === "phu_correction" || status === "rhu_correction";

  if (!loaded) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading your profile…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Logo />
          {user && <Badge variant="secondary">{user.email}</Badge>}
        </div>

        <Alert className="border-primary/30 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Welcome to the RCCG National Ushering Portal</AlertTitle>
          <AlertDescription>
            Please complete your profile before your account can be reviewed and approved. All fields marked * are mandatory.
          </AlertDescription>
        </Alert>

        {isCorrection && correctionNote && (
          <Alert className="border-destructive/40 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle>Correction requested</AlertTitle>
            <AlertDescription className="text-foreground">{correctionNote}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border/60 shadow-elegant">
          <div className="bg-gradient-hero text-white p-6 md:p-8 rounded-t-lg">
            <h1 className="text-2xl md:text-3xl font-bold">Complete your profile</h1>
            <p className="text-white/80 mt-1 text-sm">
              {REQUIRED.length} fields required · Status:{" "}
              <span className="font-medium">{status.replace(/_/g, " ")}</span>
            </p>
          </div>

          <CardContent className="p-6 md:p-8 space-y-8">
            <Section title="Church Information">
              <PickNode label="Region" value={f.regionId} options={regions} onChange={onRegion} err={missing("regionId")} />
              <PickNode label="Province" value={f.provinceId} options={provinces} onChange={(id) => set("provinceId", id)} err={missing("provinceId")} disabled={!f.regionId} />
              <Text label="Zone" value={f.zone} onChange={(v) => set("zone", v)} err={missing("zone")} placeholder="e.g. Zone 3" />
              <Text label="Area" value={f.area} onChange={(v) => set("area", v)} err={missing("area")} placeholder="e.g. Area HQ" />
              <Text label="Parish" value={f.parish} onChange={(v) => set("parish", v)} err={missing("parish")} placeholder="Your parish name" />
              <Pick label="Designation" value={f.designation} options={DESIGNATIONS} onChange={(v) => set("designation", v)} err={missing("designation")} />
            </Section>

            <Section title="Personal">
              <Pick label="Gender" value={f.gender} options={SEX} onChange={(v) => set("gender", v)} err={missing("gender")} />
              <Text label="Date of Birth" type="date" value={f.dob} onChange={(v) => set("dob", v)} err={missing("dob")} />
              <Pick label="Year Joined RCCG" value={f.yearJoinedRccg} options={YEARS} onChange={(v) => set("yearJoinedRccg", v)} err={missing("yearJoinedRccg")} />
              <Pick label="Year Joined Ushering" value={f.yearJoinedUshers} options={YEARS} onChange={(v) => set("yearJoinedUshers", v)} err={missing("yearJoinedUshers")} />
              <Pick label="Marital Status" value={f.maritalStatus} options={MARITAL} onChange={(v) => set("maritalStatus", v)} err={missing("maritalStatus")} />
            </Section>

            <Section title="Ordination">
              <Pick label="Type of Ordination" value={f.ordinationType} options={ORDINATIONS} onChange={(v) => set("ordinationType", v)} err={missing("ordinationType")} />
              <Pick label="Year of Current Ordination" value={f.ordinationYear} options={YEARS} onChange={(v) => set("ordinationYear", v)} err={missing("ordinationYear")} />
              <Text label="Name of Pastor in Charge of Parish" value={f.pastorInCharge} onChange={(v) => set("pastorInCharge", v)} err={missing("pastorInCharge")} />
              <Long label="Name and Address of Area HQ Parish" value={f.areaHqParish} onChange={(v) => set("areaHqParish", v)} err={missing("areaHqParish")} />
            </Section>

            <Section title="Professional & Contact">
              <Text label="Place of Work" value={f.placeOfWork} onChange={(v) => set("placeOfWork", v)} err={missing("placeOfWork")} />
              <Text label="Occupation" value={f.occupation} onChange={(v) => set("occupation", v)} err={missing("occupation")} />
              <Text label="Employer (optional)" value={f.employer} onChange={(v) => set("employer", v)} />
              <Text label="WhatsApp Number" value={f.whatsapp} onChange={(v) => set("whatsapp", v)} err={missing("whatsapp")} placeholder="+234 …" />
              <Long label="Office Address" value={f.officeAddress} onChange={(v) => set("officeAddress", v)} err={missing("officeAddress")} />
              <Long label="Home Address" value={f.homeAddress} onChange={(v) => set("homeAddress", v)} err={missing("homeAddress")} />
              <Pick label="Highest Education" value={f.education} options={EDUCATION} onChange={(v) => set("education", v)} err={missing("education")} />
            </Section>

            <Section title="Identification Uploads (optional)">
              <UploadField label="Passport Photograph" icon={<ImageIcon className="h-4 w-4" />} url={passportUrl}
                hint="Optional now — required before applying for an ID Card." onFile={(file) => uploadFile("passport", file)} />
              <UploadField label="Signature" icon={<PenTool className="h-4 w-4" />} url={signatureUrl}
                hint="Optional now — you can upload later from your profile." onFile={(file) => uploadFile("signature", file)} />
            </Section>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <Link to="/app" className="text-sm text-muted-foreground hover:text-primary">Back to dashboard</Link>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveDraft} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save draft"}
                </Button>
                <Button variant="brand" size="lg" onClick={handleSubmit} disabled={submitting}>
                  <CheckCircle2 className="h-4 w-4" />
                  {submitting ? "Submitting…" : isCorrection ? "Resubmit for review" : "Submit profile for approval"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">{title}</h3>
      <div className="grid sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Text({ label, value, onChange, err, className, ...rest }: {
  label: string; value?: string; onChange: (v: string) => void; err?: boolean; className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label>{label} {!label.includes("optional") && <span className="text-destructive">*</span>}</Label>
      <Input value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={err ? "border-destructive" : ""} {...rest} />
    </div>
  );
}

function Long({ label, value, onChange, err }: { label: string; value?: string; onChange: (v: string) => void; err?: boolean }) {
  return (
    <div className="space-y-2 sm:col-span-2">
      <Label>{label} <span className="text-destructive">*</span></Label>
      <Textarea rows={2} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={err ? "border-destructive" : ""} />
    </div>
  );
}

function Pick({ label, value, options, onChange, err }: {
  label: string; value?: string; options: string[]; onChange: (v: string) => void; err?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label} <span className="text-destructive">*</span></Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={err ? "border-destructive" : ""}><SelectValue placeholder="Select…" /></SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function PickNode({ label, value, options, onChange, err, disabled }: {
  label: string; value?: number; options: HierarchyNode[]; onChange: (id: number) => void; err?: boolean; disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label} <span className="text-destructive">*</span></Label>
      <Select value={value ? String(value) : undefined} onValueChange={(v) => onChange(Number(v))} disabled={disabled}>
        <SelectTrigger className={err ? "border-destructive" : ""}>
          <SelectValue placeholder={disabled ? "Select previous first…" : "Select…"} />
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {options.map((o) => <SelectItem key={o.id} value={String(o.id)}>{o.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function UploadField({ label, icon, url, hint, onFile }: {
  label: string; icon: React.ReactNode; url: string | null; hint: string; onFile: (file: File | null) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">{icon}{label} <span className="text-xs text-muted-foreground">(optional)</span></Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
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
