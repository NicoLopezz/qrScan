"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  QrCode,
  MessageCircle,
  Wallet,
  CalendarCheck,
  Users,
  BarChart3,
  Bell,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Star,
  Phone,
  Clock,
  TrendingUp,
  Play,
  Sparkles,
  ChevronDown,
  Mail,
  MapPin,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Scroll-driven animations                                           */
/* ------------------------------------------------------------------ */
function useScrollAnimations() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );

    el.querySelectorAll("[data-animate]").forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ------------------------------------------------------------------ */
/*  WhatsApp Icon                                                      */
/* ------------------------------------------------------------------ */
function WhatsAppSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */
const features = [
  {
    icon: QrCode,
    title: "Codigos QR",
    desc: "Tu cliente escanea, confirma el servicio al instante y queda conectado para recibir avisos.",
    size: "large" as const,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp y Telegram",
    desc: "Mensajes automaticos de confirmacion, aviso de retiro y encuestas.",
    size: "small" as const,
  },
  {
    icon: Wallet,
    title: "Caja y cobros",
    desc: "Multi-caja, turnos, arqueo diario, split payments. Todo el flujo de dinero en un solo lugar.",
    size: "small" as const,
  },
  {
    icon: CalendarCheck,
    title: "Reservas online",
    desc: "Tus clientes reservan desde WhatsApp o la web. Confirmacion automatica y recordatorios.",
    size: "small" as const,
  },
  {
    icon: Users,
    title: "Gestion de equipo",
    desc: "Asigna roles y permisos. Cada empleado ve solo lo que necesita para trabajar.",
    size: "small" as const,
  },
  {
    icon: BarChart3,
    title: "Metricas en tiempo real",
    desc: "Dashboard con los numeros que importan: servicios del dia, ingresos, tiempos de espera.",
    size: "large" as const,
  },
];

const steps = [
  {
    num: "01",
    icon: Phone,
    title: "Tu cliente llega",
    desc: "El operador registra el servicio en segundos y le muestra el QR al cliente.",
  },
  {
    num: "02",
    icon: QrCode,
    title: "Escanea y confirma",
    desc: "El cliente escanea con su celular y confirma por WhatsApp. Sin apps, sin registros.",
  },
  {
    num: "03",
    icon: Bell,
    title: "Recibe su aviso",
    desc: "Cuando el servicio esta listo, le llega un mensaje automatico. Listo para retirar.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    period: "",
    desc: "Para probar y empezar a digitalizar.",
    popular: false,
    cta: "Empezar gratis",
    features: ["1 caja", "50 servicios/mes", "WhatsApp basico", "QR codes", "1 usuario"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "USD/mes",
    desc: "Para negocios en crecimiento.",
    popular: true,
    cta: "Comenzar ahora",
    features: [
      "Multi-caja",
      "Servicios ilimitados",
      "Reportes avanzados",
      "Hasta 5 usuarios",
      "WhatsApp completo",
      "Reservas online",
      "Soporte por chat",
    ],
  },
  {
    name: "Business",
    price: "$59",
    period: "USD/mes",
    desc: "Para cadenas y multiples sucursales.",
    popular: false,
    cta: "Contactar ventas",
    features: [
      "Todo de Pro",
      "Multiples sucursales",
      "API de integracion",
      "Usuarios ilimitados",
      "Soporte prioritario",
      "Onboarding dedicado",
    ],
  },
];

const industries = [
  { name: "Lavaderos", desc: "QR + aviso de retiro", img: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&h=300&fit=crop&q=80" },
  { name: "Talleres", desc: "Seguimiento en tiempo real", img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop&q=80" },
  { name: "Veterinarias", desc: "Turnos y recordatorios", img: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400&h=300&fit=crop&q=80" },
  { name: "Peluquerias", desc: "Reservas automaticas", img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop&q=80" },
  { name: "Tintorerías", desc: "Entrega y retiro", img: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop&q=80" },
  { name: "Cerrajerías", desc: "Estado del servicio", img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop&q=80" },
];

const testimonials = [
  {
    quote: "Redujimos un 80% las llamadas de clientes preguntando si el auto esta listo. Ahora les llega el aviso automatico.",
    name: "Martin Gonzalez",
    role: "Dueño de AutoSpa Belgrano",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80&crop=faces",
  },
  {
    quote: "Mis clientes aman recibir el WhatsApp cuando su mascota esta lista. Nos dejaron 5 estrellas en Google solo por eso.",
    name: "Lucia Fernandez",
    role: "Veterinaria Patitas",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80&crop=faces",
  },
  {
    quote: "La caja integrada fue un game changer. Antes usabamos una planilla de Excel que siempre tenia errores.",
    name: "Diego Ramirez",
    role: "Taller Ramirez e Hijos",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80&crop=faces",
  },
];

/* ------------------------------------------------------------------ */
/*  Dashboard Mockup Component (Light version)                         */
/* ------------------------------------------------------------------ */
function DashboardMockup() {
  return (
    <div className="relative">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="ml-3 flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-1.5 text-xs text-gray-400 w-64">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              app.pickuptime.com
            </div>
          </div>
        </div>

        <div className="flex min-h-[320px] sm:min-h-[380px]">
          <div className="hidden sm:flex w-44 bg-gray-50/80 border-r border-gray-100 flex-col p-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">PickUp Time</span>
            </div>
            {["Inicio", "Lavados", "Ventas", "Reservas", "Equipo"].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs mb-1 ${
                  i === 1
                    ? "bg-gray-200 text-gray-700 font-medium"
                    : "text-gray-400"
                }`}
              >
                <div className={`w-4 h-4 rounded ${i === 1 ? "bg-gray-300" : "bg-gray-200"}`} />
                {item}
              </div>
            ))}
          </div>

          <div className="flex-1 p-5 sm:p-6 bg-gray-50/30">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dashboard</p>
                <p className="text-sm font-semibold text-gray-800">Hoy, 30 Mar</p>
              </div>
              <div className="h-7 px-3 rounded-lg bg-gray-900 text-white text-[10px] font-medium flex items-center">+ Nuevo lavado</div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Servicios hoy", val: "42", change: "+12%", color: "text-emerald-600" },
                { label: "En proceso", val: "8", change: "3 listos", color: "text-gray-700" },
                { label: "Facturado", val: "$184,500", change: "+8%", color: "text-emerald-600" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-lg font-bold text-gray-800 mt-1">{kpi.val}</p>
                  <p className={`text-[10px] ${kpi.color} mt-0.5`}>{kpi.change}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-4 h-28 flex items-end gap-1 shadow-sm">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t" style={{ height: `${h}%` }}>
                  <div className="w-full bg-gray-400 rounded-t" style={{ height: `${60 + Math.random() * 40}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phone mockup */}
      <div className="absolute -bottom-8 -right-4 sm:-right-8 w-36 sm:w-44">
        <div className="rounded-[20px] border-[3px] border-gray-200 bg-white p-1.5 shadow-xl">
          <div className="rounded-[14px] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900">
              <span className="text-[8px] text-white">19:42</span>
              <div className="w-12 h-3 rounded-full bg-gray-800" />
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-white/60" />
                <div className="w-2.5 h-2.5 rounded-sm bg-white/60" />
              </div>
            </div>
            <div className="p-2.5 bg-[#ECE5DD] min-h-[160px] sm:min-h-[200px]">
              <div className="bg-white rounded-lg p-2 shadow-sm mb-2 max-w-[90%]">
                <p className="text-[8px] font-medium text-gray-700">PickUp Time</p>
                <p className="text-[7px] text-gray-700 mt-0.5 leading-relaxed">
                  Hola Juan! Tu vehiculo con patente ABC 123 esta listo para retirar.
                </p>
                <p className="text-[6px] text-gray-400 text-right mt-1">19:42</p>
              </div>
              <div className="bg-[#DCF8C6] rounded-lg p-2 shadow-sm ml-auto max-w-[75%]">
                <p className="text-[7px] text-gray-700 leading-relaxed">Genial, ya voy!</p>
                <p className="text-[6px] text-gray-400 text-right mt-1">19:43</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <div className="absolute -top-4 -left-4 sm:-left-8 bg-white rounded-xl border border-gray-100 shadow-lg p-3 w-48 sm:w-56">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-800">Servicio completado</p>
            <p className="text-[9px] text-gray-400">hace 2 min</p>
          </div>
        </div>
        <p className="text-[9px] text-gray-400">WhatsApp enviado a +54 11 ****-4523</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function LandingPage() {
  const wrapperRef = useScrollAnimations();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="min-h-screen bg-white text-gray-900 font-sans selection:bg-gray-900/10 overflow-x-hidden"
    >
      {/* ============================================================ */}
      {/*  FLOATING PILL NAVBAR                                        */}
      {/* ============================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4">
        <div
          className={`flex h-14 w-full max-w-4xl items-center justify-between rounded-2xl px-5 transition-all duration-500 ${
            scrolled
              ? "bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg shadow-gray-200/50"
              : "bg-transparent"
          }`}
        >
          <Link href="/" className="text-lg font-bold tracking-tight flex-shrink-0">
            <span className="text-gray-900">PickUp</span>
            <span className="text-gray-900">Time</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {[
              { label: "Producto", href: "#features" },
              { label: "Industrias", href: "#industries" },
              { label: "Precios", href: "#pricing" },
              { label: "Como funciona", href: "#how" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Iniciar sesion
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              Probar gratis
            </Link>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden p-1 text-gray-500"
              aria-label="Menu"
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl pt-24 px-6">
          <div className="space-y-6">
            {[
              { label: "Producto", href: "#features" },
              { label: "Industrias", href: "#industries" },
              { label: "Precios", href: "#pricing" },
              { label: "Como funciona", href: "#how" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenu(false)}
                className="block text-2xl font-semibold text-gray-700 hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileMenu(false)}
              className="block text-2xl font-semibold text-gray-900"
            >
              Iniciar sesion
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Soft background gradient */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-muted/30 blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-muted/30 blur-[120px]" />
          <div className="absolute top-1/3 left-0 w-[400px] h-[400px] rounded-full bg-muted/30 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — copy */}
            <div>
              <div
                data-animate="fade-up"
                className="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 mb-8"
              >
                <Sparkles className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Notificaciones inteligentes para tu negocio</span>
              </div>

              <h1
                data-animate="fade-up"
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
              >
                <span className="text-gray-900">Tus clientes informados,</span>
                <br />
                <span className="text-gray-900">
                  tu negocio organizado
                </span>
              </h1>

              <p
                data-animate="fade-up"
                className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg"
              >
                Conecta con tus clientes por WhatsApp de forma automatica.
                Para lavaderos, talleres, veterinarias y cualquier negocio de servicios.
              </p>

              <div data-animate="fade-up" className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-7 py-3.5 text-base font-semibold text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-black/10 transition-all duration-300"
                >
                  Comenzar gratis
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-7 py-3.5 text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Ver como funciona
                </a>
              </div>

              <div data-animate="fade-up" className="mt-10 flex items-center gap-6 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  14 dias gratis
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  Sin tarjeta
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-gray-400" />
                  Cancela cuando quieras
                </span>
              </div>
            </div>

            {/* Right — dashboard mockup */}
            <div data-animate="fade-scale" className="hidden lg:block">
              <DashboardMockup />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="h-6 w-6 text-gray-300" />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SOCIAL PROOF — Metrics strip                                */}
      {/* ============================================================ */}
      <section className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div data-animate="fade-up" className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20">
            {[
              { value: "+50", label: "Negocios activos" },
              { value: "+10,000", label: "Notificaciones enviadas" },
              { value: "4.9", label: "Valoracion promedio", hasStar: true },
              { value: "<2 min", label: "Tiempo de respuesta" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 tabular-nums">
                    {stat.value}
                  </span>
                  {stat.hasStar && <Star className="h-5 w-5 text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TRUSTED BY — Logo strip                                     */}
      {/* ============================================================ */}
      <section className="py-12 border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-5 lg:px-8">
          <p className="text-center text-xs font-medium text-gray-400 uppercase tracking-wider mb-8">Negocios que ya confian en PickUp Time</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40">
            {["AutoSpa", "Taller Central", "VetCare", "CleanPro", "LavaExpress", "PetHouse"].map((name) => (
              <span key={name} className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES — Bento Grid                                       */}
      {/* ============================================================ */}
      <section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-16">
            <p className="text-sm font-medium text-gray-700 tracking-wide uppercase mb-3">
              Funcionalidades
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Todo lo que necesitas{" "}
              <span className="text-gray-900">
                en un solo lugar
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Herramientas pensadas para que vos te enfoques en el servicio y
              tus clientes esten siempre informados.
            </p>
          </div>

          {/* Bento grid with visual mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* QR Codes — large card with visual */}
            <div data-animate="fade-up" className="sm:col-span-2 lg:col-span-2 group rounded-2xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition-all duration-500 overflow-hidden">
              <div className="grid sm:grid-cols-2">
                <div className="p-6 sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Codigos QR</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Tu cliente escanea, confirma el servicio al instante y queda conectado para recibir avisos.</p>
                </div>
                <div className="relative h-48 sm:h-auto bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                  <div className="w-32 h-32 rounded-2xl bg-white border-2 border-gray-200 shadow-lg p-3 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <div className="w-full h-full rounded-lg bg-gray-900 grid grid-cols-5 grid-rows-5 gap-0.5 p-2">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`rounded-sm ${Math.random() > 0.4 ? 'bg-white' : 'bg-gray-900'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md px-3 py-2 text-[10px] font-medium text-gray-600 border border-gray-100">
                    <span className="text-emerald-500 mr-1">&#10003;</span> Escaneado
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp — small card with chat preview */}
            <div data-animate="fade-up" className="group rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition-all duration-500" style={{ transitionDelay: '60ms' }}>
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp y Telegram</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Mensajes automaticos de confirmacion, aviso de retiro y encuestas.</p>
              <div className="rounded-xl bg-[#ECE5DD] p-3 space-y-2">
                <div className="bg-white rounded-lg p-2 shadow-sm max-w-[85%]">
                  <p className="text-[9px] text-gray-700">Tu vehiculo esta listo para retirar!</p>
                </div>
                <div className="bg-[#DCF8C6] rounded-lg p-2 shadow-sm ml-auto max-w-[70%]">
                  <p className="text-[9px] text-gray-700">Perfecto, ya voy!</p>
                </div>
              </div>
            </div>

            {/* Caja — small card */}
            <div data-animate="fade-up" className="group rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition-all duration-500" style={{ transitionDelay: '120ms' }}>
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                <Wallet className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Caja y cobros</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Multi-caja, turnos, arqueo diario, split payments. Todo el flujo de dinero en un solo lugar.</p>
              <div className="space-y-2">
                {[{ label: "Efectivo", val: "$84,200", pct: 55 }, { label: "Debito", val: "$62,300", pct: 35 }, { label: "MercadoPago", val: "$38,000", pct: 20 }].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">{m.label}</span>
                      <span className="font-medium text-gray-700">{m.val}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${m.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reservas — small card */}
            <div data-animate="fade-up" className="group rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition-all duration-500" style={{ transitionDelay: '180ms' }}>
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservas online</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Tus clientes reservan desde WhatsApp o la web. Confirmacion automatica y recordatorios.</p>
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-1.5">
                {[{ t: "10:00", n: "Juan P.", s: "Confirmado" }, { t: "10:30", n: "Maria L.", s: "Pendiente" }, { t: "11:00", n: "Carlos R.", s: "Confirmado" }].map((r) => (
                  <div key={r.t} className="flex items-center gap-2 text-[10px]">
                    <span className="text-gray-400 w-8">{r.t}</span>
                    <span className="text-gray-700 font-medium flex-1">{r.n}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${r.s === "Confirmado" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{r.s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipo — small card */}
            <div data-animate="fade-up" className="group rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition-all duration-500" style={{ transitionDelay: '240ms' }}>
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestion de equipo</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">Asigna roles y permisos. Cada empleado ve solo lo que necesita para trabajar.</p>
              <div className="flex -space-x-2">
                {["bg-gray-900", "bg-gray-600", "bg-gray-400", "bg-gray-300"].map((bg, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-[9px] font-bold`}>
                    {["MG", "LF", "DR", "AP"][i]}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-gray-400 text-[9px] font-bold">+3</div>
              </div>
            </div>

            {/* Metricas — large card with chart visual */}
            <div data-animate="fade-up" className="sm:col-span-2 lg:col-span-2 group rounded-2xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-lg hover:shadow-black/5 transition-all duration-500 overflow-hidden" style={{ transitionDelay: '300ms' }}>
              <div className="grid sm:grid-cols-2">
                <div className="p-6 sm:p-8">
                  <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Metricas en tiempo real</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">Dashboard con los numeros que importan: servicios del dia, ingresos, tiempos de espera.</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[9px] text-gray-400 uppercase">Hoy</p>
                      <p className="text-xl font-bold text-gray-900">42</p>
                      <p className="text-[10px] text-emerald-600">+12%</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-[9px] text-gray-400 uppercase">Ingresos</p>
                      <p className="text-xl font-bold text-gray-900">$184k</p>
                      <p className="text-[10px] text-emerald-600">+8%</p>
                    </div>
                  </div>
                </div>
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-end gap-1.5 min-h-[200px]">
                  {[35, 55, 40, 70, 50, 85, 60, 90, 65, 80, 75, 95].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end">
                      <div
                        className="rounded-t bg-gray-300 group-hover:bg-gray-400 transition-colors duration-500"
                        style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
                      />
                    </div>
                  ))}
                  <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md px-3 py-2 text-[10px] border border-gray-100">
                    <span className="text-emerald-500 font-bold">&#8593; 23%</span>
                    <span className="text-gray-400 ml-1">vs. mes anterior</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  INDUSTRIES — Horizontal cards                               */}
      {/* ============================================================ */}
      <section id="industries" className="py-24 sm:py-32 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-16">
            <p className="text-sm font-medium text-gray-700 tracking-wide uppercase mb-3">
              Industrias
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Para todo negocio que{" "}
              <span className="text-gray-900">
                atiende clientes
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Si tu cliente deja algo, espera un servicio o necesita un aviso,
              PickUp Time lo resuelve.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((ind, i) => (
              <div
                key={ind.name}
                data-animate="fade-up"
                className="group relative rounded-2xl overflow-hidden h-72 cursor-pointer shadow-sm"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <Image src={ind.img} alt={ind.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-semibold text-white">{ind.name}</h3>
                  <p className="text-sm text-white/70 mt-1">{ind.desc}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1.5 text-white/60 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      WhatsApp
                    </span>
                    <span className="flex items-center gap-1.5 text-white/60 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      QR
                    </span>
                    <span className="flex items-center gap-1.5 text-white/60 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Caja
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  HOW IT WORKS                                                */}
      {/* ============================================================ */}
      <section id="how" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-16">
            <p className="text-sm font-medium text-gray-700 tracking-wide uppercase mb-3">
              Como funciona
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Tres pasos,{" "}
              <span className="text-gray-900">
                cero friccion
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-md mx-auto">
              Tu cliente no necesita descargar nada. Solo su celular y WhatsApp.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, i) => {
              const imgs = [
                "https://images.unsplash.com/photo-1556741533-411cf82e4e2d?w=400&h=250&fit=crop&q=80",
                "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop&q=80",
                "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=250&fit=crop&q=80",
              ];
              return (
                <div
                  key={step.num}
                  data-animate="fade-up"
                  className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gray-300 z-10" />
                  )}
                  <div className="relative h-40 overflow-hidden">
                    <Image src={imgs[i]} alt={step.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-gray-700">{step.num}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  RESULTS                                                     */}
      {/* ============================================================ */}
      <section className="py-24 sm:py-32 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div data-animate="slide-right">
              <p className="text-sm font-medium text-gray-700 tracking-wide uppercase mb-3">
                Resultados reales
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Menos llamadas,{" "}
                <span className="text-gray-900">
                  mas clientes satisfechos
                </span>
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Los negocios que usan PickUp Time reducen las llamadas de
                seguimiento en un 80% y mejoran la experiencia de sus clientes.
              </p>
              <div className="mt-10 grid grid-cols-3 gap-8">
                {[
                  { icon: Clock, value: "-80%", label: "Llamadas" },
                  { icon: TrendingUp, value: "+35%", label: "Retencion" },
                  { icon: Star, value: "4.9/5", label: "Satisfaccion" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <stat.icon className="h-5 w-5 text-gray-700 mb-3" />
                    <p className="text-3xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div data-animate="slide-left" className="grid grid-cols-2 gap-3">
              <div className="relative rounded-2xl overflow-hidden h-[220px] shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=300&fit=crop&q=80"
                  alt="Equipo de trabajo"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden h-[220px] shadow-lg mt-8">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&q=80"
                  alt="Cliente satisfecho"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden h-[220px] shadow-lg -mt-4">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop&q=80"
                  alt="Dashboard en uso"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative rounded-2xl overflow-hidden h-[220px] shadow-lg mt-4">
                <Image
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop&q=80"
                  alt="Negocio organizado"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  TESTIMONIALS                                                */}
      {/* ============================================================ */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-16">
            <p className="text-sm font-medium text-gray-700 tracking-wide uppercase mb-3">
              Testimonios
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Lo que dicen{" "}
              <span className="text-gray-900">nuestros clientes</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                data-animate="fade-up"
                className="rounded-2xl border border-gray-100 bg-white p-7 hover:shadow-lg hover:shadow-black/5 transition-all duration-500"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image src={t.img} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING                                                     */}
      {/* ============================================================ */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-14">
            <p className="text-sm font-medium text-gray-700 tracking-wide uppercase mb-3">
              Precios
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Planes simples,{" "}
              <span className="text-gray-900">
                sin sorpresas
              </span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">
              Empeza gratis y escala a medida que crece tu negocio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                data-animate="fade-up"
                className={`relative rounded-2xl border p-7 transition-all ${
                  plan.popular
                    ? "border-gray-900/40 bg-gray-50 shadow-xl shadow-black/10 scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-1 text-xs font-semibold text-white">
                    Popular
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{plan.desc}</p>

                <div className="mt-5 mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && (
                    <span className="text-sm text-gray-400 ml-1">{plan.period}</span>
                  )}
                </div>

                <Link
                  href="/signup"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                    plan.popular
                      ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-black/10"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-gray-700 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FINAL CTA                                                   */}
      {/* ============================================================ */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-muted/30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-muted/30 blur-[150px]" />
        </div>
        <div data-animate="fade-up" className="relative mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
            Tu proximo cliente ya tiene WhatsApp.{" "}
            <span className="text-gray-900">
              Solo falta conectarlo.
            </span>
          </h2>
          <p className="mt-6 text-gray-500 text-lg max-w-xl mx-auto">
            14 dias gratis, sin tarjeta de credito. Configura tu cuenta en 5 minutos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-4 text-base font-semibold text-white hover:bg-gray-800 hover:shadow-xl hover:shadow-black/10 transition-all duration-300"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a
              href="https://wa.me/5491112345678?text=Hola%2C%20quiero%20info%20sobre%20PickUp%20Time"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-8 py-4 text-base font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <WhatsAppSvg className="h-5 w-5 text-[#25D366]" />
              Hablar con ventas
            </a>
          </div>
          <p className="mt-8 text-xs text-gray-400">
            +50 negocios ya confian en PickUp Time
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="border-t border-gray-100 bg-gray-50 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="text-lg font-bold tracking-tight mb-4">
                <span className="text-gray-900">PickUp</span>
                <span className="text-gray-900">Time</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Notificaciones inteligentes para negocios de servicios.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Producto</p>
              <ul className="space-y-3">
                {["QR Codes", "WhatsApp", "Caja", "Reservas", "Equipo", "Metricas"].map((item) => (
                  <li key={item}>
                    <a href="#features" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Empresa</p>
              <ul className="space-y-3">
                {["Precios", "Como funciona", "Industrias", "Blog"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Contacto</p>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:contacto@pickuptime.app" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                    contacto@pickuptime.app
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/5491112345678" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                    <WhatsAppSvg className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                </li>
                <li>
                  <span className="flex items-center gap-2 text-sm text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    Buenos Aires, Argentina
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-400">&copy; 2026 PickUp Time. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <a href="/terminos" className="hover:text-gray-600 transition-colors">Terminos</a>
              <a href="/privacidad" className="hover:text-gray-600 transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/*  WHATSAPP FLOATING BUTTON                                    */}
      {/* ============================================================ */}
      <a
        href="https://wa.me/5491112345678?text=Hola%2C%20quiero%20info%20sobre%20PickUp%20Time"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white shadow-lg shadow-[#25D366]/30 hover:shadow-[#25D366]/50 hover:scale-105 transition-all group"
        aria-label="Contactar por WhatsApp"
      >
        <WhatsAppSvg className="h-6 w-6" />
        <span className="text-sm font-semibold hidden sm:inline">Contactanos</span>
      </a>

      {/* ============================================================ */}
      {/*  Animation styles                                            */}
      {/* ============================================================ */}
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        [data-animate] {
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        [data-animate="fade-up"] {
          transform: translateY(40px);
        }

        [data-animate="fade-scale"] {
          transform: scale(0.92) translateY(30px);
        }

        [data-animate="slide-right"] {
          transform: translateX(-60px);
        }

        [data-animate="slide-left"] {
          transform: translateX(60px);
        }

        [data-animate].in-view {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }
      `}</style>
    </div>
  );
}
