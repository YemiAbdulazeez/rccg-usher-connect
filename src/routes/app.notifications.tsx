import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppHeader } from "@/components/app/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, AlertTriangle, Clock, ShieldCheck, Wallet, IdCard, BedDouble } from "lucide-react";
import { notificationsApi } from "@/lib/api/notifications.api";
import { ApiError } from "@/lib/api/client";
import type { AppNotification } from "@/lib/types";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — RNUMS" }] }),
  component: NotificationsPage,
});

function iconFor(type: string) {
  if (type.includes("approved") || type.includes("confirmed")) return { icon: CheckCircle2, tone: "bg-success/15 text-success" };
  if (type.includes("correction") || type.includes("rejected")) return { icon: AlertTriangle, tone: "bg-destructive/15 text-destructive" };
  if (type.includes("pending")) return { icon: Clock, tone: "bg-gold/15 text-gold-foreground" };
  if (type.includes("hostel")) return { icon: BedDouble, tone: "bg-accent text-primary" };
  if (type.includes("id_card")) return { icon: IdCard, tone: "bg-accent text-primary" };
  if (type.includes("payment")) return { icon: Wallet, tone: "bg-accent text-primary" };
  if (type.includes("account")) return { icon: ShieldCheck, tone: "bg-accent text-primary" };
  return { icon: Bell, tone: "bg-accent text-primary" };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { notifications } = await notificationsApi.list();
      setItems(notifications);
    } catch (err) {
      if (err instanceof ApiError) toast.error("Could not load notifications", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const markAll = async () => {
    await notificationsApi.readAll();
    setItems((xs) => xs.map((n) => ({ ...n, read: true })));
  };

  const markOne = async (n: AppNotification) => {
    if (n.read) return;
    await notificationsApi.read(n.id);
    setItems((xs) => xs.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <div>
      <AppHeader
        title="Notifications"
        description="Approval updates, payments and account alerts."
        actions={<Button variant="outline" onClick={markAll} disabled={unread === 0}>Mark all read</Button>}
      />
      <div className="p-4 md:p-6 animate-fade-in">
        <Card className="border-border/60 shadow-card-elegant">
          <CardContent className="p-0 divide-y divide-border">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading…</p>
            ) : items.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" /> You have no notifications yet.
              </div>
            ) : (
              items.map((n) => {
                const { icon: Icon, tone } = iconFor(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => markOne(n)}
                    className={`w-full text-left p-4 flex items-start gap-3 hover:bg-accent/40 transition-smooth ${n.read ? "" : "bg-primary/[0.03]"}`}
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{n.title}</p>
                        {!n.read && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                  </button>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
