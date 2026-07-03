import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  BedDouble, CalendarClock, CheckCircle2, Lock, QrCode, Users, Wallet, Plus, LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { hostelApi, type EventInput, type HostelInput } from "@/lib/api/hostel.api";
import { runPayment } from "@/lib/api/payments.api";
import { ApiError } from "@/lib/api/client";
import {
  naira, NATIONAL_ROLES, canBookHostel,
  type AdminBooking, type Booking, type Hostel, type HostelEvent, type HostelListResponse,
} from "@/lib/types";

export const Route = createFileRoute("/app/hostel")({
  head: () => ({ meta: [{ title: "Hostel Booking — RNUMS" }] }),
  component: HostelPage,
});

function HostelPage() {
  const { user } = useAuth();
  const isAdmin = !!user && NATIONAL_ROLES.has(user.role);
  const isApproved = user?.status === "approved";
  const eligible = !!user && canBookHostel(user);

  const memberView = !isApproved ? <LockedNotice /> : eligible ? <UserBooking /> : <IneligibleNotice />;

  return (
    <div>
      <AppHeader
        title="Hostel Booking"
        description="Reserve accommodation at the Redemption Camp for the active event."
      />
      <div className="p-4 md:p-6 animate-fade-in">
        {isAdmin ? (
          <Tabs defaultValue="admin">
            <TabsList>
              <TabsTrigger value="book">My Booking</TabsTrigger>
              <TabsTrigger value="admin">Manage</TabsTrigger>
            </TabsList>
            <TabsContent value="book" className="mt-4">{memberView}</TabsContent>
            <TabsContent value="admin" className="mt-4">
              <AdminPanel />
            </TabsContent>
          </Tabs>
        ) : (
          memberView
        )}
      </div>
    </div>
  );
}

function LockedNotice() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-10 text-center text-muted-foreground">
        <Lock className="h-10 w-10 mx-auto mb-3 opacity-40" />
        Hostel booking unlocks once your account is fully approved.
      </CardContent>
    </Card>
  );
}

function IneligibleNotice() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-10 text-center text-muted-foreground">
        <Lock className="h-10 w-10 mx-auto mb-3 opacity-40" />
        Hostel booking is available to Zonal Head Ushers and below. Senior officers oversee bookings rather than reserving a bed.
      </CardContent>
    </Card>
  );
}

// ── User booking ─────────────────────────────────────────────────────────────

function UserBooking() {
  const [data, setData] = useState<HostelListResponse | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, mine] = await Promise.all([hostelApi.list(), hostelApi.myBookings()]);
      setData(list);
      setBookings(mine.bookings);
    } catch (err) {
      toast.error("Could not load hostels", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const payFor = async (bookingId: number) => {
    const res = await runPayment("hostel", bookingId);
    if (res.status === "success") {
      const mine = await hostelApi.myBookings();
      setBookings(mine.bookings);
      const confirmed = mine.bookings.find((b) => b.id === bookingId);
      if (confirmed) setReceipt(confirmed);
      toast.success("Payment successful — booking confirmed");
      await load();
      return true;
    }
    toast.error("Payment not completed", { description: "You can retry payment from ‘My bookings’." });
    return false;
  };

  const book = async (hostel: Hostel) => {
    setBusyId(hostel.id);
    try {
      const { booking } = await hostelApi.book(hostel.id);
      toast.info("Booking reserved — proceeding to payment…");
      await payFor(booking.id);
    } catch (err) {
      toast.error("Could not book", { description: err instanceof ApiError ? err.message : undefined });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const cancel = async (id: number) => {
    try {
      await hostelApi.cancel(id);
      toast.success("Booking cancelled");
      await load();
    } catch (err) {
      toast.error("Could not cancel", { description: err instanceof ApiError ? err.message : undefined });
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading hostels…</p>;

  const event = data?.event;
  const canBook = event?.open && !data?.hasActiveBooking;

  return (
    <div className="space-y-6">
      {/* Event banner */}
      <Card className="border-border/60 shadow-card-elegant overflow-hidden">
        <div className="bg-gradient-hero text-white p-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-6 w-6" />
            <div>
              <p className="font-semibold">{event?.name ?? "No active event"}</p>
              <p className="text-white/70 text-xs">
                {event
                  ? event.open
                    ? "Booking is open"
                    : "Booking window is closed"
                  : "Check back when the next event opens."}
              </p>
            </div>
          </div>
          <Badge className={event?.open ? "bg-success text-white" : "bg-white/20 text-white"}>
            {event?.open ? "Open" : "Closed"}
          </Badge>
        </div>
      </Card>

      {/* My bookings */}
      {bookings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My bookings</h3>
          {bookings.map((b) => (
            <Card key={b.id} className="border-border/60">
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium">{b.hostelName} <span className="text-xs text-muted-foreground">· {b.bookingNumber}</span></p>
                  <p className="text-xs text-muted-foreground">{b.eventName} · {naira(b.priceKobo)}</p>
                </div>
                <Badge className={
                  b.status === "confirmed" ? "bg-success/15 text-success border-success/30"
                  : b.status === "cancelled" ? "bg-destructive/10 text-destructive border-destructive/30"
                  : "bg-gold/15 text-gold-foreground border-gold/30"
                }>{b.status.replace("_", " ")}</Badge>
                {b.status === "confirmed" && b.qrUrl && (
                  <Button size="sm" variant="outline" onClick={() => setReceipt(b)}><QrCode className="h-4 w-4" /> View QR</Button>
                )}
                {b.status === "pending_payment" && (
                  <>
                    <Button size="sm" variant="brand" onClick={() => payFor(b.id)}><Wallet className="h-4 w-4" /> Pay {naira(b.priceKobo)}</Button>
                    <Button size="sm" variant="ghost" onClick={() => cancel(b.id)}>Cancel</Button>
                  </>
                )}
                {b.checkedInAt && <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" /> Checked in</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Hostel list */}
      {!data?.gender ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground">
            Set your gender in your profile to see the hostels available to you.
          </CardContent>
        </Card>
      ) : data.hostels.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="p-8 text-center text-muted-foreground">No {data.gender} hostels are available yet.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.hostels.map((h) => (
            <Card key={h.id} className="border-border/60 shadow-card-elegant overflow-hidden">
              {h.imageUrl ? (
                <img src={h.imageUrl} alt={h.name} className="h-32 w-full object-cover" />
              ) : (
                <div className="h-32 bg-gradient-brand/10 flex items-center justify-center"><BedDouble className="h-10 w-10 text-primary/40" /></div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{h.name}</p>
                  <Badge variant="secondary">{h.gender}</Badge>
                </div>
                {h.description && <p className="text-xs text-muted-foreground line-clamp-2">{h.description}</p>}
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="font-bold text-primary">{naira(h.priceKobo)}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {h.available}/{h.capacity} left
                  </span>
                </div>
                <Button
                  className="w-full mt-2"
                  variant="brand"
                  disabled={!canBook || h.available <= 0 || busyId === h.id}
                  onClick={() => book(h)}
                >
                  {busyId === h.id ? "Processing…"
                    : data.hasActiveBooking ? "Already booked"
                    : !event?.open ? "Booking closed"
                    : h.available <= 0 ? "Full"
                    : "Book & pay"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReceiptDialog booking={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
}

function ReceiptDialog({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  return (
    <Dialog open={!!booking} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Booking confirmed</DialogTitle>
          <DialogDescription>Present this QR code at hostel check-in.</DialogDescription>
        </DialogHeader>
        {booking && (
          <div className="text-center space-y-3">
            {booking.qrUrl && <img src={booking.qrUrl} alt="QR" className="h-48 w-48 mx-auto rounded bg-white p-2 border" />}
            <div className="text-sm">
              <p className="font-semibold">{booking.hostelName}</p>
              <p className="text-muted-foreground">{booking.bookingNumber}</p>
              <p className="text-muted-foreground">{booking.eventName} · {naira(booking.priceKobo)}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Admin panel ──────────────────────────────────────────────────────────────

function AdminPanel() {
  return (
    <div className="space-y-6">
      <EventManager />
      <HostelManager />
      <BookingsTable />
    </div>
  );
}

const emptyEvent: EventInput = { name: "", opensAt: "", closesAt: "", active: true };

function EventManager() {
  const [events, setEvents] = useState<HostelEvent[]>([]);
  const [form, setForm] = useState<EventInput>(emptyEvent);
  const [busy, setBusy] = useState(false);

  const load = async () => setEvents((await hostelApi.adminEvents()).events);
  useEffect(() => { void load(); }, []);

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Event name is required"); return; }
    setBusy(true);
    try {
      await hostelApi.adminUpsertEvent(form);
      toast.success("Event saved");
      setForm(emptyEvent);
      await load();
    } catch (err) {
      toast.error("Could not save event", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base">Booking events</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div className="space-y-1 sm:col-span-2">
            <Label>Event name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Holy Ghost Congress 2026" />
          </div>
          <div className="space-y-1">
            <Label>Opens</Label>
            <Input type="datetime-local" value={form.opensAt} onChange={(e) => setForm({ ...form, opensAt: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Closes</Label>
            <Input type="datetime-local" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Set as active event
          </label>
          <Button variant="brand" onClick={submit} disabled={busy}><Plus className="h-4 w-4" /> Save event</Button>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {events.map((e) => (
            <div key={e.id} className="py-2 flex items-center justify-between text-sm">
              <span>{e.name}</span>
              <Badge className={e.open ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground"}>
                {e.active ? (e.open ? "Active · Open" : "Active · Closed") : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const emptyHostel: HostelInput = { name: "", gender: "Male", capacity: 50, priceKobo: 500000, description: "", imageUrl: "", active: true };

function HostelManager() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [form, setForm] = useState<HostelInput>(emptyHostel);
  const [editId, setEditId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => setHostels((await hostelApi.adminHostels()).hostels);
  useEffect(() => { void load(); }, []);

  const edit = (h: Hostel) => {
    setEditId(h.id);
    setForm({ name: h.name, gender: h.gender, capacity: h.capacity, priceKobo: h.priceKobo, description: h.description ?? "", imageUrl: h.imageUrl ?? "", active: h.active });
  };
  const reset = () => { setEditId(null); setForm(emptyHostel); };

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Hostel name is required"); return; }
    setBusy(true);
    try {
      if (editId) await hostelApi.adminUpdateHostel(editId, form);
      else await hostelApi.adminCreateHostel(form);
      toast.success(editId ? "Hostel updated" : "Hostel created");
      reset();
      await load();
    } catch (err) {
      toast.error("Could not save hostel", { description: err instanceof ApiError ? err.message : undefined });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base">Hostels</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Gender</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as "Male" | "Female" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Capacity</Label>
            <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
          <div className="space-y-1">
            <Label>Price (₦)</Label>
            <Input type="number" value={form.priceKobo / 100} onChange={(e) => setForm({ ...form, priceKobo: Math.round(Number(e.target.value) * 100) })} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label>Image URL (optional)</Label>
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </div>
          <div className="space-y-1 sm:col-span-3">
            <Label>Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm"><Switch checked={!!form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} /> Active</label>
          <div className="ml-auto flex gap-2">
            {editId && <Button variant="ghost" onClick={reset}>Cancel edit</Button>}
            <Button variant="brand" onClick={submit} disabled={busy}>{editId ? "Update" : "Create"}</Button>
          </div>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {hostels.map((h) => (
            <div key={h.id} className="py-2 flex items-center justify-between text-sm gap-3">
              <span className="flex-1">{h.name} <span className="text-muted-foreground">· {h.gender} · {naira(h.priceKobo)} · {h.booked}/{h.capacity}</span></span>
              {!h.active && <Badge variant="secondary">Inactive</Badge>}
              <Button size="sm" variant="outline" onClick={() => edit(h)}>Edit</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BookingsTable() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const load = async () => setBookings((await hostelApi.adminBookings()).bookings);
  useEffect(() => { void load(); }, []);

  const checkIn = async (id: number) => {
    try {
      await hostelApi.adminCheckIn(id);
      toast.success("Checked in");
      await load();
    } catch (err) {
      toast.error("Could not check in", { description: err instanceof ApiError ? err.message : undefined });
    }
  };

  return (
    <Card className="border-border/60 shadow-card-elegant">
      <CardHeader><CardTitle className="text-base">All bookings</CardTitle></CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {bookings.length === 0 && <p className="p-4 text-sm text-muted-foreground">No bookings yet.</p>}
          {bookings.map((b) => (
            <div key={b.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-sm">{b.userName} <span className="text-xs text-muted-foreground">· {b.bookingNumber}</span></p>
                <p className="text-xs text-muted-foreground">{b.hostelName} · {b.userEmail}</p>
              </div>
              <Badge className={
                b.status === "confirmed" ? "bg-success/15 text-success border-success/30"
                : b.status === "cancelled" ? "bg-destructive/10 text-destructive border-destructive/30"
                : "bg-gold/15 text-gold-foreground border-gold/30"
              }>{b.status.replace("_", " ")}</Badge>
              {b.checkedInAt ? (
                <Badge variant="secondary"><CheckCircle2 className="h-3 w-3 mr-1" /> Checked in</Badge>
              ) : b.status === "confirmed" ? (
                <Button size="sm" variant="outline" onClick={() => checkIn(b.id)}><LogIn className="h-4 w-4" /> Check in</Button>
              ) : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
