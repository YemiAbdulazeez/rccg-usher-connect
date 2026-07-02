// Local-only profile + approval state for the design prototype.
// Backed by localStorage so changes persist across reloads and are visible
// to PHU/RHU dashboards in the same browser.
import { useEffect, useState, useCallback } from "react";

export type ProfileStatus =
  | "incomplete"
  | "pending_phu"
  | "phu_correction"
  | "phu_approved"
  | "pending_rhu"
  | "rhu_correction"
  | "approved"
  | "rejected";

export type AuditEntry = {
  actor: string;
  role: string;
  action: string;
  comment?: string;
  at: string;
};

export type ProfileFields = {
  region?: string;
  province?: string;
  zone?: string;
  area?: string;
  parish?: string;
  designation?: string;
  sex?: string;
  dob?: string;
  yearJoinedUshering?: string;
  maritalStatus?: string;
  ordination?: string;
  ordinationYear?: string;
  parishInCharge?: string; // Pastor in Charge of Parish
  areaHqParish?: string;
  placeOfWork?: string;
  occupation?: string;
  officeAddress?: string;
  homeAddress?: string;
  whatsapp?: string;
  education?: string;
  passport?: string;   // data URL
  signature?: string;  // data URL
};

export const REQUIRED_FIELDS: (keyof ProfileFields)[] = [
  "region", "province", "zone", "area", "parish", "designation",
  "sex", "dob", "yearJoinedUshering", "maritalStatus", "ordination",
  "ordinationYear", "parishInCharge", "areaHqParish", "placeOfWork",
  "occupation", "officeAddress", "homeAddress", "whatsapp", "education",
  // passport & signature are optional uploads
];

// Update profile fields without changing approval status (in-app profile edit).
export function updateProfileFields(id: string, fields: ProfileFields, actor: string) {
  mutate(id, (p) => ({
    ...p,
    fields: { ...p.fields, ...fields },
    audit: [...p.audit, { actor, role: "Usher", action: "Updated profile details", at: new Date().toISOString() }],
  }));
}

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  status: ProfileStatus;
  fields: ProfileFields;
  audit: AuditEntry[];
  submittedAt?: string;
  correctionNote?: string;
};

const PROFILES_KEY = "rnums.profiles.v1";
const CURRENT_KEY = "rnums.currentUser.v1";

const isBrowser = () => typeof window !== "undefined";

function readAll(): Record<string, Profile> {
  if (!isBrowser()) return {};
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY) || "{}"); }
  catch { return {}; }
}

function writeAll(map: Record<string, Profile>) {
  if (!isBrowser()) return;
  localStorage.setItem(PROFILES_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event("rnums:profiles-changed"));
}

export type CurrentUser = { id: string; email: string; fullName: string; role: string };

export function getCurrentUser(): CurrentUser | null {
  if (!isBrowser()) return null;
  try { return JSON.parse(localStorage.getItem(CURRENT_KEY) || "null"); }
  catch { return null; }
}

export function setCurrentUser(u: CurrentUser | null) {
  if (!isBrowser()) return;
  if (u) localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
  else localStorage.removeItem(CURRENT_KEY);
  // ensure a profile exists for this user
  if (u) {
    const all = readAll();
    if (!all[u.id]) {
      all[u.id] = {
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        status: u.role === "usher" ? "incomplete" : "approved",
        fields: {},
        audit: [],
      };
      writeAll(all);
    }
  }
  window.dispatchEvent(new Event("rnums:current-changed"));
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(() => getCurrentUser());
  useEffect(() => {
    const f = () => setUser(getCurrentUser());
    window.addEventListener("rnums:current-changed", f);
    window.addEventListener("storage", f);
    return () => {
      window.removeEventListener("rnums:current-changed", f);
      window.removeEventListener("storage", f);
    };
  }, []);
  return user;
}

export function useProfile(id: string | undefined) {
  const [p, setP] = useState<Profile | null>(() => (id ? readAll()[id] || null : null));
  useEffect(() => {
    const refresh = () => setP(id ? readAll()[id] || null : null);
    refresh();
    window.addEventListener("rnums:profiles-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("rnums:profiles-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, [id]);
  return p;
}

export function useAllProfiles() {
  const [list, setList] = useState<Profile[]>(() => Object.values(readAll()));
  useEffect(() => {
    const refresh = () => setList(Object.values(readAll()));
    refresh();
    window.addEventListener("rnums:profiles-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("rnums:profiles-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return list;
}

export function isProfileComplete(fields: ProfileFields) {
  return REQUIRED_FIELDS.every((k) => !!fields[k] && String(fields[k]).trim().length > 0);
}

function mutate(id: string, fn: (p: Profile) => Profile) {
  const all = readAll();
  const current = all[id];
  if (!current) return;
  all[id] = fn(current);
  writeAll(all);
}

export function submitProfile(id: string, fields: ProfileFields, actor: string) {
  mutate(id, (p) => ({
    ...p,
    fields,
    status: "pending_phu",
    submittedAt: new Date().toISOString(),
    correctionNote: undefined,
    audit: [
      ...p.audit,
      { actor, role: "Usher", action: "Submitted profile for review", at: new Date().toISOString() },
    ],
  }));
}

export function resubmitProfile(id: string, fields: ProfileFields, actor: string) {
  mutate(id, (p) => {
    const nextStatus: ProfileStatus =
      p.status === "rhu_correction" ? "pending_rhu" : "pending_phu";
    return {
      ...p,
      fields,
      status: nextStatus,
      correctionNote: undefined,
      audit: [
        ...p.audit,
        { actor, role: "Usher", action: `Resubmitted profile (${nextStatus === "pending_rhu" ? "RHU" : "PHU"} review)`, at: new Date().toISOString() },
      ],
    };
  });
}

export type ReviewAction = "approve" | "reject" | "correction";

export function reviewProfile(
  id: string,
  stage: "phu" | "rhu",
  action: ReviewAction,
  reviewer: { name: string; role: string },
  comment?: string,
) {
  mutate(id, (p) => {
    let status: ProfileStatus = p.status;
    let label = "";
    if (stage === "phu") {
      if (action === "approve") { status = "pending_rhu"; label = "PHU approved — forwarded to RHU"; }
      if (action === "reject")  { status = "rejected";     label = "PHU rejected profile"; }
      if (action === "correction") { status = "phu_correction"; label = "PHU requested correction"; }
    } else {
      if (action === "approve") { status = "approved";    label = "RHU final approval — account activated"; }
      if (action === "reject")  { status = "rejected";    label = "RHU rejected profile"; }
      if (action === "correction") { status = "rhu_correction"; label = "RHU requested correction"; }
    }
    return {
      ...p,
      status,
      correctionNote: action === "correction" ? comment : p.correctionNote,
      audit: [
        ...p.audit,
        { actor: reviewer.name, role: reviewer.role, action: label, comment, at: new Date().toISOString() },
      ],
    };
  });
}

export const STATUS_LABEL: Record<ProfileStatus, string> = {
  incomplete: "Profile Incomplete",
  pending_phu: "Pending PHU Approval",
  phu_correction: "PHU Correction Requested",
  phu_approved: "PHU Approved",
  pending_rhu: "Pending RHU Final Approval",
  rhu_correction: "RHU Correction Requested",
  approved: "Approved / Active",
  rejected: "Rejected",
};

export const STATUS_TONE: Record<ProfileStatus, string> = {
  incomplete: "bg-muted text-muted-foreground border-border",
  pending_phu: "bg-gold/15 text-gold-foreground border-gold/30",
  phu_correction: "bg-destructive/10 text-destructive border-destructive/30",
  phu_approved: "bg-primary/10 text-primary border-primary/30",
  pending_rhu: "bg-gold/15 text-gold-foreground border-gold/30",
  rhu_correction: "bg-destructive/10 text-destructive border-destructive/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

export function useStatusGate() {
  const user = useCurrentUser();
  const profile = useProfile(user?.id);
  const isUsher = user?.role === "usher";
  const blocked = isUsher && (!profile || profile.status === "incomplete");
  const needsResubmit = isUsher && (profile?.status === "phu_correction" || profile?.status === "rhu_correction");
  return { user, profile, isUsher, blocked, needsResubmit };
}

export function useProfileActions() {
  const user = useCurrentUser();
  return useCallback(
    (fields: ProfileFields) => {
      if (!user) return;
      const existing = readAll()[user.id];
      if (existing?.status === "phu_correction" || existing?.status === "rhu_correction") {
        resubmitProfile(user.id, fields, user.fullName);
      } else {
        submitProfile(user.id, fields, user.fullName);
      }
    },
    [user],
  );
}
