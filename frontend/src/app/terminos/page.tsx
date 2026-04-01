"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "31 de marzo de 2026";
const CONTACT_EMAIL = "soporte@pickuptime.com";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <span className="text-border">|</span>
          <span className="text-sm font-semibold">PickUp Time</span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Terminos de Servicio</h1>
        <p className="text-sm text-muted-foreground mb-8">Ultima actualizacion: {LAST_UPDATED}</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Aceptacion de los terminos</h2>
            <p>
              Al registrarte y utilizar PickUp Time, aceptas estos terminos de servicio en su
              totalidad. Si no estas de acuerdo con alguno de estos terminos, no debes utilizar
              la plataforma.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Descripcion del servicio</h2>
            <p>
              PickUp Time es una plataforma SaaS que permite a negocios de servicios gestionar
              sus operaciones diarias: registro de trabajos, punto de venta, notificaciones a
              clientes, gestion de equipo y reportes. El servicio se ofrece "tal cual" y
              "segun disponibilidad".
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Cuentas y responsabilidades</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sos responsable de mantener la confidencialidad de tus credenciales</li>
              <li>Toda actividad realizada desde tu cuenta es tu responsabilidad</li>
              <li>Debes proporcionar informacion veraz y mantenerla actualizada</li>
              <li>Debes notificarnos inmediatamente si detectas un uso no autorizado de tu cuenta</li>
              <li>Debes ser mayor de 18 anos para utilizar el servicio</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Uso aceptable</h2>
            <p className="mb-2">Al usar PickUp Time, aceptas no:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Utilizar el servicio para fines ilegales o no autorizados</li>
              <li>Enviar spam, mensajes no solicitados o contenido abusivo a traves de los canales de mensajeria</li>
              <li>Intentar acceder a cuentas o datos de otros usuarios</li>
              <li>Realizar ingenieria inversa, descompilar o desensamblar el software</li>
              <li>Sobrecargar intencionalmente los servidores o infraestructura</li>
              <li>Revender o redistribuir el servicio sin autorizacion</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Mensajeria y canales de comunicacion</h2>
            <p>
              PickUp Time permite enviar notificaciones a clientes finales a traves de WhatsApp,
              Telegram y otros canales. Al utilizar estas funciones:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Aceptas cumplir con las politicas de uso de cada plataforma de mensajeria (Meta/WhatsApp, Telegram, etc.)</li>
              <li>Garantizas que tenes el consentimiento de tus clientes para enviarles mensajes</li>
              <li>Te comprometes a usar los canales unicamente para mensajes transaccionales relacionados con el servicio</li>
              <li>Sos responsable del contenido de los mensajes enviados desde tu cuenta</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Planes y pagos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Los planes y precios estan disponibles en la seccion de Billing de la plataforma</li>
              <li>El periodo de prueba gratuito es de 14 dias</li>
              <li>Los pagos se procesan de forma recurrente segun el ciclo contratado</li>
              <li>Podes cancelar tu suscripcion en cualquier momento desde tu cuenta</li>
              <li>No se realizan reembolsos por periodos parciales ya facturados</li>
              <li>Nos reservamos el derecho de modificar los precios con 30 dias de preaviso</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Propiedad intelectual</h2>
            <p>
              Todo el contenido, diseno, codigo, marcas y tecnologia de PickUp Time son propiedad
              exclusiva de la plataforma. Los datos que ingreses a la plataforma son de tu propiedad
              y podes exportarlos o solicitar su eliminacion en cualquier momento.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Disponibilidad del servicio</h2>
            <p>
              Nos esforzamos por mantener el servicio disponible 24/7, pero no garantizamos una
              disponibilidad ininterrumpida. Podremos realizar mantenimientos programados con
              previo aviso. No somos responsables por interrupciones causadas por terceros
              (proveedores de hosting, APIs externas, etc.).
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Limitacion de responsabilidad</h2>
            <p>
              PickUp Time no sera responsable por danos indirectos, incidentales, especiales o
              consecuentes que resulten del uso o la imposibilidad de uso del servicio. Nuestra
              responsabilidad maxima se limita al monto pagado por el usuario en los ultimos
              12 meses.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Suspension y terminacion</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Podemos suspender o cancelar tu cuenta si violas estos terminos</li>
              <li>Podemos suspender cuentas con pagos vencidos despues de un periodo de gracia</li>
              <li>Podes cancelar tu cuenta en cualquier momento desde la configuracion</li>
              <li>Al cancelar, tus datos se conservan por 30 dias antes de ser eliminados</li>
            </ul>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos terminos. Los cambios significativos
              seran notificados con al menos 15 dias de anticipacion por correo electronico o
              mediante un aviso en la plataforma.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contacto</h2>
            <p>
              Para consultas sobre estos terminos de servicio:
            </p>
            <div className="mt-3 rounded-xl border border-border p-4 bg-muted/30">
              <p className="font-medium text-foreground">PickUp Time</p>
              <p className="mt-1">Email: <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">{CONTACT_EMAIL}</a></p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} PickUp Time</span>
          <Link href="/privacidad" className="hover:text-foreground transition-colors">
            Politica de privacidad
          </Link>
        </div>
      </footer>
    </div>
  );
}
