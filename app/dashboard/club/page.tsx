'use client'

import { useState, useEffect, useMemo } from 'react'
import { Music, User, Package, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface WeekEvent {
  day: string
  date: number
  event?: {
    title: string
    time: string
    dj: string
  } | null
}

interface Booking {
  id: string
  status: string
  due_date: string | null
  created_at: string
  package: {
    title: string
    price_eur: number
    delivery_days: number
  } | null
  assigned_designer: {
    name: string
    avatar_url: string
  } | null
}

export default function ClubDashboard() {
  const supabase = useMemo(() => createClient(), [])
  const [userId, setUserId] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [currentWeek] = useState<WeekEvent[]>([
    { day: 'Mon', date: 11, event: null },
    { day: 'Tue', date: 12, event: null },
    { day: 'Wed', date: 13, event: { title: 'Midweek Vibes', time: '22:00', dj: 'DJ Nova' } },
    { day: 'Thu', date: 14, event: null },
    { day: 'Fri', date: 15, event: { title: 'Friday Night', time: '23:00', dj: 'Sarah Mitchell' } },
    { day: 'Sat', date: 16, event: { title: 'Weekend Session', time: '22:30', dj: 'Alex Chen' } },
    { day: 'Sun', date: 17, event: null },
  ])

  const [residentDJs] = useState([
    { id: '1', name: 'Sarah Mitchell', genre: 'Techno', events: 12 },
    { id: '2', name: 'DJ Nova', genre: 'House', events: 8 },
    { id: '3', name: 'Alex Chen', genre: 'Deep House', events: 15 },
  ])

  const today = new Date().getDate()

  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        // Load bookings for this club/user
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(
            `
            id,
            status,
            due_date,
            created_at,
            package:packages(title, price_eur, delivery_days),
            assigned_designer:designers(name, avatar_url)
          `
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)

        if (bookingsData) {
          setBookings(bookingsData as any)
        }
      }
      setLoading(false)
    }

    loadData()
  }, [supabase])

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      case 'review':
        return 'bg-amber-100 text-amber-700'
      case 'assigned':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen'
      case 'in_progress':
        return 'In Arbeit'
      case 'review':
        return 'Überprüfung'
      case 'assigned':
        return 'Zugewiesen'
      case 'pending':
        return 'Ausstehend'
      default:
        return status
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-normal text-slate-400">
          Club Dashboard
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-800">
          Venue OS
        </h1>
        <p className="text-lg text-slate-500">
          Verwalte deinen Veranstaltungsplan und deine Resident DJs.
        </p>
      </header>

      {/* Purchased Packages / Orders Section */}
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Gekaufte Pakete</h2>
            <p className="mt-2 text-sm text-slate-500">
              Übersicht deiner gebuchten Designer-Services und deren Status.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                    <Package className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {booking.package?.title || 'Unbekanntes Paket'}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      {booking.assigned_designer && (
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {booking.assigned_designer.name || 'Designer'}
                        </span>
                      )}
                      {booking.due_date && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(booking.due_date).toLocaleDateString('de-DE')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      €{booking.package?.price_eur || '—'}
                    </div>
                    <div className="text-xs text-slate-500">
                      {booking.package?.delivery_days || '—'} Tage
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusBadgeColor(
                      booking.status
                    )}`}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Package size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800">
              Noch keine gekauften Pakete
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Besuche den Marktplatz, um Designer-Services zu buchen.
            </p>
          </div>
        )}
      </section>

      {/* Visual Schedule */}
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Visueller Zeitplan</h2>
          <p className="mt-2 text-sm text-slate-500">
            Wöchentliche Übersicht der Events deines Veranstaltungsortes.
          </p>
        </div>
        <div className="grid grid-cols-7 gap-3">
          {currentWeek.map((day) => (
            <div
              key={day.day}
              className={`rounded-2xl border p-4 transition ${
                day.date === today
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : day.event
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div className="mb-2 text-center text-xs font-medium opacity-70">
                {day.day}
              </div>
              <div
                className={`mb-3 text-center text-2xl font-semibold ${
                  day.date === today ? 'text-white' : 'text-slate-900'
                }`}
              >
                {day.date}
              </div>
              {day.event && (
                <div className="space-y-1 text-center">
                  <p
                    className={`text-xs font-semibold ${
                      day.date === today ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {day.event.title}
                  </p>
                  <p
                    className={`text-[10px] ${
                      day.date === today ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {day.event.time}
                  </p>
                  <p
                    className={`text-[10px] ${
                      day.date === today ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {day.event.dj}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Resident DJs */}
      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Resident DJs</h2>
          <p className="mt-2 text-sm text-slate-500">
            Dein Kernteam von Resident-Künstlern.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {residentDJs.map((dj) => (
            <div
              key={dj.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
                <Music size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{dj.name}</h3>
                <p className="text-xs text-slate-500">{dj.genre}</p>
                <span className="text-xs font-medium text-slate-600">
                  {dj.events} Events
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
