'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight, Disc, PenSquare, Sparkles } from 'lucide-react'
import { Database } from '@/types/database'
import AssetCard from '@/components/AssetCard'
import IntroOverlay from '@/components/IntroOverlay'
import PersonaModal from '@/components/PersonaModal'
import AuthModal from '@/components/AuthModal'

type Asset = Database['public']['Tables']['assets']['Row']

interface HomeExperienceProps {
  assets: Asset[]
}

const personaOptions = [
  {
    id: 'designer',
    title: 'Für Designer',
    subtitle: 'Monetisiere deine Kunst.',
    description: 'Veröffentliche hochwertige Visuals, verkaufe Loops, Brand Kits & Residencies.',
    href: '/for/designer',
    icon: PenSquare,
  },
  {
    id: 'organizer',
    title: 'Für Veranstalter',
    subtitle: 'Erstelle unvergessliche Events.',
    description: 'Buche Elite-Studios, verwalte Medienbibliotheken und starte Kampagnen.',
    href: '/for/organizer',
    icon: Sparkles,
  },
  {
    id: 'club',
    title: 'Für Clubs',
    subtitle: 'Verwalte deine Residency.',
    description: 'Synchronisiere Aftermovies, steuere LED-Cues, briefe Designer in einem OS.',
    href: '/for/club',
    icon: Disc,
  },
] as const

const mockTrendingAssets: Asset[] = [
  {
    id: 'mock-trending-1',
    title: 'Neon Mirage',
    file_url:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image/jpeg',
    width: 1200,
    height: 1500,
    uploader_id: 'mock',
    created_at: new Date().toISOString(),
    location_name: 'Berlin · Hyperion Dome',
    location_logo_url:
      'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=200&q=80',
    dj_name: 'Lia Kobalt',
    smart_links: null,
    hex_color: '#0f172a',
  },
  {
    id: 'mock-trending-2',
    title: 'Iridescent Bloom',
    file_url:
      'https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image/jpeg',
    width: 1200,
    height: 1500,
    uploader_id: 'mock',
    created_at: new Date().toISOString(),
    location_name: 'Lisbon · Aurora Theatre',
    location_logo_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    dj_name: 'Helena V',
    smart_links: null,
    hex_color: '#f97316',
  },
  {
    id: 'mock-trending-3',
    title: 'Afterglow Circuit',
    file_url:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image/jpeg',
    width: 1200,
    height: 1500,
    uploader_id: 'mock',
    created_at: new Date().toISOString(),
    location_name: 'Paris · Vanta Club',
    location_logo_url:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=200&q=80',
    dj_name: 'Nova Fey',
    smart_links: null,
    hex_color: '#4c1d95',
  },
  {
    id: 'mock-trending-4',
    title: 'Chromatic Tide',
    file_url:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    thumbnail_url:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    file_type: 'image/jpeg',
    width: 1200,
    height: 1500,
    uploader_id: 'mock',
    created_at: new Date().toISOString(),
    location_name: 'Amsterdam · Lumen Hall',
    location_logo_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    dj_name: 'Pulse Twins',
    smart_links: null,
    hex_color: '#2563eb',
  },
]

export default function HomeExperience({ assets }: HomeExperienceProps) {
  const searchParams = useSearchParams()
  const [introComplete, setIntroComplete] = useState(false)
  const [showPersonaModal, setShowPersonaModal] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    if (!introComplete) return
    if (typeof window === 'undefined') return

    const urlTrigger = searchParams?.get('showPersonaModal') === 'true'
    if (urlTrigger) {
      setShowPersonaModal(true)
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    const savedPersona = localStorage.getItem('edgePersona')
    setShowPersonaModal(!savedPersona)
  }, [introComplete, searchParams])

  const trendingAssets = useMemo(() => {
    if (assets.length === 0) return mockTrendingAssets
    return assets.slice(0, 6)
  }, [assets])

  return (
    <>
      <IntroOverlay onComplete={() => setIntroComplete(true)} />
      <PersonaModal open={showPersonaModal} onClose={() => setShowPersonaModal(false)} />
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <main className="relative min-h-screen bg-[#F8F9FB] px-4 pb-32 pt-32 text-slate-900">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white via-white/70 to-transparent" />
        <div className="mx-auto max-w-6xl space-y-16">
          <section className="relative overflow-hidden rounded-[32px] bg-white px-8 py-12 shadow-sm ring-1 ring-white/70 md:px-12">
            <div className="absolute -left-12 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-slate-900 via-slate-700/70 to-transparent opacity-10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-300/30 via-transparent to-transparent blur-3xl" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="space-y-6 lg:flex-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  EDGE · Creative Command
                </p>
                <div className="space-y-4">
                  <h1 className="text-4xl font-semibold leading-tight text-slate-900 md:text-5xl">
                    Das Visual OS für Nightlife & Events.
                  </h1>
                  <p className="text-lg text-slate-500 md:text-xl">
                    Verbinde Creator, Veranstalter und Clubs in einem kuratierten Ökosystem. Automatisiere
                    Medien-Workflows, shoppe Talent und starte immersive Shows—Airbnb-Level UX,
                    Nightlife-DNA.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
                  >
                    Loslegen
                  </button>
                  <a
                    href="#showcase"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
                  >
                    Demo ansehen
                  </a>
                </div>
                <div className="grid gap-4 text-sm text-slate-500 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-normal text-slate-400">
                      Assets
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">12k+</p>
                    <span className="text-emerald-500">Ultra-kuratierte Drops</span>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-normal text-slate-400">
                      Designer
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">500+</p>
                    <span className="text-amber-500">Motion, 3D & Branding</span>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-normal text-slate-400">
                      Live Drops
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {Math.max(assets.length, 48)}
                    </p>
                    <span className="text-slate-500">In 42 Städten</span>
                  </div>
                </div>
              </div>
              <div className="hidden h-full w-px self-stretch bg-gradient-to-b from-transparent via-slate-200 to-transparent lg:block" />
              <div className="space-y-6 rounded-[28px] border border-slate-100 bg-slate-50/80 p-6 backdrop-blur lg:w-72">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-normal text-slate-400">
                    Marktplatz-Puls
                  </p>
                  <h3 className="text-2xl font-semibold text-slate-900">Live Brief Queue</h3>
                </div>
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <span>Veranstalter bereit</span>
                    <strong className="text-slate-900">19</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <span>Clubs kuratieren</span>
                    <strong className="text-slate-900">11</strong>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <span>Designer online</span>
                    <strong className="text-slate-900">86</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-normal text-slate-400">
                  Abschnitt 02
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                  Wähle deinen Weg.
                </h2>
                <p className="text-sm text-slate-500">
                  Maßgeschneiderte Flows für jede Persona. Ein Konto. Unendliche Zusammenarbeit.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Dashboards erkunden
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {personaOptions.map((persona) => {
                const Icon = persona.icon
                return (
                  <Link
                    key={persona.id}
                    href={persona.href}
                    className="group relative flex h-full flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-transparent transition hover:-translate-y-1 hover:ring-slate-200"
                  >
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        <Icon size={16} />
                        {persona.title}
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {persona.subtitle}
                      </h3>
                      <p className="text-sm text-slate-500">{persona.description}</p>
                    </div>
                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-normal text-slate-400">
                        Workspace betreten
                      </span>
                      <ArrowUpRight className="text-slate-400 transition group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-slate-900" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-2 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-normal text-slate-400">
                Vertrauen & Statistiken
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                12k+ Assets verfügbar
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Motion Packs, Stage Renders, Club Drops und Branding-Systeme wöchentlich kuratiert.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                <Sparkles size={14} />
                Kuratiert
              </div>
            </div>
            <div className="md:col-span-2 rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-normal text-slate-400">
                Roster
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">
                500+ Verifizierte Designer
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Motion, 3D, Static & Branding Studios mit bewerteter Liefergeschwindigkeit und Qualität.
              </p>
              <div className="mt-6 flex items-center gap-3 text-xs text-slate-500">
                <div className="rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700">
                  4.9★ Ø Bewertung
                </div>
                <div className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                  72h Median ETA
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between rounded-[28px] border border-slate-100 bg-slate-900 p-6 text-white shadow-sm md:col-span-1">
              <div>
                <p className="text-xs uppercase tracking-normal text-white/60">
                  Vertraut von
                </p>
                <h3 className="mt-4 text-2xl font-semibold">Flagship Clubs</h3>
              </div>
              <div className="mt-6 space-y-3 text-sm text-white/80">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  NOVA / BCN
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  HALO / BER
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  ORBIT / AMS
                </div>
              </div>
            </div>
          </section>

          <section id="showcase" className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-normal text-slate-400">
                  Abschnitt 04
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-900">
                  Trending Assets.
                </h2>
                <p className="text-sm text-slate-500">
                  Scrolle durch Live-Drops vom Designer-Marktplatz.
                </p>
              </div>
              <Link
                href="/dashboard/organizer/marketplace"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-300"
              >
                Marktplatz ansehen
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4">
              {trendingAssets.map((asset) => (
                <div key={asset.id} className="min-w-[280px] max-w-[320px] flex-1 sm:min-w-[320px]">
                  <AssetCard asset={asset} className="h-full" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

