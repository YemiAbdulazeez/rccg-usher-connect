import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, BedDouble, IdCard, Wallet, ShieldCheck, UserCog, Bell,
  LogOut, Settings, type LucideIcon,
} from "lucide-react";

import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/site/Logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthProvider";
import { canBookHostel, NATIONAL_ROLES, REVIEWER_ROLES, type AuthUser } from "@/lib/types";

type NavItem = { title: string; url: string; icon: LucideIcon; show: (u: AuthUser) => boolean };
type NavGroup = { label: string; items: NavItem[] };

// Hostel is available to approved Zonal-Head-Ushers-and-below (who can book) and to
// national admins (who manage hostels). ID Card & Payments are "other modules" that
// unlock with full access later.
const canSeeHostel = (u: AuthUser) => canBookHostel(u) || NATIONAL_ROLES.has(u.role);

const GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/app", icon: LayoutDashboard, show: () => true },
      { title: "Notifications", url: "/app/notifications", icon: Bell, show: () => true },
      { title: "My Profile", url: "/app/profile", icon: UserCog, show: () => true },
    ],
  },
  {
    label: "Membership",
    items: [
      { title: "Hostel Booking", url: "/app/hostel", icon: BedDouble, show: canSeeHostel },
      // ID Card & Payment History are gated until "full access" is granted.
      { title: "ID Card", url: "/app/id-cards", icon: IdCard, show: () => false },
      { title: "Payment History", url: "/app/payments", icon: Wallet, show: () => false },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Approvals", url: "/app/approvals", icon: ShieldCheck, show: (u) => REVIEWER_ROLES.has(u.role) },
      { title: "Admin Console", url: "/app/admin", icon: Settings, show: (u) => NATIONAL_ROLES.has(u.role) },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const isActive = (url: string) =>
    url === "/app" ? pathname === "/app" : pathname === url || pathname.startsWith(url + "/");

  const visibleGroups = user
    ? GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.show(user)) })).filter((g) => g.items.length > 0)
    : [];

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link to="/app" className="flex items-center">
          {collapsed ? <Logo showText={false} variant="light" /> : <Logo variant="light" />}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <Link to={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 ring-2 ring-sidebar-primary/30">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
              {fullName ? fullName.split(" ").map((s) => s[0]).slice(0, 2).join("") : "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate text-sidebar-foreground">{fullName || "Usher"}</p>
              <p className="text-[11px] text-sidebar-foreground/60 truncate">{user?.role ?? "usher"}</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              title="Sign out"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
