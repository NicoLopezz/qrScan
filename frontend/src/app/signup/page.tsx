"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Car,
  Scissors,
  Stethoscope,
  Wrench,
  Store,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  RotateCw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
interface FormData {
  email: string;
  password: string;
  localName: string;
  rubro: string;
  activeChannel: "whatsapp" | "telegram";
  horariosDeOperacion: string;
}

const rubros = [
  { id: "lavadero", label: "Lavadero", icon: Car },
  { id: "taller", label: "Taller mecanico", icon: Wrench },
  { id: "veterinaria", label: "Veterinaria", icon: Stethoscope },
  { id: "peluqueria", label: "Peluqueria", icon: Scissors },
  { id: "gastronomia", label: "Gastronomia", icon: Store },
  { id: "otro", label: "Otro", icon: Building2 },
];

const horarios = [
  { id: "8 a 17hs", label: "8:00 — 17:00" },
  { id: "9 a 18hs", label: "9:00 — 18:00" },
  { id: "8 a 20hs", label: "8:00 — 20:00" },
  { id: "10 a 22hs", label: "10:00 — 22:00" },
  { id: "24hs", label: "24 horas" },
];

function getPasswordStrength(pw: string) {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: 1, label: "Debil", color: "bg-red-400" };
  if (s <= 2) return { score: 2, label: "Regular", color: "bg-amber-400" };
  if (s <= 3) return { score: 3, label: "Buena", color: "bg-emerald-400" };
  return { score: 4, label: "Fuerte", color: "bg-emerald-500" };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */
function StepIndicator({ current, total }: { current: number; total: number }) {
  const labels = ["Cuenta", "Verificar", "Tu negocio", "Listo"];
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      {labels.slice(0, total).map((label, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all duration-300 ${
              i < current
                ? "bg-foreground text-background scale-90"
                : i === current
                ? "bg-foreground text-background shadow-md shadow-black/10 scale-100"
                : "bg-muted text-muted-foreground scale-90"
            }`}
          >
            {i < current ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
          </div>
          <span
            className={`text-[11px] font-medium hidden sm:inline transition-colors duration-300 ${
              i <= current ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
          {i < total - 1 && (
            <div className="w-6 sm:w-10 h-0.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500 ease-out"
                style={{ width: i < current ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated step wrapper                                              */
/* ------------------------------------------------------------------ */
function StepPanel({
  active,
  direction,
  children,
}: {
  active: boolean;
  direction: "left" | "right";
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(active);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [active]);

  if (!mounted) return null;

  const translate = direction === "left" ? "-translate-x-8" : "translate-x-8";

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        visible ? "opacity-100 translate-x-0" : `opacity-0 ${translate}`
      }`}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dark, setDark] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Verification code state
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [codeSending, setCodeSending] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [codeVerifying, setCodeVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [form, setForm] = useState<FormData>({
    email: "",
    password: "",
    localName: "",
    rubro: "",
    activeChannel: "whatsapp",
    horariosDeOperacion: "9 a 18hs",
  });

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const goToStep = (next: number) => {
    setPrevStep(step);
    setStep(next);
  };

  const direction = step >= prevStep ? "left" : "right";

  const update = (fields: Partial<FormData>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const isEmailValid = EMAIL_RE.test(form.email);
  const pwStrength = getPasswordStrength(form.password);

  const canStep1 =
    isEmailValid &&
    form.password.length >= 6 &&
    form.localName.trim().length > 0;

  const canStep2 = form.rubro.length > 0;

  /* -- send verification code -- */
  const sendCode = async () => {
    setError("");
    setCodeError("");
    setCodeDigits(["", "", "", "", "", ""]);
    setCodeSending(true);
    try {
      const res = await fetchApi<{ sent: boolean; previewUrl: string | null }>("/api/send-code", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
      setPreviewUrl(res.data.previewUrl);
      setResendCooldown(30);
      goToStep(1);
      setTimeout(() => codeInputsRef.current[0]?.focus(), 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar codigo");
    } finally {
      setCodeSending(false);
    }
  };

  const resendCode = async () => {
    setCodeError("");
    setCodeDigits(["", "", "", "", "", ""]);
    setCodeSending(true);
    try {
      const res = await fetchApi<{ sent: boolean; previewUrl: string | null }>("/api/send-code", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
      setPreviewUrl(res.data.previewUrl);
      setResendCooldown(30);
      codeInputsRef.current[0]?.focus();
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Error al reenviar");
    } finally {
      setCodeSending(false);
    }
  };

  /* -- code input handlers -- */
  const handleCodeDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = digit;
    setCodeDigits(newDigits);
    setCodeError("");

    if (digit && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const fullCode = newDigits.join("");
      if (fullCode.length === 6) verifyCode(fullCode);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted.length) return;
    const newDigits = [...codeDigits];
    for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || "";
    setCodeDigits(newDigits);
    if (pasted.length === 6) verifyCode(pasted);
    else codeInputsRef.current[pasted.length]?.focus();
  };

  /* -- verify code -- */
  const verifyCode = async (code: string) => {
    setCodeError("");
    setCodeVerifying(true);
    try {
      await fetchApi("/api/verify-code", {
        method: "POST",
        body: JSON.stringify({ email: form.email, code }),
      });
      goToStep(2);
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Codigo incorrecto o expirado");
      setCodeDigits(["", "", "", "", "", ""]);
      codeInputsRef.current[0]?.focus();
    } finally {
      setCodeVerifying(false);
    }
  };

  /* -- create account + auto-login -- */
  const handleCreate = async () => {
    setError("");
    setLoading(true);
    try {
      await fetchApi("/api/newLocal", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          localName: form.localName,
          rubro: form.rubro,
          activeChannel: form.activeChannel,
          horariosDeOperacion: form.horariosDeOperacion,
        }),
      });
      await fetchApi("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      goToStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {/* Top right controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-white/10 transition-colors cursor-pointer"
          title={dark ? "Modo claro" : "Modo oscuro"}
        >
          {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-foreground" />}
        </button>
      </div>

      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-muted/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-muted/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <StepIndicator current={step} total={4} />

        <div className="card-elevated rounded-3xl bg-white dark:bg-card/90 backdrop-blur-sm p-8 overflow-hidden">

          {/* ========================= STEP 0: Account ========================= */}
          <StepPanel active={step === 0} direction={direction}>
            <div className="text-center mb-8">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground shadow-lg shadow-black/10">
                <span className="text-xl font-bold text-background tracking-tight">PT</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Crea tu cuenta
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Empeza gratis, sin tarjeta de credito
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (canStep1 && !codeSending) sendCode();
              }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <Label htmlFor="localName" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre del negocio
                </Label>
                <Input
                  id="localName"
                  type="text"
                  placeholder="Ej: Lavadero Don Carlos"
                  value={form.localName}
                  onChange={(e) => update({ localName: e.target.value })}
                  className="h-11 rounded-xl border-border/60 bg-white dark:bg-card focus:border-foreground focus:ring-foreground/20"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => update({ email: e.target.value })}
                  className="h-11 rounded-xl border-border/60 bg-white dark:bg-card focus:border-foreground focus:ring-foreground/20"
                  required
                />
                {form.email && !isEmailValid && (
                  <p className="text-xs text-amber-500 mt-1">Ingresa un email valido</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contrasena
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimo 6 caracteres"
                    value={form.password}
                    onChange={(e) => update({ password: e.target.value })}
                    className="h-11 rounded-xl border-border/60 bg-white dark:bg-card pr-10 focus:border-foreground focus:ring-foreground/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= pwStrength.score ? pwStrength.color : "bg-border"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[11px] font-medium transition-all duration-300 ${
                      pwStrength.score <= 1 ? "text-red-400" :
                      pwStrength.score <= 2 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {pwStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-brand-danger text-center font-medium">{error}</p>
              )}

              <Button
                type="submit"
                disabled={!canStep1 || codeSending}
                className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer disabled:opacity-40"
              >
                {codeSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enviando codigo...
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Ya tenes cuenta?{" "}
              <Link href="/login" className="text-muted-foreground font-medium hover:underline">
                Inicia sesion
              </Link>
            </p>
          </StepPanel>

          {/* ========================= STEP 1: Verify email ========================= */}
          <StepPanel active={step === 1} direction={direction}>
            <div className="text-center mb-8">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
                <Mail className="h-6 w-6 text-foreground" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Verifica tu email
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Si el email es valido, recibiras un codigo de 6 digitos en
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">{form.email}</p>
            </div>

            {/* 6-digit code input */}
            <div className="flex justify-center gap-2 mb-6" onPaste={handleCodePaste}>
              {codeDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { codeInputsRef.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeDigit(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 bg-white dark:bg-card outline-none transition-all duration-200 ${
                    digit
                      ? "border-foreground text-foreground"
                      : "border-border/60 text-foreground"
                  } focus:border-foreground focus:ring-2 focus:ring-foreground/20`}
                />
              ))}
            </div>

            {codeVerifying && (
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </div>
            )}

            {codeError && (
              <p className="text-sm text-red-400 text-center font-medium mb-4">{codeError}</p>
            )}

            {/* Resend */}
            <div className="text-center mb-6">
              {resendCooldown > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Reenviar en <span className="font-medium text-foreground">{resendCooldown}s</span>
                </p>
              ) : (
                <button
                  onClick={resendCode}
                  disabled={codeSending}
                  className="text-xs text-muted-foreground font-medium hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCw className={`h-3 w-3 ${codeSending ? "animate-spin" : ""}`} />
                  Reenviar codigo
                </button>
              )}
            </div>

            {/* Dev helper: Ethereal preview link */}
            {previewUrl && (
              <div className="bg-amber-50 dark:bg-amber-500/10 rounded-lg p-3 mb-4 text-center">
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mb-1">Modo desarrollo</p>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Ver email en Ethereal
                </a>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(0)}
              className="w-full h-11 rounded-xl cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cambiar email
            </Button>
          </StepPanel>

          {/* ========================= STEP 2: Business ========================= */}
          <StepPanel active={step === 2} direction={direction}>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Contanos de tu negocio
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Asi personalizamos tu experiencia
              </p>
            </div>

            {/* Rubro */}
            <div className="mb-5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                Rubro
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {rubros.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => update({ rubro: r.id })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                      form.rubro === r.id
                        ? "border-foreground bg-muted/50 text-foreground ring-1 ring-foreground/20"
                        : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <r.icon className={`h-5 w-5 transition-transform duration-200 ${form.rubro === r.id ? "scale-110" : ""}`} />
                    <span className="text-[11px] font-medium leading-tight text-center">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canal */}
            <div className="mb-5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                Canal de mensajes
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle, color: "text-[#25D366]" },
                  { id: "telegram" as const, label: "Telegram", icon: Send, color: "text-[#0088cc]" },
                ].map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => update({ activeChannel: ch.id })}
                    className={`flex items-center gap-2 rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                      form.activeChannel === ch.id
                        ? "border-foreground bg-muted/50 ring-1 ring-foreground/20"
                        : "border-border/60 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <ch.icon className={`h-5 w-5 ${ch.color}`} />
                    <span className="text-sm font-medium text-foreground">{ch.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Horarios */}
            <div className="mb-6">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 block">
                <Clock className="h-3 w-3 inline mr-1" />
                Horario de atencion
              </Label>
              <div className="flex flex-wrap gap-2">
                {horarios.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => update({ horariosDeOperacion: h.id })}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                      form.horariosDeOperacion === h.id
                        ? "border-foreground bg-muted/50 text-foreground ring-1 ring-foreground/20"
                        : "border-border/60 text-muted-foreground hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    {h.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-brand-danger text-center font-medium">{error}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep(1)}
                className="h-11 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Atras
              </Button>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={!canStep2 || loading}
                className="flex-1 h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    Crear mi cuenta
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </StepPanel>

          {/* ========================= STEP 3: Success ========================= */}
          <StepPanel active={step === 3} direction="left">
            <div className="text-center py-4">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 animate-[scaleIn_0.4s_ease-out]">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Tu cuenta esta lista!
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Ya cargamos datos de ejemplo para que explores.
                Podes empezar a registrar servicios ahora mismo.
              </p>

              <div className="mt-6 bg-muted/50 rounded-xl p-4 text-left">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                  Tu negocio
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Nombre", value: form.localName },
                    { label: "Rubro", value: rubros.find((r) => r.id === form.rubro)?.label || form.rubro },
                    { label: "Canal", value: form.activeChannel === "whatsapp" ? "WhatsApp" : "Telegram" },
                    { label: "Horario", value: form.horariosDeOperacion },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-medium text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="mt-6 w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-medium shadow-lg shadow-black/10 transition-all duration-200 cursor-pointer"
              >
                Ir al dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </StepPanel>

        </div>

        {step < 3 && (
          <p className="text-center text-xs text-muted-foreground/50 mt-6">
            Al crear tu cuenta aceptas los terminos y condiciones
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
