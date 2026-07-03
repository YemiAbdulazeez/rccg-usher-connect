// Shared DTO types mirroring the backend API responses.

export type ProfileStatus =
  | "profile_incomplete"
  | "pending_phu"
  | "phu_correction"
  | "phu_approved"
  | "pending_rhu"
  | "rhu_correction"
  | "approved"
  | "rejected";

export type AuthUser = {
  id: number;
  email: string;
  role: string;
  roleRank: number;
  status: ProfileStatus;
  profileComplete: boolean;
  firstName: string;
  lastName: string;
  regionId: number | null;
  provinceId: number | null;
  unread?: number;
};

export type HierarchyNode = { id: number; name: string; code: string };

export type ProfileFields = {
  regionId: number | null;
  provinceId: number | null;
  zone: string | null;
  area: string | null;
  parish: string | null;
  designation: string | null;
  gender: string | null;
  dob: string | null;
  maritalStatus: string | null;
  whatsapp: string | null;
  homeAddress: string | null;
  occupation: string | null;
  employer: string | null;
  officeAddress: string | null;
  education: string | null;
  placeOfWork: string | null;
  yearJoinedRccg: string | null;
  yearJoinedUshers: string | null;
  ordinationType: string | null;
  ordinationYear: string | null;
  pastorInCharge: string | null;
  areaHqParish: string | null;
  passportUrl: string | null;
  signatureUrl: string | null;
};

export type ProfileLocation = {
  regionName: string | null;
  provinceName: string | null;
  zoneName: string | null;
  areaName: string | null;
  parishName: string | null;
};

export type ApprovalHistoryEntry = {
  stage: string;
  action: string;
  actorRole: string | null;
  comment: string | null;
  at: string;
};

export type Profile = {
  status: ProfileStatus;
  profileComplete: boolean;
  correctionNote: string | null;
  fields: ProfileFields;
  location: ProfileLocation;
  history: ApprovalHistoryEntry[];
};

export type AppNotification = {
  id: number;
  type: string;
  title: string;
  body: string;
  channel: string;
  meta: Record<string, unknown> | null;
  read: boolean;
  createdAt: string;
};

export const STATUS_LABEL: Record<ProfileStatus, string> = {
  profile_incomplete: "Profile Incomplete",
  pending_phu: "Pending PHU Approval",
  phu_correction: "PHU Correction Requested",
  phu_approved: "PHU Approved",
  pending_rhu: "Pending RHU Final Approval",
  rhu_correction: "RHU Correction Requested",
  approved: "Approved / Active",
  rejected: "Rejected",
};

export const STATUS_TONE: Record<ProfileStatus, string> = {
  profile_incomplete: "bg-muted text-muted-foreground border-border",
  pending_phu: "bg-gold/15 text-gold-foreground border-gold/30",
  phu_correction: "bg-destructive/10 text-destructive border-destructive/30",
  phu_approved: "bg-primary/10 text-primary border-primary/30",
  pending_rhu: "bg-gold/15 text-gold-foreground border-gold/30",
  rhu_correction: "bg-destructive/10 text-destructive border-destructive/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

export const ADMIN_ROLES = new Set([
  "super",
  "nhu",
  "anhu",
  "national_exec",
  "rhu",
  "arhu",
  "phu",
  "aphu",
]);

// Reviewer roles that can access the approvals queue.
export const REVIEWER_ROLES = new Set(["phu", "aphu", "rhu", "arhu", "super", "nhu", "anhu", "national_exec"]);
// National-tier roles that can access the Super Admin console.
export const NATIONAL_ROLES = new Set(["super", "nhu", "anhu", "national_exec"]);

// Senior roles a Super Admin can create accounts for (never self-registerable).
export const OFFICER_ROLE_OPTIONS: { slug: string; name: string; scope: "national" | "region" | "province" }[] = [
  { slug: "nhu", name: "National Head Usher", scope: "national" },
  { slug: "anhu", name: "Assistant National Head Usher", scope: "national" },
  { slug: "national_exec", name: "National Executive", scope: "national" },
  { slug: "rhu", name: "Regional Head Usher", scope: "region" },
  { slug: "arhu", name: "Assistant Regional Head Usher", scope: "region" },
  { slug: "phu", name: "Provincial Head Usher", scope: "province" },
  { slug: "aphu", name: "Assistant Provincial Head Usher", scope: "province" },
];

// Hostel booking is reserved for Zonal Head Ushers and below (rank >= 80),
// and is open to both approved and non-approved ushers.
export const HOSTEL_MIN_RANK = 80;
export const canBookHostel = (u: Pick<AuthUser, "roleRank">) =>
  u.roleRank >= HOSTEL_MIN_RANK;

// ── Approvals ────────────────────────────────────────────────────────────────
export type QueueItem = {
  id: number;
  name: string;
  email: string;
  status: ProfileStatus;
  stage: "phu" | "rhu";
  designation: string | null;
  region: string | null;
  province: string | null;
  parish: string | null;
  submittedAt: string | null;
};

export type ApplicantDetail = {
  applicant: { id: number; name: string; email: string; status: ProfileStatus };
  profile: Profile;
};

// ── Hostel ───────────────────────────────────────────────────────────────────
export type Hostel = {
  id: number;
  name: string;
  gender: "Male" | "Female";
  capacity: number;
  priceKobo: number;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  booked: number;
  available: number;
};

export type HostelEvent = {
  id: number;
  name: string;
  opensAt: string | null;
  closesAt: string | null;
  active: boolean;
  open: boolean;
};

export type HostelListResponse = {
  gender: string | null;
  event: HostelEvent | null;
  hostels: Hostel[];
  hasActiveBooking: boolean;
};

export type Booking = {
  id: number;
  bookingNumber: string;
  hostelId: number;
  hostelName: string;
  gender: string;
  eventId: number | null;
  eventName: string | null;
  priceKobo: number;
  status: "pending_payment" | "confirmed" | "cancelled";
  qrUrl: string | null;
  checkedInAt: string | null;
  paymentStatus: string | null;
  paymentReference: string | null;
  createdAt: string;
};

export type AdminBooking = Booking & { userName: string; userEmail: string };

// ── Payments ─────────────────────────────────────────────────────────────────
export type PaymentInit = {
  reference: string;
  amountKobo: number;
  authorizationUrl: string | null;
  mock: boolean;
};

export type PaymentVerify = {
  reference: string;
  status: "success" | "failed";
  purpose: "hostel" | "id_card";
  relatedId: number | null;
};

export type PaymentRecord = {
  reference: string;
  purpose: string;
  relatedId: number | null;
  amountKobo: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
};

// ── ID Cards ─────────────────────────────────────────────────────────────────
export type IdCardStatus = "submitted" | "approved" | "printing" | "completed";

export type IdCardApplication = {
  id: number;
  applicationNumber: string;
  status: IdCardStatus;
  paid: boolean;
  paymentReference: string | null;
  snapshot: Record<string, string | null> | null;
  passportUrl: string | null;
  signatureUrl: string | null;
  qrUrl: string | null;
  qrPayload: string | null;
  createdAt: string;
};

export type AdminIdCard = IdCardApplication & { userName: string; userEmail: string };

// ── Admin ────────────────────────────────────────────────────────────────────
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: ProfileStatus;
  role: string;
  roleName: string;
  region: string | null;
  province: string | null;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminStats = {
  users: { total: number; approved: number; pending: number; incomplete: number; rejected: number; byStatus: Record<string, number> };
  idCards: { byStatus: Record<string, number>; total: number };
  bookings: { total: number; confirmed: number; checkedIn: number };
  revenue: { totalKobo: number; count: number };
  hierarchy: { regions: number; provinces: number; zones: number; areas: number; parishes: number };
};

export type AuditLog = {
  id: number;
  action: string;
  entity: string;
  entityId: string | null;
  ip: string | null;
  meta: Record<string, unknown> | null;
  actor: string;
  actorEmail: string | null;
  at: string;
};

export const naira = (kobo: number) => `₦${(kobo / 100).toLocaleString("en-NG")}`;
