"use client";

import { useLocale } from "@/providers/LocaleProvider";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "es" ? "en" : "es")}
      className={cn(
        "flex h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer",
        className
      )}
      title={locale === "es" ? "Switch to English" : "Cambiar a Español"}
    >
      <span className={cn("transition-opacity", locale === "es" ? "opacity-100" : "opacity-40")}>ES</span>
      <span className="text-border">/</span>
      <span className={cn("transition-opacity", locale === "en" ? "opacity-100" : "opacity-40")}>EN</span>
    </button>
  );
}
