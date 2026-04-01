"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
  Contact,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

const mobileNavItems = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/lavados", labelKey: "lavados", icon: Droplets },
  { href: "/caja", labelKey: "ventas", icon: Wallet },
  { href: "/cierres", labelKey: "arqueos", icon: ClipboardCheck },
  { href: "/reservas", labelKey: "reservas", icon: CalendarCheck },
  { href: "/mensajes", labelKey: "mensajes", icon: WhatsAppIcon },
  { href: "/clientes", labelKey: "clientes", icon: Contact },
  { href: "/equipo", labelKey: "equipo", icon: Users },
  { href: "/billing", labelKey: "billing", icon: CreditCard },
  { href: "/perfil", labelKey: "perfil", icon: User },
  { href: "/faq", labelKey: "faq", icon: HelpCircle },
];

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const t = useTranslations("nav");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="!w-64 !gap-0 bg-white dark:bg-sidebar !border-0 !p-0 flex flex-col"
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
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                <span>{t(item.labelKey)}</span>
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
            <span>{t("exit")}</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
