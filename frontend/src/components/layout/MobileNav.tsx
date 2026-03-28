"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Droplets,
  Wallet,
  CalendarCheck,
  CreditCard,
  Users,
  ClipboardCheck,
  User,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const mobileNavItems = [
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

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="!w-64 !gap-0 bg-white dark:bg-[#15131F] !border-0 !p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="flex h-14 items-center justify-center border-b border-border/40 px-4 !gap-0">
          <SheetTitle className="text-lg font-bold">
            <span className="text-brand-orange">PickUp</span>{" "}
            <span className="text-foreground">Time</span>
          </SheetTitle>
        </SheetHeader>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 border-b border-border/40">
            <p className="text-sm font-medium text-foreground">{user.localName || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.permiso}</p>
          </div>
        )}

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto space-y-0.5 px-2 py-3">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-purple-muted text-brand-purple"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout - pinned to bottom */}
        <div className="mt-auto border-t border-border/40 px-2 py-3">
          <button
            onClick={() => {
              onOpenChange(false);
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            <span>Salir</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
