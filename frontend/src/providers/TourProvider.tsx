"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Joyride, ACTIONS, STATUS } from "react-joyride";
/* eslint-disable @typescript-eslint/no-explicit-any */
type Step = any;
type CallBackProps = any;
import { useAuth } from "@/providers/AuthProvider";
import { fetchApi } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Tour steps                                                         */
/* ------------------------------------------------------------------ */
/* Steps per section — disableBeacon on all to avoid spinner */
const STEPS: Record<string, Step[]> = {
  "/dashboard": [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "Bienvenido a PickUp Time!",
      content: "Te vamos a mostrar las funciones principales. Podes saltar el tour cuando quieras.",
    },
    {
      target: '[data-tour="sidebar-nav"]',
      placement: "right",
      disableBeacon: true,
      title: "Navegacion",
      content: "Desde aca accedes a todas las secciones: lavados, caja, reservas, equipo y mas.",
    },
    {
      target: '[data-tour="kpi-cards"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Tu resumen diario",
      content: "Estos numeros se actualizan en tiempo real: servicios del dia, en proceso y facturacion.",
    },
    {
      target: '[data-tour="recent-table"]',
      placement: "top",
      disableBeacon: true,
      title: "Actividad reciente",
      content: "Aca ves los ultimos servicios. Hace click en cualquiera para ver el detalle.",
    },
    {
      target: '[data-tour="theme-toggle"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Modo claro / oscuro",
      content: "Cambia entre modo claro y oscuro. Tu preferencia se guarda automaticamente.",
    },
  ],
  "/lavados": [
    {
      target: '[data-tour="lavados-search"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Buscar servicios",
      content: "Busca por patente, nombre o modelo. Los resultados se filtran al instante.",
    },
    {
      target: '[data-tour="lavados-view-toggle"]',
      placement: "bottom",
      disableBeacon: true,
      title: "Cambiar vista",
      content: "Alterna entre kanban y tabla. En kanban podes arrastrar servicios entre columnas: cola → proceso → listo → retirado.",
    },
    {
      target: '[data-tour="new-lavado-btn"]',
      placement: "left",
      disableBeacon: true,
      title: "Registrar servicio",
      content: "Toca aca para cargar un nuevo servicio. Se genera un QR que tu cliente escanea con WhatsApp.",
    },
  ],
  "/caja": [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "Caja y cobros",
      content: "Aca gestionas turnos, medios de pago y el arqueo diario. Multi-caja y split payments.",
    },
  ],
  "/mensajes": [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "Mensajes",
      content: "Historial de mensajes enviados a tus clientes por WhatsApp o Telegram.",
    },
  ],
  "/clientes": [
    {
      target: "body",
      placement: "center",
      disableBeacon: true,
      title: "Clientes",
      content: "Base de datos de tus clientes con historial de servicios, contacto y estadisticas.",
    },
  ],
};

/* ------------------------------------------------------------------ */
/*  Joyride custom styles                                              */
/* ------------------------------------------------------------------ */
const joyrideStyles = {
  options: {
    zIndex: 10000,
    primaryColor: "#171717",
    arrowColor: "#ffffff",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    overlayColor: "rgba(0, 0, 0, 0.4)",
  },
  tooltip: {
    borderRadius: "16px",
    padding: "20px 24px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    fontSize: "14px",
  },
  tooltipTitle: {
    fontSize: "16px",
    fontWeight: 600,
    marginBottom: "4px",
  },
  tooltipContent: {
    padding: "8px 0 0",
    lineHeight: "1.5",
  },
  buttonNext: {
    backgroundColor: "#171717",
    borderRadius: "10px",
    padding: "8px 20px",
    fontSize: "13px",
    fontWeight: 600,
  },
  buttonBack: {
    color: "#171717",
    fontSize: "13px",
    fontWeight: 500,
    marginRight: "8px",
  },
  buttonSkip: {
    color: "#9ca3af",
    fontSize: "12px",
  },
  spotlight: {
    borderRadius: "16px",
  },
  beacon: {
    display: "none",
  },
};

/* ------------------------------------------------------------------ */
/*  Tracked sections in localStorage                                   */
/* ------------------------------------------------------------------ */
const SEEN_KEY = "pickuptime-tour-seen";

function getSeenSections(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function markSectionSeen(section: string) {
  const seen = getSeenSections();
  seen.add(section);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
interface TourContextType {
  startTour: () => void;
  resetTour: () => void;
}

const TourContext = createContext<TourContextType>({
  startTour: () => {},
  resetTour: () => {},
});

export const useTour = () => useContext(TourContext);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */
export function TourProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const activeSection = useRef<string | null>(null);

  // When user enters a section with tour steps, auto-show if not seen yet
  useEffect(() => {
    if (!user || user.tourCompleted) return;
    // Don't interrupt a running tour
    if (run) return;

    const sectionSteps = STEPS[pathname];
    if (!sectionSteps) return;

    const seen = getSeenSections();
    if (seen.has(pathname)) return;

    // Delay to let page render
    activeSection.current = pathname;
    const t = setTimeout(() => {
      setSteps(sectionSteps);
      setRun(true);
    }, 600);
    return () => clearTimeout(t);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCallback = useCallback(
    (data: CallBackProps) => {
      const { action, status } = data;

      if (status === STATUS.FINISHED || status === STATUS.SKIPPED || action === ACTIONS.CLOSE) {
        setRun(false);
        // Mark this section as seen
        if (activeSection.current) {
          markSectionSeen(activeSection.current);
        }

        // If user has seen all sections with steps, mark tour as fully completed
        const seen = getSeenSections();
        const allSections = Object.keys(STEPS);
        if (allSections.every((s) => seen.has(s))) {
          updateUser({ tourCompleted: true });
          fetchApi("/api/tour-status", {
            method: "PATCH",
            body: JSON.stringify({ completed: true }),
          }).catch(() => {});
        }
      }
    },
    [updateUser]
  );

  // Manual trigger: restart tour for current section
  const startTour = useCallback(() => {
    const sectionSteps = STEPS[pathname];
    if (sectionSteps) {
      activeSection.current = pathname;
      setSteps(sectionSteps);
      setRun(true);
    }
  }, [pathname]);

  // Reset all tour progress
  const resetTour = useCallback(() => {
    localStorage.removeItem(SEEN_KEY);
    updateUser({ tourCompleted: false });
    fetchApi("/api/tour-status", {
      method: "PATCH",
      body: JSON.stringify({ completed: false }),
    }).catch(() => {});
  }, [updateUser]);

  return (
    <TourContext.Provider value={{ startTour, resetTour }}>
      {children}
      {(Joyride as any)({
        steps,
        run,
        continuous: true,
        showSkipButton: true,
        showProgress: true,
        disableOverlayClose: true,
        disableScrolling: false,
        scrollOffset: 80,
        callback: handleCallback,
        styles: joyrideStyles,
        locale: {
          back: "Atras",
          close: "Cerrar",
          last: "Entendido",
          next: "Siguiente",
          open: "Abrir",
          skip: "Saltar",
        },
        floaterProps: { disableAnimation: true },
      })}
    </TourContext.Provider>
  );
}
