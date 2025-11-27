'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'

import { cn } from '@/utils/cn'
import { BookingModal } from '@/components/BookingModal'
import DesignerCard from '@/components/DesignerCard'
import { createClient } from '@/utils/supabase/client'
import {
  DesignerDiscipline,
  DesignerPackage,
  DesignerProfile,
  generateMockDesigners,
} from '@/utils/mockData'

type MarketplaceDesigner = DesignerProfile & {
  color?: string | null
}

const filters: DesignerDiscipline[] = ['Motion', '3D', 'Static', 'Branding']

export default function OrganizerMarketplacePage() {
  const supabase = useMemo(() => createClient(), [])

  const [designers, setDesigners] = useState<MarketplaceDesigner[]>([])
  const [activeFilter, setActiveFilter] = useState<DesignerDiscipline | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingMockData, setUsingMockData] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [bookingDesigner, setBookingDesigner] = useState<MarketplaceDesigner | null>(null)
  const [bookingPackage, setBookingPackage] = useState<DesignerPackage | null>(null)

  const loadDesigners = useCallback(async () => {
    setLoading(true)
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, persona')
        .limit(12)

      if (error) throw error

      if (!profiles?.length) {
        setDesigners(generateMockDesigners(12))
        setUsingMockData(true)
        return
      }

      const enriched = await Promise.all(
        profiles.map(async (profile) => {
          const { data: assets, error: assetsError } = await supabase
            .from('assets')
            .select('id, thumbnail_url, file_url, hex_color')
            .eq('uploader_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(3)

          if (assetsError) throw assetsError

          const mockFallback = generateMockDesigners(1)[0]

          const portfolio =
            assets?.map((asset) => asset.thumbnail_url || asset.file_url) ??
            mockFallback.portfolio

          return {
            id: profile.id,
            name: profile.username || mockFallback.name,
            studio: profile.username || mockFallback.studio,
            avatar: profile.avatar_url || mockFallback.avatar,
            rating: Number((Math.random() * 0.6 + 4.3).toFixed(1)),
            discipline:
              (profile.persona as DesignerDiscipline) ??
              filters[Math.floor(Math.random() * filters.length)],
            location: 'Remote · EU',
            packages: mockFallback.packages,
            portfolio: ensurePortfolio(portfolio),
            color: assets?.[0]?.hex_color ?? '#0f172a',
          } satisfies MarketplaceDesigner
        })
      )

      if (!enriched.length) {
        setDesigners(generateMockDesigners(8))
        setUsingMockData(true)
        return
      }

      setDesigners(enriched)
      setUsingMockData(false)
    } catch (err) {
      console.error(err)
      setDesigners(generateMockDesigners(12))
      setUsingMockData(true)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadDesigners()
  }, [loadDesigners])

  const filteredDesigners = activeFilter
    ? designers.filter((designer) => designer.discipline === activeFilter)
    : designers

  const handleOpenBooking = (designer: MarketplaceDesigner, pkg: DesignerPackage) => {
    setBookingDesigner(designer)
    setBookingPackage(pkg)
    setIsBookingModalOpen(true)
  }

  const handleCloseBooking = () => {
    setIsBookingModalOpen(false)
    setBookingDesigner(null)
    setBookingPackage(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-500">
          <Sparkles size={14} />
          Designer Marktplatz
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            High-End Visual Design buchen
          </h1>
          <p className="text-lg text-slate-500">
            Kuratierte Studios für Motion, 3D & Branding – wie ein privater Airbnb für Visual
            Identity.
          </p>
        </div>
      </header>

      <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex flex-nowrap items-center gap-3 sm:flex-wrap sm:whitespace-normal">
            {filters.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setActiveFilter((current) => (current === filter ? null : filter))
                }
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-semibold transition',
                  activeFilter === filter
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {usingMockData && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Keine Designer in der Datenbank gefunden – wir zeigen kuratiertes Mock-Material, damit
          das Layout wirkt.
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          <Sparkles className="h-4 w-4 animate-spin" />
          Marktplatz lädt Designer-Vorschauen…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredDesigners.map((designer) => (
            <DesignerCard
              key={designer.id}
              designer={designer}
              onBook={(d, pkg) => handleOpenBooking(d, pkg)}
            />
          ))}
        </div>
      )}

      <BookingModal
        open={isBookingModalOpen}
        designer={bookingDesigner}
        selectedPackage={bookingPackage}
        onClose={handleCloseBooking}
      />
    </div>
  )
}

const ensurePortfolio = (portfolio: string[]): string[] => {
  const withFallback = [...portfolio]
  while (withFallback.length < 3) {
    const fallback = generateMockDesigners(1)[0].portfolio[0]
    withFallback.push(fallback)
  }
  return withFallback.slice(0, 3)
}
