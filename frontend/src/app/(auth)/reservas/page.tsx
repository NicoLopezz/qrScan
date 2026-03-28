"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, QrCode } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { fetchApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Reserva } from "@/types";

export default function ReservasPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", comensales: 1, observacion: "" });
  const [loading, setLoading] = useState(false);

  const { data: reservas, isLoading } = useQuery({
    queryKey: ["reservas", user?.adminId],
    queryFn: () => fetchApi<Reserva[]>(`/api/admins/${user?.adminId}/reservas`),
    enabled: !!user?.adminId,
    select: (res) => res.data,
  });

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi("/api/admins/agregarCliente", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Reserva agregada");
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
      setShowForm(false);
      setForm({ nombre: "", comensales: 1, observacion: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await fetchApi(`/api/reservas/${id}/eliminar`, { method: "DELETE" });
      toast.success("Reserva eliminada");
      queryClient.invalidateQueries({ queryKey: ["reservas"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  const handleCountdown = async (id: string) => {
    try {
      await fetchApi("/api/enviarMensajeCuentaRegresiva", {
        method: "POST",
        body: JSON.stringify({ clienteId: id }),
      });
      toast.success("Mensaje de cuenta regresiva enviado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Reservas
          <Badge variant="secondary" className="ml-2">{reservas?.length ?? 0}</Badge>
        </h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-brand-purple hover:bg-brand-purple-dark text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Nueva Reserva
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reservas?.map((r) => (
          <Card key={r._id} className="border-0 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{r.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.comensales} comensales
                  </p>
                </div>
                {r.textConfirmation && (
                  <Badge className="bg-green-100 text-green-700">Confirmada</Badge>
                )}
              </div>
              {r.observacion && (
                <p className="text-sm text-muted-foreground">{r.observacion}</p>
              )}
              {r.from && (
                <p className="text-xs text-muted-foreground">Tel: {r.from}</p>
              )}
              <div className="flex gap-1.5 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => handleCountdown(r._id)}
                  disabled={!r.from}
                >
                  <WhatsAppIcon className="h-3 w-3 mr-1" /> Aviso
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 text-red-500 hover:text-red-600"
                  onClick={() => handleEliminar(r._id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!reservas || reservas.length === 0) && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No hay reservas
        </p>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nueva Reserva</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAgregar} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Comensales</Label>
              <Input
                type="number"
                min={1}
                value={form.comensales}
                onChange={(e) => setForm({ ...form, comensales: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Observacion</Label>
              <Textarea
                value={form.observacion}
                onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                rows={2}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-brand-purple hover:bg-brand-purple-dark text-white"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Agregar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
