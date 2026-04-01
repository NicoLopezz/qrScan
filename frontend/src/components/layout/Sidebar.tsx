"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Droplets,
  Wallet,
  CalendarCheck,
  User,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  CreditCard,
  Users,
  ClipboardCheck,
  Contact,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useAuth } from "@/providers/AuthProvider";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const navItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, anim: "group-hover/nav:rotate-12" },
  { href: "/lavados", labelKey: "lavados", icon: Droplets, anim: "group-hover/nav:translate-y-[-2px] group-hover/nav:scale-110" },
  { href: "/caja", labelKey: "ventas", icon: Wallet, anim: "group-hover/nav:rotate-[-8deg] group-hover/nav:scale-110" },
  { href: "/cierres", labelKey: "arqueos", icon: ClipboardCheck, anim: "group-hover/nav:scale-110" },
  { href: "/reservas", labelKey: "reservas", icon: CalendarCheck, anim: "group-hover/nav:rotate-12" },
  { href: "/mensajes", labelKey: "mensajes", icon: WhatsAppIcon, anim: "group-hover/nav:rotate-[-12deg] group-hover/nav:scale-110" },
  { href: "/clientes", labelKey: "clientes", icon: Contact, anim: "group-hover/nav:scale-110" },
  { href: "/equipo", labelKey: "equipo", icon: Users, anim: "group-hover/nav:scale-110" },
  { href: "/billing", labelKey: "billing", icon: CreditCard, anim: "group-hover/nav:translate-x-[2px] group-hover/nav:rotate-[-6deg]" },
  { href: "/perfil", labelKey: "perfil", icon: User, anim: "group-hover/nav:scale-110 group-hover/nav:translate-y-[-1px]" },
  { href: "/faq", labelKey: "faq", icon: HelpCircle, anim: "group-hover/nav:rotate-[20deg]" },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const t = useTranslations("nav");
  const tc = useTranslations("common");

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex-col border-r border-border/40 bg-white dark:bg-sidebar transition-all duration-300 hidden md:flex",
        collapsed ? "w-[52px]" : "w-56"
      )}
    >
      {/* Header: logo */}
      <div className="flex h-14 items-center border-b border-border/40 px-3 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground flex-shrink-0">
            <span className="text-[10px] font-bold text-background">PT</span>
          </div>
          <span className={cn(
            "text-sm font-semibold tracking-tight text-foreground whitespace-nowrap transition-all duration-300",
            collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
          )}>PickUp Time</span>
        </div>
      </div>

      {/* Collapse/expand toggle — floating at edge */}
      <button
        onClick={onToggle}
        className="absolute top-[1.1rem] -right-3 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-white dark:bg-sidebar text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm transition-colors cursor-pointer"
        title={collapsed ? t("expand") : t("collapse")}
      >
        {collapsed ? <PanelLeft className="h-3 w-3" /> : <PanelLeftClose className="h-3 w-3" />}
      </button>

      {/* Nav */}
      <nav data-tour="sidebar-nav" className="flex-1 space-y-0.5 px-2 py-3">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const label = t(item.labelKey);
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group/nav flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 cursor-pointer",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0 transition-all duration-300 ease-out group-hover/nav:text-foreground", item.anim, isActive && "text-foreground")} />
                <span className={cn(
                  "whitespace-nowrap transition-all duration-300 overflow-hidden",
                  collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                )}>{label}</span>
              </Link>
            );

            if (!collapsed) return <div key={item.href}>{link}</div>;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={link} />
                <TooltipContent side="right" sideOffset={8}>
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/40 px-2 py-2 overflow-hidden">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  onClick={logout}
                  className={cn(
                    "group/nav flex w-full items-center gap-2.5 rounded-lg py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer",
                    collapsed ? "justify-center px-0" : "px-2.5"
                  )}
                >
                  <LogOut className="h-[18px] w-[18px] flex-shrink-0 transition-transform duration-300 ease-out group-hover/nav:translate-x-[-2px]" />
                  <span className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
                  )}>{tc("logout")}</span>
                </button>
              }
            />
            {collapsed && (
              <TooltipContent side="right" sideOffset={8}>
                {tc("logout")}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}
