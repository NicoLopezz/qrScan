"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "31 de marzo de 2026";
const CONTACT_EMAIL = "privacidad@pickuptime.com";

export default function PrivacidadPage() {
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
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Politica de Privacidad</h1>
        <p className="text-sm text-muted-foreground mb-8">Ultima actualizacion: {LAST_UPDATED}</p>

        <div className="space-y-8 text-sm leading-relaxed text-foreground/80">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Informacion general</h2>
            <p>
              PickUp Time ("nosotros", "la plataforma") es un servicio SaaS de gestion operativa
              para negocios de servicios (lavaderos de autos, peluquerias, talleres y similares).
              Esta politica describe como recopilamos, usamos, almacenamos y protegemos la informacion
              personal de nuestros usuarios y sus clientes finales.
            </p>
            <p className="mt-2">
              Al utilizar PickUp Time, aceptas los terminos descritos en esta politica. Si no estas
              de acuerdo, por favor no utilices nuestros servicios.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Datos que recopilamos</h2>

            <h3 className="font-medium text-foreground mt-4 mb-2">2.1 Datos del negocio (usuario registrado)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre del negocio y datos de contacto</li>
              <li>Correo electronico y contrasena (cifrada)</li>
              <li>Informacion del equipo de trabajo (nombres, roles)</li>
              <li>Datos de facturacion y plan contratado</li>
            </ul>

            <h3 className="font-medium text-foreground mt-4 mb-2">2.2 Datos de clientes finales</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre del cliente</li>
              <li>Numero de telefono (para notificaciones via WhatsApp/Telegram)</li>
              <li>Patente y modelo del vehiculo</li>
              <li>Historial de servicios realizados</li>
            </ul>

            <h3 className="font-medium text-foreground mt-4 mb-2">2.3 Datos de uso</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Registros de actividad dentro de la plataforma</li>
              <li>Direccion IP y tipo de dispositivo</li>
              <li>Datos de navegacion anonimizados para mejorar el servicio</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Como usamos la informacion</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Proveer y mantener el funcionamiento de la plataforma</li>
              <li>Enviar notificaciones a clientes finales sobre el estado de sus servicios (via WhatsApp, Telegram u otros canales configurados por el negocio)</li>
              <li>Procesar pagos y facturacion</li>
              <li>Generar reportes y metricas de negocio para el usuario registrado</li>
              <li>Mejorar la calidad del servicio y la experiencia de usuario</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Servicios de terceros</h2>
            <p className="mb-2">Utilizamos los siguientes servicios de terceros para operar la plataforma:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Meta / WhatsApp Business API:</strong> para enviar notificaciones a clientes finales. Se comparte el numero de telefono del cliente final unicamente con el fin de entregar el mensaje. Meta procesa estos datos segun su propia <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">politica de privacidad</a>.</li>
              <li><strong>Telegram Bot API:</strong> canal alternativo de notificaciones. Se comparte el identificador de chat del cliente.</li>
              <li><strong>MongoDB Atlas:</strong> almacenamiento de datos en la nube con cifrado en reposo.</li>
              <li><strong>Vercel:</strong> hosting del frontend.</li>
              <li><strong>Render:</strong> hosting del backend y API.</li>
              <li><strong>Procesadores de pago</strong> (MercadoPago, Stripe u otros segun la region): para gestionar suscripciones. Solo se comparten los datos necesarios para procesar el pago.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Almacenamiento y seguridad</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Las contrasenas se almacenan con hash seguro (bcrypt)</li>
              <li>La comunicacion se realiza exclusivamente por HTTPS</li>
              <li>Los datos se almacenan en servidores con cifrado en reposo</li>
              <li>El acceso a datos esta protegido por autenticacion JWT con tokens de expiracion</li>
              <li>Se implementan roles y permisos para limitar el acceso interno</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Retencion de datos</h2>
            <p>
              Los datos del negocio se conservan mientras la cuenta este activa. Los datos de clientes
              finales se conservan mientras el negocio mantenga su cuenta activa y los necesite para
              su operacion. Al cancelar la cuenta, los datos se eliminan en un plazo de 30 dias,
              excepto aquellos que debamos conservar por obligaciones legales o fiscales.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Derechos del usuario</h2>
            <p className="mb-2">Como usuario, tenes derecho a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acceso:</strong> solicitar una copia de tus datos personales</li>
              <li><strong>Rectificacion:</strong> corregir datos inexactos o incompletos</li>
              <li><strong>Eliminacion:</strong> solicitar la eliminacion de tu cuenta y datos asociados</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado</li>
              <li><strong>Oposicion:</strong> oponerte al procesamiento de tus datos en determinados casos</li>
              <li><strong>Revocacion:</strong> retirar tu consentimiento en cualquier momento</li>
            </ul>
            <p className="mt-2">
              Los clientes finales pueden ejercer sus derechos contactando al negocio que utiliza
              PickUp Time, o directamente a nosotros en <a href={`mailto:${CONTACT_EMAIL}`} className="underline hover:text-foreground">{CONTACT_EMAIL}</a>.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Uso de datos de WhatsApp</h2>
            <p>
              Cuando un negocio configura WhatsApp como canal de notificacion, PickUp Time actua
              como intermediario tecnico para enviar mensajes transaccionales (estado del servicio,
              confirmaciones, recordatorios). Especificamente:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Solo enviamos mensajes relacionados con el servicio contratado por el cliente final</li>
              <li>No utilizamos los datos de WhatsApp para marketing, publicidad ni venta a terceros</li>
              <li>No almacenamos el contenido de mensajes de WhatsApp mas alla del registro de envio</li>
              <li>El numero de telefono se utiliza exclusivamente para la entrega del mensaje</li>
              <li>Los datos de WhatsApp no se comparten con otros negocios ni usuarios de la plataforma</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Cookies y tecnologias similares</h2>
            <p>
              Utilizamos cookies esenciales para mantener la sesion del usuario y preferencias de
              la interfaz (como el tema claro/oscuro). No utilizamos cookies de seguimiento ni de
              publicidad de terceros.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Menores de edad</h2>
            <p>
              PickUp Time no esta dirigido a menores de 18 anos. No recopilamos intencionalmente
              informacion de menores. Si detectamos datos de un menor, los eliminaremos de inmediato.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Cambios en esta politica</h2>
            <p>
              Podemos actualizar esta politica periodicamente. Notificaremos los cambios significativos
              por correo electronico o mediante un aviso en la plataforma. La fecha de ultima
              actualizacion se indica al inicio de este documento.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contacto</h2>
            <p>
              Si tenes preguntas, consultas o solicitudes relacionadas con esta politica de privacidad
              o el tratamiento de tus datos, podes contactarnos en:
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
          <Link href="/terminos" className="hover:text-foreground transition-colors">
            Terminos de servicio
          </Link>
        </div>
      </footer>
    </div>
  );
}
