"use client";

import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Card, CardContent } from "@/components/ui/card";

export default function MensajesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Card className="border-0 shadow-sm max-w-md w-full">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple-muted">
            <WhatsAppIcon className="h-8 w-8 text-brand-purple" />
          </div>
          <h2 className="text-lg font-semibold">Mensajes</h2>
          <p className="text-sm text-muted-foreground">
            El sistema de chat con clientes via WhatsApp estara disponible pronto.
            Los mensajes automaticos de notificacion ya funcionan desde la seccion Lavados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
