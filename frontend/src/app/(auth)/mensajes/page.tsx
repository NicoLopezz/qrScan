"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Users,
  BarChart3,
  Star,
  Plus,
  Search,
  Zap,
  Radio,
  History,
  MessageSquare,
  RotateCcw,
  Ticket,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AutomatizacionCard } from "@/components/mensajes/AutomatizacionCard";
import { AutomatizacionModal } from "@/components/mensajes/AutomatizacionModal";
import { ChatModal } from "@/components/mensajes/ChatModal";
import {
  useMensajesStats,
  useSegmentos,
  useAutomatizaciones,
  useCrearAutomatizacion,
  useActualizarAutomatizacion,
  useToggleAutomatizacion,
  useBroadcast,
  useHistorial,
  useConversacion,
} from "@/hooks/useMensajes";
import type { Automatizacion, MensajeHistorial } from "@/types/mensajes";
import { toast } from "sonner";

const ESTADO_CONFIG: Record<
  string,
  { icon: React.ReactNode; color: string; label: string }
> = {
  enviado: {
    icon: <Send className="h-3 w-3" />,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    label: "Enviado",
  },
  respondio: {
    icon: <MessageSquare className="h-3 w-3" />,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Respondio",
  },
  volvio: {
    icon: <RotateCcw className="h-3 w-3" />,
    color: "text-foreground bg-muted dark:bg-muted",
    label: "Volvio",
  },
  uso_cupon: {
    icon: <Ticket className="h-3 w-3" />,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    label: "Uso cupon",
  },
  error: {
    icon: <AlertCircle className="h-3 w-3" />,
    color: "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400",
    label: "Error",
  },
};

function formatFecha(d: string) {
  return new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}
function formatHora(d: string) {
  return new Date(d).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function MensajesPage() {
  const searchParams = useSearchParams();

  // Modal state
  const [editingAuto, setEditingAuto] = useState<Automatizacion | null>(null);
  const [autoModalOpen, setAutoModalOpen] = useState(false);

  // Envío Rápido state
  const [broadcastSegmento, setBroadcastSegmento] = useState("todos");
  const [broadcastMensaje, setBroadcastMensaje] = useState("");

  // Historial state
  const [historialFiltro, setHistorialFiltro] = useState("todos");
  const [historialBusqueda, setHistorialBusqueda] = useState("");
  const [selectedTelefono, setSelectedTelefono] = useState<string | null>(null);

  // Deep link: /mensajes?telefono=xxx
  useEffect(() => {
    const tel = searchParams.get("telefono");
    if (tel) setSelectedTelefono(tel);
  }, [searchParams]);

  // Queries
  const { data: statsData } = useMensajesStats();
  const { data: segmentosData } = useSegmentos();
  const { data: autos, isLoading: autosLoading } = useAutomatizaciones();
  const { data: historialData } = useHistorial(historialFiltro, historialBusqueda);
  const { data: conversacionData } = useConversacion(selectedTelefono);

  // Mutations
  const crearAuto = useCrearAutomatizacion();
  const actualizarAuto = useActualizarAutomatizacion();
  const toggleAuto = useToggleAutomatizacion();
  const broadcastMut = useBroadcast();

  const stats = statsData ?? { totalEnviados: 0, reviews: 0, tasaRespuesta: 0, recuperados: 0 };
  const seg = segmentosData ?? { todos: 0, activos: 0, inactivos: 0, vip: 0 };
  const autosList = autos ?? [];
  const historialList = (historialData ?? []) as MensajeHistorial[];

  const segmentos = [
    { value: "todos", label: "Todos", count: seg.todos },
    { value: "activos", label: "Activos (30d)", count: seg.activos },
    { value: "inactivos", label: "Inactivos +30d", count: seg.inactivos },
    { value: "vip", label: "VIP / Frecuentes", count: seg.vip },
  ];

  const handleToggleAuto = (id: string) => {
    toggleAuto.mutate(id);
  };

  const handleSaveAuto = (data: Partial<Automatizacion>) => {
    if (data._id) {
      actualizarAuto.mutate(data as Automatizacion & { _id: string });
    } else {
      crearAuto.mutate(data);
    }
  };

  const handleEnviarBroadcast = () => {
    if (!broadcastMensaje.trim()) return;
    broadcastMut.mutate(
      { mensaje: broadcastMensaje, segmento: broadcastSegmento },
      {
        onSuccess: (res) => {
          const d = res.data;
          toast.success(`Enviado a ${d.enviados} clientes${d.errores ? ` (${d.errores} errores)` : ""}`);
          setBroadcastMensaje("");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Error al enviar"),
      }
    );
  };

  const handleClickHistorial = (h: MensajeHistorial) => {
    if (h.clienteTelefono) {
      setSelectedTelefono(h.clienteTelefono);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Send, color: "text-foreground", bg: "bg-muted", value: stats.totalEnviados, label: "Enviados" },
          { icon: Star, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", value: stats.reviews, label: "Reviews" },
          { icon: BarChart3, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", value: `${stats.tasaRespuesta}%`, label: "Respuesta" },
          { icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", value: stats.recuperados, label: "Recuperados" },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 rounded-2xl border border-border/30 bg-white dark:bg-card/80 px-4 py-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0 ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-semibold tabular-nums leading-tight">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="automatizaciones">
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="automatizaciones" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            Automatizaciones
          </TabsTrigger>
          <TabsTrigger value="envio" className="gap-1.5">
            <Radio className="h-3.5 w-3.5" />
            Envio Rapido
          </TabsTrigger>
          <TabsTrigger value="historial" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Automatizaciones ─────────────────────────── */}
        <TabsContent value="automatizaciones">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {autosLoading ? "..." : `${autosList.filter((a) => a.activa).length} activas de ${autosList.length}`}
              </p>
              <Button
                size="sm"
                className="h-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-medium shadow-md shadow-black/10 gap-1.5 cursor-pointer"
                onClick={() => { setEditingAuto(null); setAutoModalOpen(true); }}
              >
                <Plus className="h-3.5 w-3.5" />
                Nueva Regla
              </Button>
            </div>

            {autosLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
              </div>
            ) : autosList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 py-12 text-center">
                <Zap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay automatizaciones creadas</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Crea tu primera regla para empezar a automatizar mensajes</p>
              </div>
            ) : (
              <div className="space-y-2">
                {autosList.map((auto) => (
                  <AutomatizacionCard
                    key={auto._id}
                    auto={auto}
                    onToggle={handleToggleAuto}
                    onClick={(a) => { setEditingAuto(a); setAutoModalOpen(true); }}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Tab: Envío Rápido ─────────────────────────────── */}
        <TabsContent value="envio">
          <div className="max-w-lg space-y-5">
            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Destinatarios</p>
              <div className="space-y-1.5">
                {segmentos.map((s) => (
                  <label
                    key={s.value}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 cursor-pointer transition-colors ${broadcastSegmento === s.value ? "border-border bg-muted/50" : "border-border/40 hover:border-border"}`}
                    onClick={() => setBroadcastSegmento(s.value)}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${broadcastSegmento === s.value ? "border-foreground" : "border-muted-foreground/30"}`}>
                        {broadcastSegmento === s.value && <div className="h-2 w-2 rounded-full bg-foreground" />}
                      </div>
                      <span className="text-sm">{s.label}</span>
                    </div>
                    <Badge variant="secondary" className="border-0 text-[10px] bg-muted">{s.count}</Badge>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Mensaje</p>
              <Textarea
                value={broadcastMensaje}
                onChange={(e) => setBroadcastMensaje(e.target.value)}
                rows={4}
                className="rounded-xl resize-none text-sm"
                placeholder="Escribe tu mensaje..."
              />
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Dia de lluvia", text: "Despues de la lluvia tu auto necesita un lavado. Hoy con 15% OFF!" },
                  { label: "Promo 2x1", text: "HOY 2x1 en lavado completo! Trae tu auto y el de un amigo. Los esperamos!" },
                  { label: "Cerrado", text: "Hoy permanecemos cerrados. Nos vemos manana con todas las pilas!" },
                ].map((tpl) => (
                  <button key={tpl.label} onClick={() => setBroadcastMensaje(tpl.text)} className="cursor-pointer">
                    <Badge variant="secondary" className="text-[10px] border-0 bg-muted hover:bg-muted-foreground/10 cursor-pointer">{tpl.label}</Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                {segmentos.find((s) => s.value === broadcastSegmento)?.count ?? 0} mensajes a enviar
              </p>
              <Button
                size="sm"
                className="h-9 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs font-medium shadow-md shadow-black/10 gap-1.5 cursor-pointer"
                onClick={handleEnviarBroadcast}
                disabled={!broadcastMensaje.trim() || broadcastMut.isPending}
              >
                <Send className="h-3.5 w-3.5" />
                {broadcastMut.isPending ? "Enviando..." : "Enviar ahora"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Tab: Historial ────────────────────────────────── */}
        <TabsContent value="historial">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {[
                  { value: "todos", label: "Todos" },
                  { value: "automatico", label: "Automaticos" },
                  { value: "broadcast", label: "Broadcast" },
                  { value: "encuesta", label: "Encuestas" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setHistorialFiltro(f.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${historialFiltro === f.value ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="relative sm:ml-auto">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={historialBusqueda}
                  onChange={(e) => setHistorialBusqueda(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="h-8 rounded-lg pl-8 text-xs w-full sm:w-56"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border/30 bg-white dark:bg-card/80 overflow-hidden">
              <div className="hidden sm:grid grid-cols-[100px_1fr_120px_120px] gap-3 px-4 py-2.5 bg-muted/30 border-b border-border/20">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Fecha</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Cliente</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tipo</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Estado</span>
              </div>

              {historialList.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay mensajes para mostrar
                </div>
              ) : (
                historialList.map((h) => {
                  const est = ESTADO_CONFIG[h.estado] ?? ESTADO_CONFIG.enviado;
                  const fecha = h.fecha || (h as any).createdAt;
                  return (
                    <button
                      key={h._id}
                      onClick={() => handleClickHistorial(h)}
                      className="w-full text-left grid grid-cols-1 sm:grid-cols-[100px_1fr_120px_120px] gap-1 sm:gap-3 px-4 py-3 border-b border-border/10 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 sm:hidden" />
                        <span className="tabular-nums">{fecha ? `${formatFecha(fecha)} ${formatHora(fecha)}` : "--"}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{h.clienteNombre}</p>
                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">{h.mensaje}</p>
                      </div>
                      <div>
                        <Badge variant="secondary" className="border-0 text-[10px] bg-muted font-normal">{h.etiqueta}</Badge>
                      </div>
                      <div>
                        <Badge variant="secondary" className={`border-0 text-[10px] gap-1 ${est.color}`}>{est.icon}{est.label}</Badge>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AutomatizacionModal
        auto={editingAuto}
        open={autoModalOpen}
        onOpenChange={setAutoModalOpen}
        onSave={handleSaveAuto}
      />
      <ChatModal
        conversacion={conversacionData ?? null}
        onClose={() => setSelectedTelefono(null)}
      />
    </div>
  );
}
