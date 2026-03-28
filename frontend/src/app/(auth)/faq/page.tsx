import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  {
    q: "Como funciona el QR?",
    a: "Al dar de alta un lavado, se genera un codigo QR. El cliente lo escanea con su celular y es redirigido a WhatsApp con un mensaje pre-armado que confirma el servicio. El numero queda registrado automaticamente.",
  },
  {
    q: "Como envio notificaciones por WhatsApp?",
    a: "Desde la seccion Lavados, selecciona un lavado y usa los botones 'Aviso de Retiro' o 'Enviar Encuesta'. El mensaje se envia automaticamente al numero registrado del cliente.",
  },
  {
    q: "Como funciona la caja?",
    a: "La caja tiene dos niveles: Caja Mayor (ingresos/egresos principales) y Caja Chica (gastos menores). Cada una maneja arqueos (aperturas/cierres) con movimientos individuales.",
  },
  {
    q: "Que es un arqueo?",
    a: "Es una sesion de caja. Se abre con un saldo inicial, se registran movimientos (ingresos y egresos), y al cerrarla se compara el saldo del sistema con el real para detectar diferencias.",
  },
  {
    q: "Como gestiono las reservas?",
    a: "En la seccion Reservas podes agregar nuevas reservas con nombre, cantidad de comensales y observaciones. El cliente confirma via WhatsApp escaneando el QR.",
  },
];

export default function FaqPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold">Preguntas Frecuentes</h2>
      {faqs.map((faq, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{faq.q}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
