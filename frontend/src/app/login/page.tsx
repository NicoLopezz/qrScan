"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import type { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await fetchApi<User>("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-purple-muted via-white to-purple-50 dark:from-[#0F0720] dark:via-[#131118] dark:to-[#1A0E35] px-4">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-white/10 transition-colors cursor-pointer"
        title={dark ? "Modo claro" : "Modo oscuro"}
      >
        {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-brand-purple" />}
      </button>
      {/* Subtle background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand-purple/5 dark:bg-brand-purple/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-brand-fuchsia/5 dark:bg-brand-fuchsia/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="card-elevated rounded-3xl bg-white dark:bg-card/90 backdrop-blur-sm p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-fuchsia shadow-lg shadow-brand-purple/20">
              <span className="text-xl font-bold text-white tracking-tight">PT</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-brand-purple-deep dark:text-brand-purple-light">
              PickUp Time
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Plataforma de gestion para lavaderos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-border/60 bg-white dark:bg-card focus:border-brand-purple focus:ring-brand-purple/20"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contrasena
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contrasena"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-border/60 bg-white dark:bg-card focus:border-brand-purple focus:ring-brand-purple/20"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-brand-danger text-center font-medium">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia hover:from-brand-purple-dark hover:to-brand-purple text-white font-medium shadow-lg shadow-brand-purple/20 transition-all duration-200 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          PickUp Time v2.0
        </p>
      </div>
    </div>
  );
}
