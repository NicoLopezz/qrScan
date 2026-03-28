# Billing - Integración de Pagos Recurrentes

## Estrategia
- **Fase 1:** MercadoPago Suscripciones (rápido, clientes ya lo conocen, ~5% comisión)
- **Fase 2:** Migrar a Rebill con CBU/CVU (~1.8% comisión) cuando haya 50+ suscriptores

## Planes
| Plan | Precio | Límites |
|---|---|---|
| Starter | 99 ARS/mes | 1 sucursal, 50 lavados/mes, sin membresías |
| Pro | 199 ARS/mes | 1 sucursal, ilimitado, membresías, WhatsApp |
| Business | 399 ARS/mes por sucursal | Multi-sucursal, analytics, comisiones, inventario |

## Bloque 1 - Backend: Modelo + Rutas
- [ ] Crear modelo `Subscription` (adminId, plan, status, trialEndsAt, currentPeriodStart/End, paymentProvider, externalId)
- [ ] Agregar campo `subscription` al Admin model
- [ ] Controller `billing.controller.js` (subscribe, status, cancel, webhook)
- [ ] Rutas `/api/billing/subscribe`, `/api/billing/status`, `/api/billing/cancel`, `/api/billing/webhook`

## Bloque 2 - Integración MercadoPago
- [ ] Instalar SDK `mercadopago`
- [ ] Crear preapproval_plans para cada tier (Starter, Pro, Business)
- [ ] Endpoint que genera link de checkout MP y redirige al cliente
- [ ] Webhook que recibe eventos de MP (pago ok, fallido, cancelado) y actualiza Subscription

## Bloque 3 - Middleware de plan
- [ ] `checkSubscription()` — verifica plan activo o trial vigente
- [ ] `requirePlan('pro')` — bloquea features premium si el plan no alcanza
- [ ] Lógica de trial: 14 días gratis al registrarse, redirigir a /billing si venció

## Bloque 4 - Frontend: Conectar billing UI
- [ ] Botones "Elegir plan" → llaman a `/api/billing/subscribe` → redirigen a MP
- [ ] Mostrar estado real del plan (trial, activo, past_due, cancelado)
- [ ] Mostrar método de pago actual e info de suscripción
- [ ] Historial de pagos desde webhooks guardados

## Notas
- MercadoPago no opera con Stripe en AR — necesitarías LLC en USA para Stripe
- Rebill es la opción más barata para débito automático CBU (~1.5% + IVA)
- Mobbex es alternativa intermedia (~3% CBU)
- Los precios de los planes hay que ajustarlos al mercado cuando se lance
