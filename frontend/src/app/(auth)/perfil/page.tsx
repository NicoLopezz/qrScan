"use client";

import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PerfilPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-lg space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informacion del Local</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rol</span>
            <Badge variant="secondary" className="capitalize">{user.permiso}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Local Number</span>
            <span className="font-mono">{user.localNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Admin ID</span>
            <span className="font-mono text-xs">{user.adminId}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
