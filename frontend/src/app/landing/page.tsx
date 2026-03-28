"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  Shield,
  Zap,
  Building2,
  Menu,
  X,
  Star,
  Phone,
  Clock,
  TrendingUp,
  Smartphone,
  ChevronDown,
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

function useParallax() {
  const onScroll = useCallback(() => {
    const els = document.querySelectorAll("[data-parallax]");
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = parseFloat((el as HTMLElement).dataset.parallax || "0.1");
      const y = (rect.top - window.innerHeight / 2) * speed;
      (el as HTMLElement).style.transform = `translateY(${y}px)`;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);
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
const useCases = [
  {
    title: "Lavaderos de autos",
    desc: "El cliente deja su vehiculo, escanea el QR y recibe un WhatsApp cuando esta listo para retirar. Sin llamadas, sin esperas.",
    img: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&h=600&fit=crop&q=80",
    align: "left" as const,
  },
  {
    title: "Talleres mecanicos",
    desc: "Notifica al cliente cada avance en la reparacion. Presupuestos, aprobaciones y aviso de entrega por WhatsApp.",
    img: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop&q=80",
    align: "right" as const,
  },
  {
    title: "Veterinarias",
    desc: "Avisa cuando la mascota esta lista, envia recordatorios de vacunas y controles. Tu cliente siempre informado.",
    img: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&h=600&fit=crop&q=80",
    align: "left" as const,
  },
  {
    title: "Peluquerias y esteticas",
    desc: "Confirma turnos automaticamente, avisa cuando el profesional esta disponible y envia promos personalizadas.",
    img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop&q=80",
    align: "right" as const,
  },
];

const features = [
  {
    icon: QrCode,
    title: "Codigos QR",
    desc: "Tu cliente escanea, confirma el servicio al instante y queda conectado para recibir avisos.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp integrado",
    desc: "Mensajes automaticos de confirmacion, aviso de retiro y encuestas. Sin que tu equipo pierda tiempo.",
  },
  {
    icon: Wallet,
    title: "Caja y cobros",
    desc: "Multi-caja, turnos, arqueo diario, split payments. Todo el flujo de dinero en un solo lugar.",
  },
  {
    icon: CalendarCheck,
    title: "Reservas online",
    desc: "Tus clientes reservan desde WhatsApp o la web. Confirmacion automatica y recordatorios.",
  },
  {
    icon: Users,
    title: "Gestion de equipo",
    desc: "Asigna roles y permisos. Cada empleado ve solo lo que necesita para trabajar.",
  },
  {
    icon: BarChart3,
    title: "Metricas en tiempo real",
    desc: "Dashboard con los numeros que importan: servicios del dia, ingresos, tiempos de espera.",
  },
];

const steps = [
  {
    num: "1",
    icon: Phone,
    title: "Tu cliente llega",
    desc: "El operador registra el servicio en segundos y le muestra el QR al cliente.",
  },
  {
    num: "2",
    icon: QrCode,
    title: "Escanea y confirma",
    desc: "El cliente escanea con su celular y confirma por WhatsApp. Sin apps, sin registros.",
  },
  {
    num: "3",
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
    icon: Zap,
    popular: false,
    cta: "Empezar gratis",
    features: ["1 caja", "50 servicios/mes", "WhatsApp basico", "QR codes", "1 usuario"],
  },
  {
    name: "Pro",
    price: "$29",
    period: "USD/mes",
    desc: "Para negocios en crecimiento.",
    icon: Shield,
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
    icon: Building2,
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

/* ------------------------------------------------------------------ */
/*  Dashboard Mockup Component                                         */
/* ------------------------------------------------------------------ */
function DashboardMockup() {
  return (
    <div className="relative">
      {/* Browser frame */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 overflow-hidden">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="ml-3 flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-1.5 text-xs text-gray-500 w-64">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              app.pickuptime.com
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="flex min-h-[320px] sm:min-h-[380px]">
          {/* Sidebar */}
          <div className="hidden sm:flex w-48 bg-gray-50 border-r border-gray-100 flex-col p-4">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-7 h-7 rounded-lg bg-brand-purple flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">PickUp Time</span>
            </div>
            {["Inicio", "Lavados", "Ventas", "Reservas", "Equipo"].map((item, i) => (
              <div
                key={item}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs mb-1 ${
                  i === 1
                    ? "bg-brand-purple/10 text-brand-purple font-medium"
                    : "text-gray-500"
                }`}
              >
                <div className={`w-4 h-4 rounded ${i === 1 ? "bg-brand-purple/20" : "bg-gray-200"}`} />
                {item}
              </div>
            ))}
          </div>

          {/* Main content */}
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dashboard</p>
                <p className="text-sm font-semibold text-gray-900">Hoy, 28 Mar</p>
              </div>
              <div className="flex gap-2">
                <div className="h-7 px-3 rounded-lg bg-brand-purple text-white text-[10px] font-medium flex items-center">+ Nuevo lavado</div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Servicios hoy", val: "42", change: "+12%", color: "text-emerald-600" },
                { label: "En proceso", val: "8", change: "3 listos", color: "text-brand-purple" },
                { label: "Facturado", val: "$184,500", change: "+8%", color: "text-emerald-600" },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-xl border border-gray-100 bg-white p-3">
                  <p className="text-[9px] text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">{kpi.val}</p>
                  <p className={`text-[10px] ${kpi.color} mt-0.5`}>{kpi.change}</p>
                </div>
              ))}
            </div>

            {/* Chart placeholder */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 h-28 flex items-end gap-1">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-brand-purple/20 rounded-t"
                  style={{ height: `${h}%` }}
                >
                  <div
                    className="w-full bg-brand-purple rounded-t"
                    style={{ height: `${60 + Math.random() * 40}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Phone mockup — floating */}
      <div
        className="absolute -bottom-8 -right-4 sm:-right-8 w-36 sm:w-44"
        data-parallax="-0.08"
      >
        <div className="rounded-[20px] border-[3px] border-gray-800 bg-gray-900 p-1.5 shadow-2xl">
          <div className="rounded-[14px] bg-white overflow-hidden">
            {/* Phone status bar */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900">
              <span className="text-[8px] text-white">19:42</span>
              <div className="w-12 h-3 rounded-full bg-gray-800" />
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-white/60" />
                <div className="w-2.5 h-2.5 rounded-sm bg-white/60" />
              </div>
            </div>
            {/* WhatsApp-style message */}
            <div className="p-2.5 bg-[#ECE5DD] min-h-[160px] sm:min-h-[200px]">
              <div className="bg-white rounded-lg p-2 shadow-sm mb-2 max-w-[90%]">
                <p className="text-[8px] font-medium text-brand-purple">PickUp Time</p>
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

      {/* Floating notification card */}
      <div
        className="absolute -top-4 -left-4 sm:-left-8 bg-white rounded-xl shadow-lg border border-gray-100 p-3 w-48 sm:w-56"
        data-parallax="0.06"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-medium text-gray-900">Servicio completado</p>
            <p className="text-[9px] text-gray-400">hace 2 min</p>
          </div>
        </div>
        <p className="text-[9px] text-gray-500">WhatsApp enviado a +54 11 ****-4523</p>
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

  useParallax();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="min-h-screen bg-white text-gray-900 font-sans selection:bg-brand-purple/20 overflow-x-hidden"
    >
      {/* ============================================================ */}
      {/*  NAV                                                         */}
      {/* ============================================================ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-brand-purple">PickUp</span>
            <span className={scrolled ? "text-gray-900" : "text-white"}>Time</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm">
            {[
              { label: "Producto", href: "#features" },
              { label: "Casos de uso", href: "#usecases" },
              { label: "Precios", href: "#pricing" },
              { label: "Como funciona", href: "#how" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition-colors hover:text-brand-purple ${
                  scrolled ? "text-gray-600" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`hidden sm:inline-flex text-sm font-medium transition-colors ${
                scrolled ? "text-gray-600 hover:text-gray-900" : "text-white/80 hover:text-white"
              }`}
            >
              Iniciar sesion
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white hover:bg-brand-purple-dark transition-colors"
            >
              Probar gratis
            </Link>
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className={`md:hidden p-1 ${scrolled ? "text-gray-700" : "text-white"}`}
              aria-label="Menu"
            >
              {mobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-5 py-4 space-y-3">
              {[
                { label: "Producto", href: "#features" },
                { label: "Casos de uso", href: "#usecases" },
                { label: "Precios", href: "#pricing" },
                { label: "Como funciona", href: "#how" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenu(false)}
                  className="block text-sm text-gray-600 hover:text-brand-purple py-1"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ============================================================ */}
      {/*  HERO                                                        */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1920&h=1080&fit=crop&q=80"
            alt="Equipo profesional trabajando"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/80" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 lg:px-8 py-32 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — copy */}
            <div>
              <p
                data-animate="fade-up"
                className="text-sm font-medium text-brand-fuchsia tracking-wide uppercase mb-4"
              >
                Notificaciones inteligentes para tu negocio
              </p>

              <h1
                data-animate="fade-up"
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-white"
              >
                Tus clientes informados,{" "}
                <span className="text-brand-fuchsia">tu negocio organizado</span>
              </h1>

              <p
                data-animate="fade-up"
                className="mt-6 text-lg text-white/70 leading-relaxed max-w-xl"
              >
                Conecta con tus clientes por WhatsApp de forma automatica.
                Para lavaderos, talleres, veterinarias y cualquier negocio de servicios.
              </p>

              <div data-animate="fade-up" className="mt-10 flex flex-col sm:flex-row items-start gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-7 py-3.5 text-base font-semibold text-white hover:bg-brand-purple-dark transition-colors"
                >
                  Comenzar gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-7 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors"
                >
                  Ver como funciona
                </a>
              </div>

              <div data-animate="fade-up" className="mt-10 flex items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-fuchsia" />
                  14 dias gratis
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-fuchsia" />
                  Sin tarjeta
                </span>
                <span className="hidden sm:flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-brand-fuchsia" />
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
          <ChevronDown className="h-6 w-6 text-white/40" />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SOCIAL PROOF                                                */}
      {/* ============================================================ */}
      <section className="py-12 bg-gray-50 border-y border-gray-100">
        <div data-animate="fade-up" className="mx-auto max-w-5xl px-5 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-10 sm:gap-16">
            {[
              { value: "+50", label: "Negocios activos" },
              { value: "+10,000", label: "Notificaciones enviadas" },
              { value: "4.9", label: "Valoracion promedio", hasStar: true },
              { value: "<2 min", label: "Tiempo de respuesta" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                  {stat.hasStar && (
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  USE CASES — staggered, large images with parallax           */}
      {/* ============================================================ */}
      <section id="usecases" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-20">
            <p className="text-sm font-medium text-brand-purple tracking-wide uppercase mb-3">
              Casos de uso
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Para todo negocio que atiende clientes
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Si tu cliente deja algo, espera un servicio o necesita un aviso,
              PickUp Time lo resuelve.
            </p>
          </div>

          <div className="space-y-24 sm:space-y-32">
            {useCases.map((uc, i) => (
              <div
                key={uc.title}
                data-animate={uc.align === "left" ? "slide-right" : "slide-left"}
                className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                  uc.align === "right" ? "lg:direction-rtl" : ""
                }`}
                style={{ direction: "ltr" }}
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden rounded-2xl h-[300px] sm:h-[400px] lg:h-[450px] ${
                    uc.align === "right" ? "lg:order-2" : ""
                  }`}
                >
                  <div data-parallax={i % 2 === 0 ? "0.05" : "-0.05"} className="absolute inset-[-20px]">
                    <Image
                      src={uc.img}
                      alt={uc.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
                </div>

                {/* Text */}
                <div className={uc.align === "right" ? "lg:order-1" : ""}>
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-purple/10 text-brand-purple mb-5">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    {uc.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-lg">{uc.desc}</p>
                  <div className="mt-6 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      WhatsApp automatico
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      QR integrado
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURES                                                    */}
      {/* ============================================================ */}
      <section id="features" className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-14">
            <p className="text-sm font-medium text-brand-purple tracking-wide uppercase mb-3">
              Funcionalidades
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Herramientas pensadas para que vos te enfoques en el servicio y
              tus clientes esten siempre informados.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                data-animate="fade-up"
                className="rounded-xl bg-white border border-gray-100 p-6 hover:shadow-md hover:border-brand-purple/20 transition-all duration-300"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-lg bg-brand-purple/8 text-brand-purple">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
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
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — image */}
            <div data-animate="slide-right" className="relative rounded-2xl overflow-hidden h-[400px] lg:h-[500px]">
              <Image
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&q=80"
                alt="Cliente usando celular"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 to-transparent" />
            </div>

            {/* Right — steps */}
            <div>
              <div data-animate="fade-up">
                <p className="text-sm font-medium text-brand-purple tracking-wide uppercase mb-3">
                  Como funciona
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Tres pasos, cero friccion
                </h2>
                <p className="mt-4 text-gray-500 max-w-md">
                  Tu cliente no necesita descargar nada. Solo su celular y WhatsApp.
                </p>
              </div>

              <div className="mt-10 space-y-8">
                {steps.map((step, i) => (
                  <div
                    key={step.num}
                    data-animate="slide-left"
                    className="flex gap-5"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-purple text-white flex items-center justify-center text-lg font-bold">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  RESULTS                                                     */}
      {/* ============================================================ */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div data-animate="slide-right">
              <p className="text-sm font-medium text-brand-purple tracking-wide uppercase mb-3">
                Resultados reales
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Menos llamadas, mas clientes satisfechos
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Los negocios que usan PickUp Time reducen las llamadas de
                seguimiento en un 80% y mejoran la experiencia de sus clientes
                con notificaciones automaticas por WhatsApp.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  { icon: Clock, value: "-80%", label: "Llamadas" },
                  { icon: TrendingUp, value: "+35%", label: "Retencion" },
                  { icon: Star, value: "4.9/5", label: "Satisfaccion" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <stat.icon className="h-5 w-5 text-brand-purple mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div data-animate="slide-left" className="relative rounded-2xl overflow-hidden h-[350px]">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=600&fit=crop&q=80"
                alt="Equipo de trabajo satisfecho"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  PRICING                                                     */}
      {/* ============================================================ */}
      <section id="pricing" className="py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div data-animate="fade-up" className="text-center mb-14">
            <p className="text-sm font-medium text-brand-purple tracking-wide uppercase mb-3">
              Precios
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Planes simples, sin sorpresas
            </h2>
            <p className="mt-4 text-gray-500 max-w-lg mx-auto">
              Empeza gratis y escala a medida que crece tu negocio.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                data-animate="fade-up"
                className={`relative rounded-xl border p-7 transition-all ${
                  plan.popular
                    ? "border-brand-purple bg-white shadow-lg shadow-brand-purple/8 scale-[1.02]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-purple px-4 py-1 text-xs font-semibold text-white">
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
                  href="/login"
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-brand-purple text-white hover:bg-brand-purple-dark"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-brand-purple shrink-0 mt-0.5" />
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
      <section className="py-24 sm:py-32 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand-purple/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-brand-fuchsia/15 blur-[120px]" />
        </div>
        <div data-animate="fade-up" className="relative mx-auto max-w-3xl px-5 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Tu proximo cliente ya tiene WhatsApp.{" "}
            <span className="text-brand-fuchsia">Solo falta conectarlo.</span>
          </h2>
          <p className="mt-4 text-gray-400 text-lg">
            14 dias gratis, sin tarjeta de credito. Configura tu cuenta en 5 minutos.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-8 py-4 text-base font-semibold text-white hover:bg-brand-purple-dark transition-colors"
            >
              Comenzar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FOOTER                                                      */}
      {/* ============================================================ */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-lg font-bold tracking-tight">
              <span className="text-brand-purple">PickUp</span>
              <span className="text-white">Time</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a href="#features" className="hover:text-gray-300 transition-colors">Producto</a>
              <a href="#pricing" className="hover:text-gray-300 transition-colors">Precios</a>
              <a href="#how" className="hover:text-gray-300 transition-colors">Como funciona</a>
              <a href="mailto:contacto@pickuptime.app" className="hover:text-gray-300 transition-colors">Contacto</a>
            </div>

            <p className="text-xs text-gray-600">&copy; 2026 PickUp Time</p>
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

        /* Base state for all animated elements */
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

        /* Revealed state */
        [data-animate].in-view {
          opacity: 1;
          transform: translateY(0) translateX(0) scale(1);
        }
      `}</style>
    </div>
  );
}
