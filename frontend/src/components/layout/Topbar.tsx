"use client";

import { useState, useEffect } from "react";
import { Menu, Clock, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

interface TopbarProps {
  title: string;
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export function Topbar({ title, sidebarCollapsed, onMobileMenuToggle }: TopbarProps) {
  const { user } = useAuth();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 flex h-14 items-center justify-between border-b border-border/50 bg-white/60 dark:bg-card/60 backdrop-blur-xl px-3 md:left-[var(--sidebar-width,0px)] md:h-14 md:px-6 transition-all duration-300"
    >
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-base font-semibold text-foreground md:text-lg">{title}</h1>
      </div>
      {user?.localName && (
        <p className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-muted-foreground hidden md:block">
          {user.localName}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer"
          title={dark ? "Modo claro" : "Modo oscuro"}
        >
          {dark
            ? <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300" />
            : <Moon className="h-4 w-4 text-brand-purple transition-transform duration-300" />
          }
        </button>
        <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/30">
          <Clock className="h-3 w-3" />
          <span className="text-[11px] font-medium">Trial — 14 dias restantes</span>
        </div>
        <div className="flex md:hidden items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-amber-700 dark:text-amber-400">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] font-medium">14d</span>
        </div>
        {user && (
          <>
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium">{user.localName || user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.permiso}</p>
            </div>
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-brand-purple text-white text-xs md:text-sm font-bold">
              {(user.localName || user.email).charAt(0).toUpperCase()}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
