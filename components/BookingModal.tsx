'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2, Calendar, X } from 'lucide-react'

import { toast } from 'sonner'

import { createClient } from '@/utils/supabase/client'
import type { DesignerPackage } from '@/utils/mockData'

type BookingDesigner = {
  id: string
  name: string
  studio?: string | null
  discipline?: string | null
}

type OrganizerEvent = {
  id: string
  title: string
  date?: string | null
  venue?: string | null
}

type BookingModalProps = {
  open: boolean
  designer: BookingDesigner | null
  selectedPackage: DesignerPackage | null
  onClose: () => void
}

export function BookingModal({
  open,
  designer,
  selectedPackage,
  onClose,
}: BookingModalProps) {
  const supabase = useMemo(() => createClient(), [])

  const [events, setEvents] = useState<OrganizerEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [organizerId, setOrganizerId] = useState<string | null>(null)
  const [quickCreateName, setQuickCreateName] = useState('')

  const shouldRender = open && designer && selectedPackage
  const isQuickCreate = !loadingEvents && events.length === 0

  useEffect(() => {
    if (!open) {
      setSelectedEventId(null)
      setQuickCreateName('')
      return
    }

    let active = true
    const loadEvents = async () => {
      setLoadingEvents(true)
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError
        if (!user) {
          toast.error('Please sign in to create bookings.')
          return
        }

        setOrganizerId(user.id)

        const { data, error } = await supabase
          .from('events')
          .select('id, title, date, venue')
          .eq('organizer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (active) {
          setEvents(data ?? [])
          setSelectedEventId(data?.[0]?.id ?? null)
        }
      } catch (error) {
        console.error(error)
        toast.error('Unable to load your events.')
        if (active) {
          setEvents([])
          setSelectedEventId(null)
        }
      } finally {
        if (active) {
          setLoadingEvents(false)
        }
      }
    }

    loadEvents()

    return () => {
      active = false
    }
  }, [open, supabase])

  const handleBooking = async () => {
    if (!organizerId || !designer || !selectedPackage) {
      toast.error('Missing booking details.')
      return
    }

    if (!isQuickCreate && !selectedEventId) {
      toast.error('Select an event before confirming.')
      return
    }

    const trimmedQuickCreate = quickCreateName.trim()
    if (isQuickCreate && !trimmedQuickCreate) {
      toast.error('Enter a name for your event.')
      return
    }

    try {
      setSubmitting(true)
      let eventIdToUse = selectedEventId

      if (isQuickCreate) {
        const { data: newlyCreatedEvent, error: eventError } = await supabase
          .from('events')
          .insert({
            organizer_id: organizerId,
            title: trimmedQuickCreate,
          })
          .select('id')
          .single()

        if (eventError) throw eventError
        eventIdToUse = newlyCreatedEvent?.id ?? null
      }

      if (!eventIdToUse) {
        toast.error('Could not determine event.')
        return
      }

      const payload = {
        organizer_id: organizerId,
        event_id: eventIdToUse,
        designer_id: designer.id,
        designer_name: designer.name,
        package_tier: selectedPackage.tier,
        package_description: selectedPackage.description,
        price_display: selectedPackage.price,
        status: 'pending',
      }

      const { error } = await supabase.from('orders').insert(payload)

      if (error) throw error

      toast.success('Booking sent!')
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Could not create the booking.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-[32px] border border-white/20 bg-white/80 p-8 text-slate-900 shadow-2xl backdrop-blur-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-white/60 text-slate-500 transition hover:text-slate-900"
          aria-label="Close booking modal"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="text-xs uppercase tracking-normal text-slate-500">Paket buchen</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">
          {selectedPackage.tier} von {designer.name} buchen
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {designer.studio ?? 'Independent'} · {designer.discipline ?? 'Design'}
        </p>

        <div className="mt-6 rounded-3xl border border-white/40 bg-white/60 p-6 shadow-inner">
          <p className="text-sm font-medium text-slate-500">Paket-Gesamtpreis</p>
          <p className="mt-2 text-4xl font-semibold text-slate-900">
            {selectedPackage.price}
          </p>
          <p className="mt-2 text-sm text-slate-500">{selectedPackage.description}</p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Calendar className="h-4 w-4 text-slate-500" />
            Event auswählen
          </div>

          {loadingEvents ? (
            <div className="flex items-center justify-center rounded-2xl border border-white/40 bg-white/60 p-6 text-sm text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Lade deine Events…
            </div>
          ) : events.length ? (
            <select
              value={selectedEventId ?? ''}
              onChange={(event) => setSelectedEventId(event.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/70 p-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
            >
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}{' '}
                  {event.date
                    ? `• ${new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}`
                    : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-4 rounded-2xl border border-dashed border-white/40 bg-white/50 p-6">
              <p className="text-sm font-medium text-slate-600">
                Noch keine Events. Erstelle schnell eins unten, um fortzufahren.
              </p>
              <input
                type="text"
                value={quickCreateName}
                onChange={(event) => setQuickCreateName(event.target.value)}
                placeholder="Neuen Event-Namen erstellen"
                className="w-full rounded-2xl border border-white/40 bg-white/70 p-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-900 focus:bg-white"
              />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleBooking}
            disabled={
              submitting ||
              loadingEvents ||
              (!isQuickCreate && !selectedEventId) ||
              (isQuickCreate && !quickCreateName.trim())
            }
            className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-white transition enabled:hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bestätige…
              </>
            ) : (
              'Buchung bestätigen'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-4 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}


