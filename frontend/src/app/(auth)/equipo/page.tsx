"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Shield, ShieldCheck, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMember {
  _id: string;
  email: string;
  permiso: string;
  isOwner?: boolean;
}

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string; access: string }> = {
  Admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "bg-muted text-foreground",
    access: "Acceso completo",
  },
  editor: {
    label: "Empleado",
    icon: Shield,
    color: "bg-blue-50 text-blue-600",
    access: "Ventas y Lavados",
  },
  viewer: {
    label: "Viewer",
    icon: Eye,
    color: "bg-muted text-muted-foreground",
    access: "Solo lectura",
  },
};

export default function EquipoPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<TeamMember | null>(null);

  const { data: equipo, isLoading } = useQuery({
    queryKey: ["equipo", user?.adminId],
    queryFn: () => fetchApi<TeamMember[]>(`/api/usuarios`),
    enabled: !!user?.adminId,
    select: (res) => res.data,
  });

  const crear = useMutation({
    mutationFn: (body: { email: string; password: string; role: string }) =>
      fetchApi(`/api/usuarios`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipo"] });
      toast.success("Miembro agregado");
      setShowForm(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const editar = useMutation({
    mutationFn: ({ id, ...body }: { id: string; email?: string; password?: string; role?: string }) =>
      fetchApi(`/api/usuarios/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipo"] });
      toast.success("Miembro actualizado");
      setEditingMember(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const eliminar = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/api/usuarios/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipo"] });
      toast.success("Miembro eliminado");
      setShowDeleteConfirm(null);
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  const owner = equipo?.find((m) => m.isOwner);
  const members = equipo?.filter((m) => !m.isOwner) ?? [];

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Owner card */}
      {owner && (
        <div className="card-elevated rounded-2xl bg-white dark:bg-card p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                {owner.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{owner.email}</p>
                <p className="text-xs text-muted-foreground">Propietario de la cuenta</p>
              </div>
            </div>
            <Badge className="bg-muted text-foreground border-0 text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" /> Admin
            </Badge>
          </div>
        </div>
      )}

      {/* Team members */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          Miembros del equipo
          <Badge variant="secondary" className="ml-2 tabular-nums">{members.length}</Badge>
        </p>
        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-foreground text-background hover:bg-foreground/90 text-xs cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
        </Button>
      </div>

      {members.length > 0 ? (
        <div className="space-y-2">
          {members.map((m) => {
            const config = ROLE_CONFIG[m.permiso] ?? ROLE_CONFIG.viewer;
            const Icon = config.icon;
            return (
              <div
                key={m._id}
                className="card-elevated rounded-2xl bg-white dark:bg-card p-4 flex items-center justify-between transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                    {m.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.email}</p>
                    <p className="text-xs text-muted-foreground">{config.access}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`border-0 text-[10px] ${config.color}`}>
                    <Icon className="h-3 w-3 mr-0.5" /> {config.label}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => setEditingMember(m)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 cursor-pointer text-red-400 hover:text-red-600"
                    onClick={() => setShowDeleteConfirm(m)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-elevated rounded-2xl bg-white dark:bg-card p-8 text-center">
          <Shield className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Sin miembros en el equipo</p>
          <p className="text-xs text-muted-foreground">Agrega empleados para que accedan a Ventas y Lavados</p>
        </div>
      )}

      {/* Roles info */}
      <div className="card-elevated rounded-2xl bg-white dark:bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Permisos por rol</p>
        <div className="space-y-2.5">
          {Object.entries(ROLE_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge className={`border-0 text-[10px] ${config.color}`}>
                    <Icon className="h-3 w-3 mr-0.5" /> {config.label}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{config.access}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create dialog */}
      <CrearMiembroDialog
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={(data) => crear.mutate(data)}
        isPending={crear.isPending}
      />

      {/* Edit dialog */}
      <EditarMiembroDialog
        member={editingMember}
        onOpenChange={(open) => { if (!open) setEditingMember(null); }}
        onSubmit={(data) => editar.mutate(data)}
        isPending={editar.isPending}
      />

      {/* Delete confirm */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(open) => { if (!open) setShowDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-sm p-5 gap-0 rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg tracking-tight">Eliminar miembro</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Estas seguro que queres eliminar a <strong>{showDeleteConfirm?.email}</strong>? Esta accion no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl text-xs cursor-pointer" onClick={() => setShowDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              className="flex-1 rounded-xl text-xs bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              onClick={() => showDeleteConfirm && eliminar.mutate(showDeleteConfirm._id)}
              disabled={eliminar.isPending}
            >
              {eliminar.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CrearMiembroDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: { email: string; password: string; role: string }) => void;
  isPending: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("editor");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg tracking-tight">Nuevo miembro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input className="h-10 rounded-xl text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Contrasena</Label>
            <Input className="h-10 rounded-xl text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Rol</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
              <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Empleado — Ventas y Lavados</SelectItem>
                <SelectItem value="viewer">Viewer — Solo lectura</SelectItem>
                <SelectItem value="Admin">Admin — Acceso completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer" disabled={isPending}>
            {isPending ? "Creando..." : "Agregar miembro"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditarMiembroDialog({
  member,
  onOpenChange,
  onSubmit,
  isPending,
}: {
  member: TeamMember | null;
  onOpenChange: (o: boolean) => void;
  onSubmit: (data: { id: string; email?: string; password?: string; role?: string }) => void;
  isPending: boolean;
}) {
  const [email, setEmail] = useState(member?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(member?.permiso ?? "editor");

  // Sync state when member changes
  if (member && email !== member.email && password === "") {
    setEmail(member.email);
    setRole(member.permiso);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;
    onSubmit({
      id: member._id,
      email,
      role,
      ...(password ? { password } : {}),
    });
  };

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-5 gap-0 rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg tracking-tight">Editar miembro</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
            <Input className="h-10 rounded-xl text-sm" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Nueva contrasena</Label>
            <Input className="h-10 rounded-xl text-sm" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Dejar vacio para no cambiar" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Rol</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
              <SelectTrigger className="h-10 rounded-xl text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="editor">Empleado — Ventas y Lavados</SelectItem>
                <SelectItem value="viewer">Viewer — Solo lectura</SelectItem>
                <SelectItem value="Admin">Admin — Acceso completo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 cursor-pointer" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
