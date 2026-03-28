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
      <SheetContent side="left" className="w-64 bg-brand-sidebar border-0 p-0">
        <SheetHeader className="flex h-16 items-center justify-center border-b border-white/10 px-4">
          <SheetTitle className="text-lg font-bold">
            <span className="text-brand-orange">PickUp</span>{" "}
            <span className="text-white">Time</span>
          </SheetTitle>
        </SheetHeader>

        {/* User info */}
        {user && (
          <div className="px-4 py-4 border-b border-white/10">
            <p className="text-sm font-medium text-white">{user.localName || user.email}</p>
            <p className="text-xs text-white/50 capitalize">{user.permiso}</p>
          </div>
        )}

        <nav className="space-y-1 px-2 py-4">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                  isActive
                    ? "bg-brand-purple text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 px-2 py-3">
          <button
            onClick={() => {
              onOpenChange(false);
              logout();
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Salir</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
