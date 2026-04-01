"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { TourProvider } from "@/providers/TourProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { MobileNav } from "@/components/layout/MobileNav";

function AuthenticatedShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("pageTitles");
  const tc = useTranslations("common");
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
    return <div className="min-h-screen page-bg" />;
  }

  if (!user) return null;

  const sidebarWidth = sidebarCollapsed ? 52 : 224;
  const title = t.has(pathname) ? t(pathname) : "PickUp Time";

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
        <TourProvider>
          <AuthenticatedShell>{children}</AuthenticatedShell>
        </TourProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
