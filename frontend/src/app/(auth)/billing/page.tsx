"use client";

import { useState } from "react";
import { Check, CreditCard, Zap, Crown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 9900,
    period: "/mes",
    icon: Zap,
    color: "text-blue-600 bg-blue-50",
    features: [
      "1 sucursal",
      "500 mensajes WhatsApp/mes",
      "Lavados + Reservas",
      "1 usuario",
      "Soporte por email",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19900,
    period: "/mes",
    icon: Crown,
    color: "text-brand-purple bg-brand-purple-muted",
    popular: true,
    features: [
      "Hasta 3 sucursales",
      "2.000 mensajes WhatsApp/mes",
      "Lavados + Reservas + Caja",
      "5 usuarios",
      "Encuestas de calidad",
      "Reportes y graficos",
      "Soporte prioritario",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 39900,
    period: "/mes",
    icon: Building2,
    color: "text-amber-600 bg-amber-50",
    features: [
      "Sucursales ilimitadas",
      "Mensajes WhatsApp ilimitados",
      "Todas las funcionalidades",
      "Usuarios ilimitados",
      "API access",
      "Soporte dedicado 24/7",
      "Onboarding personalizado",
    ],
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("starter");

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Current plan status */}
      <div className="card-elevated rounded-2xl bg-white p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Plan Trial</p>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                  14 dias restantes
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tu periodo de prueba gratuita vence el 11 de abril, 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="rounded-xl text-xs cursor-pointer">
              <CreditCard className="h-3.5 w-3.5 mr-1" /> Agregar metodo de pago
            </Button>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Elegí tu plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`card-elevated rounded-2xl bg-white p-5 cursor-pointer transition-all duration-200 relative ${
                  isSelected
                    ? "ring-2 ring-brand-purple"
                    : "hover:ring-1 hover:ring-border"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 right-4 bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white border-0 text-[10px]">
                    Popular
                  </Badge>
                )}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${plan.color}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{plan.name}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-2xl font-bold tabular-nums">
                    ${plan.price.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-brand-success mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full mt-5 rounded-xl text-xs cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white"
                      : ""
                  }`}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                >
                  {isSelected ? "Seleccionado" : "Elegir plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment method placeholder */}
      <div className="card-elevated rounded-2xl bg-white p-5">
        <h3 className="text-sm font-semibold mb-3">Metodo de pago</h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <CreditCard className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground mb-1">No hay metodo de pago configurado</p>
            <p className="text-xs text-muted-foreground mb-4">Agrega una tarjeta para activar tu suscripcion</p>
            <Button size="sm" className="rounded-xl bg-gradient-to-r from-brand-purple to-brand-fuchsia text-white cursor-pointer">
              Agregar tarjeta
            </Button>
          </div>
        </div>
      </div>

      {/* Invoices placeholder */}
      <div className="card-elevated rounded-2xl bg-white p-5">
        <h3 className="text-sm font-semibold mb-3">Historial de facturacion</h3>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Sin facturas por el momento</p>
        </div>
      </div>
    </div>
  );
}
