'use client'

import { useEffect, useMemo, useState } from 'react'
import { Upload, Calendar, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

import { createClient } from '@/utils/supabase/client'

type ActiveOrder = {
  id: string
  designer_name: string | null
  status: string | null
  package_tier: string | null
  price_display: string | null
}

export default function OrganizerDashboard() {
  const supabase = useMemo(() => createClient(), [])

  const [brandKitLogo, setBrandKitLogo] = useState<string | null>(null)
  const [upcomingEvents] = useState([
    {
      id: '1',
      title: 'EDGE x Hyperion Showcase',
      date: '2024-03-15',
      venue: 'Horizon Sky Towers',
      status: 'upcoming',
    },
    {
      id: '2',
      title: 'Neon Nights Festival',
      date: '2024-03-22',
      venue: 'Metro Arena',
      status: 'upcoming',
    },
  ])

  const [orders, setOrders] = useState<ActiveOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setBrandKitLogo(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    let active = true

    const fetchOrders = async () => {
      setOrdersLoading(true)
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setOrders([])
          return
        }

        const { data, error } = await supabase
          .from('orders')
          .select('id, status, designer_name, package_tier, price_display')
          .eq('organizer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (error) throw error
        if (active) {
          setOrders(data ?? [])
        }
      } catch (error) {
        console.error('Failed to load orders', error)
        if (active) {
          setOrders([])
        }
      } finally {
        if (active) {
          setOrdersLoading(false)
        }
      }
    }

    fetchOrders()

    return () => {
      active = false
    }
  }, [supabase])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-normal text-slate-400">
          Veranstalter Dashboard
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-800">
          Event Command Center
        </h1>
        <p className="text-lg text-slate-500">
          Verwalte deine Events, Brand Assets und visuellen Inhalte.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Brand Kit Section */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Brand Kit</h2>
            <p className="mt-2 text-sm text-slate-500">
              Lade dein Logo und Brand Assets für konsistente Event-Visuals hoch.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              {brandKitLogo ? (
                <div className="space-y-4">
                  <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-2xl border border-slate-200">
                    <Image
                      src={brandKitLogo}
                      alt="Brand Logo"
                      width={128}
                      height={128}
                      className="h-full w-full object-contain"
                      unoptimized
                    />
                  </div>
                  <button
                    onClick={() => setBrandKitLogo(null)}
                    className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    Entfernen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <ImageIcon className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Logo hochladen
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      PNG, SVG oder JPG (max. 5MB)
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300">
                    <Upload size={14} />
                    Datei wählen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Anstehende Events
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Verfolge deine geplanten Events und ihren Status.
            </p>
          </div>

          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{event.title}</h3>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(event.date).toLocaleDateString('de-DE', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <span>{event.venue}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {event.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-4 text-sm font-medium text-slate-600">
                  Keine anstehenden Events
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Erstelle dein erstes Event, um loszulegen.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-normal text-slate-400">
              Aktive Bestellungen
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Deine aktuellen Designer-Buchungen
            </h2>
          </div>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Bestellungen werden geladen…
          </div>
        ) : orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Bestellung #{order.id.slice(0, 6).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500">
                    {order.designer_name ?? 'Designer'}
                    {order.package_tier ? ` • ${order.package_tier}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {order.price_display && (
                    <span className="text-sm font-semibold text-slate-900">
                      {order.price_display}
                    </span>
                  )}
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    {order.status ?? 'pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm font-semibold text-slate-800">
              Noch keine aktiven Bestellungen
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Gehe zum Marktplatz und buche deinen ersten Designer.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

