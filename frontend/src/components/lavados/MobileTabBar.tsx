"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { Droplets, Plus, Bell, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type MobileTab = "lista" | "nuevo" | "listos";

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  listosCount: number;
  onCenterAction?: () => void;
}

export function MobileTabBar({ activeTab, onTabChange, listosCount, onCenterAction }: MobileTabBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const bar = (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-background border-t border-border/30 pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-end justify-around px-6 pt-2 pb-2">
        {/* Lista */}
        <button
          onClick={() => onTabChange("lista")}
          className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer"
        >
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
            activeTab === "lista" && "bg-brand-purple-muted"
          )}>
            <Droplets className={cn(
              "h-[22px] w-[22px] transition-colors",
              activeTab === "lista" ? "text-brand-purple" : "text-muted-foreground/50"
            )} />
          </div>
          <span className={cn(
            "text-[10px] font-medium",
            activeTab === "lista" ? "text-brand-purple" : "text-muted-foreground/50"
          )}>Lista</span>
        </button>

        {/* + Nuevo / → Siguiente */}
        <button
          onClick={() => {
            if (activeTab === "nuevo" && onCenterAction) onCenterAction();
            else onTabChange("nuevo");
          }}
          className={cn(
            "flex items-center justify-center h-14 w-14 -mt-4 rounded-2xl cursor-pointer transition-all duration-200 active:scale-95",
            activeTab === "nuevo"
              ? "bg-brand-purple shadow-lg shadow-brand-purple/25"
              : "bg-gradient-to-br from-brand-purple to-brand-fuchsia shadow-md shadow-brand-purple/20"
          )}
        >
          {activeTab === "nuevo" ? (
            <ArrowRight className="h-6 w-6 text-white" />
          ) : (
            <Plus className="h-6 w-6 text-white" />
          )}
        </button>

        {/* Listos */}
        <button
          onClick={() => onTabChange("listos")}
          className="flex flex-col items-center gap-1 min-w-[60px] cursor-pointer"
        >
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
            activeTab === "listos" && "bg-brand-purple-muted"
          )}>
            <Bell className={cn(
              "h-[22px] w-[22px] transition-colors",
              activeTab === "listos" ? "text-brand-purple" : "text-muted-foreground/50"
            )} />
          </div>
          <span className={cn(
            "text-[10px] font-medium",
            activeTab === "listos" ? "text-brand-purple" : "text-muted-foreground/50"
          )}>Listos</span>
        </button>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(bar, document.body);
}
