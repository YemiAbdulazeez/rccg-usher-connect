import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { StatCard } from "@/components/app/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, CheckCircle2, Clock, Wallet, ShieldCheck, Network, ScrollText, Trash2,
  UserPlus, IdCard, BedDouble, ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { adminApi } from "@/lib/api/admin.api";
import { hierarchyApi } from "@/lib/api/hierarchy.api";
import { ApiError } from "@/lib/api/client";
import {
  naira, NATIONAL_ROLES,
  type AdminStats, type AdminUser, type AuditLog, type HierarchyNode,
} from "@/lib/types";

export const Route = createFileRoute("/app/admin")({
  head: () => ({ meta: [{ title: "Admin Console — RNUMS" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const isNational = !!user && NATIONAL_ROLES.has(user.role);
  const isSuper = user?.role === "super";

  if (!isNational) {
    return (
      <div>
        <AppHeader title="Admin Console" description="National administration." />
        <div className="p-6">
          <Card className="border-border/60">
            <CardContent className="p-10 text-center text-muted-foreground">
              <ShieldAlert className="h-10 w-10 mx-auto mb-3 opacity-40" />
              This console is restricted to national administrators.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader
        title="Super Admin Console"
        description="Reviewers, church hierarchy, audit trail and system oversight."
      />
      <div className="p-4 md:p-6 animate-fade-in">
        <Tabs defaultValue="overview">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviewers">Reviewers &amp; Users</TabsTrigger>
            <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4"><Overview /></TabsContent>
          <TabsContent value="reviewers" className="mt-4"><Reviewers canWrite={isSuper} /></TabsContent>
          <TabsContent value="hierarchy" className="mt-4"><HierarchyManager canWrite={isSuper} /></TabsContent>
          <TabsContent value="audit" className="mt-4"><AuditLogs /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────────────

function Overview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats().then(setStats).catch((err) => {
      if (err instanceof ApiError) toast.error("Could not load stats", { description: err.message });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!stats) return <p className="text-sm text-muted-foreground">No data.</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total ushers" value={stats.users.total} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Approved" value={stats.users.approved} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label="Pending review" value={stats.users.pending} icon={<Clock className="h-5 w-5" />} tone="gold" />
        <StatCard label="Revenue" value={naira(stats.revenue.totalKobo)} icon={<Wallet className="h-5 w-5" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 shadow-card-elegant">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BedDouble className="h-4 w-4 text-primary" /> Hostel bookings</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row k="Total" v={stats.bookings.total} />
            <Row k="Confirmed" v={stats.bookings.confirmed} />
            <Row k="Checked in" v={stats.bookings.checkedIn} />
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card-elegant">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><IdCard className="h-4 w-4 text-primary" /> ID cards</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row k="Total" v={stats.idCards.total} />
            {Object.entries(stats.idCards.byStatus).map(([k, v]) => <Row key={k} k={k} v={v} />)}
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card-elegant">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Network className="h-4 w-4 text-primary" /> Hierarchy</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <Row k="Regions" v={stats.hierarchy.regions} />
            <Row k="Provinces" v={stats.hierarchy.provinces} />
            <Row k="Zones" v={stats.hierarchy.zones} />
            <Row k="Areas" v={stats.hierarchy.areas} />
            <Row k="Parishes" v={stats.hierarchy.parishes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: number | string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground capitalize">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}

// ── Reviewers & Users ────────────────────────────────────────────────────────

const emptyReviewer = { firstName: "", lastName: "", email: "", phone: "", password: "" };

function Reviewers({ canWrite }: { canWrite: boolean }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await adminApi.users({
        role: roleFilter === "all" ? undefined : roleFilter,
        search: search.trim() || undefined,
      });
      setUsers(users);
    } catch (err) {
      if (err instanceof ApiError) toast.error("Could not load users", { description: err.message });
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="space-y-6">
      {canWrite ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <CreatePhu onCreated={load} />
          <CreateRhu onCreated={load} />
        </div>
      ) : (
        <Card className="border-gold/40 bg-gold/5">
          <CardContent className="p-4 text-sm text-muted-foreground flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-gold-foreground" /> Only the Super Admin can create reviewer accounts.
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 shadow-card-elegant">
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle className="text-base">Users</CardTitle>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="usher">Ushers</SelectItem>
                <SelectItem value="phu">PHU</SelectItem>
                <SelectItem value="rhu">RHU</SelectItem>
                <SelectItem value="super">Super Admin</SelectItem>
              </SelectContent>
            </Select>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name/email…" className="h-9 w-48" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          ) : users.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No users match.</p>
          ) : (
            <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
              {users.map((u) => (
                <div key={u.id} className="p-3 flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email} · {[u.region, u.province].filter(Boolean).join(" / ") || "—"}</p>
                  </div>
                  <Badge variant="secondary" className="uppercase text-[10px]">{u.roleName}</Badge>
                  <Badge variant="outline" className="text-[10px]">{u.status.replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreatePhu({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState(emptyReviewer);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!provinceId) { toast.error("Select a province"); return; }
    if (!form.firstName || !form.lastName || !form.email || form.password.length < 8) {
      toast.error("Fill all fields (password min 8 chars)"); return;
    }
    setBusy(true);
    try {
      await adminApi.createPhu({ ...form, phone: form.phone || undefined, provinceId });
      toast.success("PHU created", { description: `${form.firstName} can now sign in.` });
      setForm(emptyReviewer); setRegionId(null); setProvinceId(null);
      onCreated();
    } catch (err) {
      toast.error("Could not create PHU", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Create Provincial Head Usher</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <ReviewerFields form={form} setForm={setForm} />
        <RegionProvincePicker regionId={regionId} provinceId={provinceId} onRegion={setRegionId} onProvince={setProvinceId} />
        <Button variant="brand" className="w-full" onClick={submit} disabled={busy}>{busy ? "Creating…" : "Create PHU"}</Button>
        <p className="text-xs text-muted-foreground">Region is auto-linked from the selected province.</p>
      </CardContent>
    </Card>
  );
}

function CreateRhu({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState(emptyReviewer);
  const [regions, setRegions] = useState<HierarchyNode[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { hierarchyApi.regions().then((r) => setRegions(r.regions)).catch(() => {}); }, []);

  const submit = async () => {
    if (!regionId) { toast.error("Select a region"); return; }
    if (!form.firstName || !form.lastName || !form.email || form.password.length < 8) {
      toast.error("Fill all fields (password min 8 chars)"); return;
    }
    setBusy(true);
    try {
      await adminApi.createRhu({ ...form, phone: form.phone || undefined, regionId });
      toast.success("RHU created", { description: `${form.firstName} can now sign in.` });
      setForm(emptyReviewer); setRegionId(null);
      onCreated();
    } catch (err) {
      toast.error("Could not create RHU", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Create Regional Head Usher</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <ReviewerFields form={form} setForm={setForm} />
        <div className="space-y-1">
          <Label>Region</Label>
          <Select value={regionId ? String(regionId) : undefined} onValueChange={(v) => setRegionId(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Select region…" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {regions.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="brand" className="w-full" onClick={submit} disabled={busy}>{busy ? "Creating…" : "Create RHU"}</Button>
      </CardContent>
    </Card>
  );
}

function ReviewerFields({ form, setForm }: { form: typeof emptyReviewer; setForm: (f: typeof emptyReviewer) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>First name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
        <div className="space-y-1"><Label>Last name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
      </div>
      <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-1"><Label>Temp. password</Label><Input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 chars" /></div>
      </div>
    </>
  );
}

function RegionProvincePicker({ regionId, provinceId, onRegion, onProvince }: {
  regionId: number | null; provinceId: number | null;
  onRegion: (id: number) => void; onProvince: (id: number) => void;
}) {
  const [regions, setRegions] = useState<HierarchyNode[]>([]);
  const [provinces, setProvinces] = useState<HierarchyNode[]>([]);

  useEffect(() => { hierarchyApi.regions().then((r) => setRegions(r.regions)).catch(() => {}); }, []);
  useEffect(() => {
    if (regionId) hierarchyApi.provinces(regionId).then((r) => setProvinces(r.provinces)).catch(() => {});
    else setProvinces([]);
  }, [regionId]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1">
        <Label>Region</Label>
        <Select value={regionId ? String(regionId) : undefined} onValueChange={(v) => onRegion(Number(v))}>
          <SelectTrigger><SelectValue placeholder="Region…" /></SelectTrigger>
          <SelectContent className="max-h-72">{regions.map((r) => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Province</Label>
        <Select value={provinceId ? String(provinceId) : undefined} onValueChange={(v) => onProvince(Number(v))} disabled={!regionId}>
          <SelectTrigger><SelectValue placeholder="Province…" /></SelectTrigger>
          <SelectContent className="max-h-72">{provinces.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ── Hierarchy manager ────────────────────────────────────────────────────────

function HierarchyManager({ canWrite }: { canWrite: boolean }) {
  const [regions, setRegions] = useState<HierarchyNode[]>([]);
  const [provinces, setProvinces] = useState<HierarchyNode[]>([]);
  const [zones, setZones] = useState<HierarchyNode[]>([]);
  const [areas, setAreas] = useState<HierarchyNode[]>([]);
  const [parishes, setParishes] = useState<HierarchyNode[]>([]);
  const [regionId, setRegionId] = useState<number | null>(null);
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [zoneId, setZoneId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);

  const loadRegions = useCallback(() => hierarchyApi.regions().then((r) => setRegions(r.regions)), []);
  useEffect(() => { void loadRegions(); }, [loadRegions]);

  const reloadProvinces = useCallback(() => { if (regionId) hierarchyApi.provinces(regionId).then((r) => setProvinces(r.provinces)); }, [regionId]);
  const reloadZones = useCallback(() => { if (provinceId) hierarchyApi.zones(provinceId).then((r) => setZones(r.zones)); }, [provinceId]);
  const reloadAreas = useCallback(() => { if (zoneId) hierarchyApi.areas(zoneId).then((r) => setAreas(r.areas)); }, [zoneId]);
  const reloadParishes = useCallback(() => { if (areaId) hierarchyApi.parishes(areaId).then((r) => setParishes(r.parishes)); }, [areaId]);

  useEffect(() => { setProvinces([]); setProvinceId(null); reloadProvinces(); }, [regionId, reloadProvinces]);
  useEffect(() => { setZones([]); setZoneId(null); reloadZones(); }, [provinceId, reloadZones]);
  useEffect(() => { setAreas([]); setAreaId(null); reloadAreas(); }, [zoneId, reloadAreas]);
  useEffect(() => { setParishes([]); reloadParishes(); }, [areaId, reloadParishes]);

  return (
    <div className="grid gap-4 lg:grid-cols-5 md:grid-cols-2">
      <Level
        title="Regions" nodes={regions} selectedId={regionId} onSelect={setRegionId} canWrite={canWrite}
        onAdd={async (name, code) => { await adminApi.createRegion({ name, code }); await loadRegions(); }}
        onDelete={async (id) => { await adminApi.removeHierarchy("regions", id); await loadRegions(); if (regionId === id) setRegionId(null); }}
      />
      <Level
        title="Provinces" nodes={provinces} selectedId={provinceId} onSelect={setProvinceId} canWrite={canWrite} disabled={!regionId}
        onAdd={async (name, code) => { await adminApi.createProvince({ regionId: regionId!, name, code }); reloadProvinces(); }}
        onDelete={async (id) => { await adminApi.removeHierarchy("provinces", id); reloadProvinces(); }}
      />
      <Level
        title="Zones" nodes={zones} selectedId={zoneId} onSelect={setZoneId} canWrite={canWrite} disabled={!provinceId}
        onAdd={async (name, code) => { await adminApi.createZone({ provinceId: provinceId!, name, code }); reloadZones(); }}
        onDelete={async (id) => { await adminApi.removeHierarchy("zones", id); reloadZones(); }}
      />
      <Level
        title="Areas" nodes={areas} selectedId={areaId} onSelect={setAreaId} canWrite={canWrite} disabled={!zoneId}
        onAdd={async (name, code) => { await adminApi.createArea({ zoneId: zoneId!, name, code }); reloadAreas(); }}
        onDelete={async (id) => { await adminApi.removeHierarchy("areas", id); reloadAreas(); }}
      />
      <Level
        title="Parishes" nodes={parishes} selectedId={null} onSelect={() => {}} canWrite={canWrite} disabled={!areaId}
        onAdd={async (name, code) => { await adminApi.createParish({ areaId: areaId!, name, code }); reloadParishes(); }}
        onDelete={async (id) => { await adminApi.removeHierarchy("parishes", id); reloadParishes(); }}
      />
    </div>
  );
}

function Level({ title, nodes, selectedId, onSelect, onAdd, onDelete, canWrite, disabled }: {
  title: string;
  nodes: HierarchyNode[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onAdd: (name: string, code: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  canWrite: boolean;
  disabled?: boolean;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!name.trim() || !code.trim()) { toast.error("Name and code are required"); return; }
    setBusy(true);
    try {
      await onAdd(name.trim(), code.trim());
      setName(""); setCode("");
      toast.success(`${title.slice(0, -1)} added`);
    } catch (err) {
      toast.error("Could not add", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: number) => {
    try { await onDelete(id); toast.success("Deleted"); }
    catch (err) { toast.error("Could not delete", { description: err instanceof ApiError ? err.message : "It may have children." }); }
  };

  return (
    <Card className={`border-border/60 shadow-card-elegant ${disabled ? "opacity-60" : ""}`}>
      <CardHeader className="pb-2"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="max-h-56 overflow-y-auto divide-y divide-border/50 border border-border rounded-md">
          {nodes.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">{disabled ? "Select the parent first." : "None yet."}</p>
          ) : nodes.map((n) => (
            <div
              key={n.id}
              className={`p-2 flex items-center gap-1 text-xs ${selectedId === n.id ? "bg-primary/5" : ""} ${onSelect.length ? "cursor-pointer hover:bg-accent/40" : ""}`}
              onClick={() => onSelect(n.id)}
            >
              <span className="flex-1 truncate">{n.name} <span className="text-muted-foreground">· {n.code}</span></span>
              {canWrite && (
                <button
                  onClick={(e) => { e.stopPropagation(); void del(n.id); }}
                  className="text-muted-foreground hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
        {canWrite && !disabled && (
          <div className="space-y-1">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-8 text-xs" />
            <div className="flex gap-1">
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code" className="h-8 text-xs" />
              <Button size="sm" variant="outline" className="h-8 px-2" onClick={add} disabled={busy}>Add</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Audit logs ───────────────────────────────────────────────────────────────

function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.auditLogs().then(({ logs }) => setLogs(logs)).catch((err) => {
      if (err instanceof ApiError) toast.error("Could not load logs", { description: err.message });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><ScrollText className="h-4 w-4 text-primary" /> Audit trail</CardTitle></CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : logs.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No audit entries yet.</p>
        ) : (
          <div className="divide-y divide-border max-h-[560px] overflow-y-auto">
            {logs.map((l) => (
              <div key={l.id} className="p-3 flex items-start gap-3 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">
                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{l.action}</span>{" "}
                    <span className="text-muted-foreground">on {l.entity}{l.entityId ? ` #${l.entityId}` : ""}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{l.actor}{l.ip ? ` · ${l.ip}` : ""} · {new Date(l.at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
