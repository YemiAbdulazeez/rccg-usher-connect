import { ReactNode, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { notificationsApi } from "@/lib/api/notifications.api";

interface AppHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function AppHeader({ title, description, actions }: AppHeaderProps) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    notificationsApi
      .list()
      .then(({ unread }) => active && setUnread(unread))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2 px-4 md:px-6 h-14">
        <SidebarTrigger />
        <form
          className="hidden md:flex items-center gap-2 ml-2 flex-1 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            const q = new FormData(e.currentTarget).get("q");
            toast.info(`Searching for "${q}"`, { description: "Indexed across ushers, events and parishes." });
          }}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input name="q" placeholder="Search ushers, events, parishes…" className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-background" />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/app/notifications" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-destructive text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>
      <div className="px-4 md:px-6 py-4 md:py-5 border-t border-border/60 bg-gradient-subtle">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
