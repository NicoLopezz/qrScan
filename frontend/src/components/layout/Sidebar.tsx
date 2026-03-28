"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/lavados", label: "Lavados", icon: Droplets },
  { href: "/caja", label: "Ventas", icon: Wallet },
  { href: "/cierres", label: "Cierres", icon: ClipboardCheck },
  { href: "/reservas", label: "Reservas", icon: CalendarCheck },
  { href: "/mensajes", label: "Mensajes", icon: WhatsAppIcon },
  { href: "/equipo", label: "Equipo", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/perfil", label: "Perfil", icon: User },
  { href: "/faq", label: "FAQ", icon: HelpCircle },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen flex-col border-r border-border/40 bg-white dark:bg-[#15131F] transition-all duration-300 hidden md:flex",
        collapsed ? "w-[52px]" : "w-56"
      )}
    >
      {/* Header: logo + collapse toggle */}
      <div className={cn(
        "flex h-14 items-center border-b border-border/40",
        collapsed ? "justify-center px-0" : "justify-between px-4"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-fuchsia">
              <span className="text-[10px] font-bold text-white">PT</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">PickUp Time</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title={collapsed ? "Expandir" : "Colapsar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        <TooltipProvider>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 cursor-pointer",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-brand-purple-muted text-brand-purple"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px] flex-shrink-0", isActive && "text-brand-purple")} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (!collapsed) return <div key={item.href}>{link}</div>;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={link} />
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/40 px-2 py-2">
        <TooltipProvider>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={logout}
                    className="flex w-full items-center justify-center rounded-lg py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer"
                  >
                    <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
                  </button>
                }
              />
              <TooltipContent side="right" sideOffset={8}>
                Cerrar sesion
              </TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 cursor-pointer"
            >
              <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
              <span>Cerrar sesion</span>
            </button>
          )}
        </TooltipProvider>
      </div>
    </aside>
  );
}
