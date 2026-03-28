"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/lavados": "Lavados",
  "/caja": "Ventas",
  "/reservas": "Reservas",
  "/mensajes": "Mensajes",
  "/equipo": "Equipo",
  "/billing": "Billing",
  "/perfil": "Perfil",
  "/faq": "FAQ",
};

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved) setSidebarCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-page">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-purple border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const sidebarWidth = sidebarCollapsed ? 52 : 224;
  const title = pageTitles[pathname] || "PickUp Time";

  return (
    <div
      className="min-h-screen page-bg"
      style={{ "--sidebar-width": `${sidebarWidth}px` } as React.CSSProperties}
    >
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      <Topbar
        title={title}
        sidebarCollapsed={sidebarCollapsed}
        onMobileMenuToggle={() => setMobileNavOpen(true)}
      />
      <main
        className="pt-14 transition-all duration-300 md:ml-[var(--sidebar-width)]"
      >
        <div key={pathname} className="p-3 md:p-6 animate-in-page">{children}</div>
      </main>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </AuthProvider>
    </QueryProvider>
  );
}
