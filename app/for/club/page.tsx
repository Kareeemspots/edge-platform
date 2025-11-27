import Link from 'next/link'

const VENUE_FEATURES = [
  {
    label: 'Resident DJ management',
    detail: 'Share weekly content packs, stems and smart contracts in one view.',
  },
  {
    label: 'Screen playlists',
    detail: 'Schedule visuals per room and sync brightness to the booth clock.',
  },
  {
    label: 'AI Concierge',
    detail: 'Automate recap reels and sponsor recaps before sunrise.',
  },
]

export default function ClubPersonaPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FB] px-4 pb-24 pt-32 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-12">
        <section className="rounded-[32px] bg-white p-10 shadow-sm">
          <p className="text-xs uppercase tracking-normal text-slate-400">Club / Venue</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-800">
            The Visual OS for Nightlife.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-500">
            EDGE syncs your residents, screens and sponsorship visuals—so every weekend
            feels curated and cohesive.
          </p>
          <Link
            href="/upload"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            Manage Venue
          </Link>
        </section>

        <section className="grid gap-6 md:grid-cols-12">
          <div className="rounded-3xl bg-slate-900/95 p-8 text-white shadow-xl md:col-span-5">
            <p className="text-xs uppercase tracking-normal text-white/60">Tonight</p>
            <h2 className="mt-3 text-3xl font-semibold">Horizon Room</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Screen 01</span>
                <span className="text-emerald-300">VJ Loop · 120 fps</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Screen 02</span>
                <span className="text-amber-200">Sponsor Slate 00:45</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Booth Sync</span>
                <span className="text-white/80">DJ Sora · +3dB safe</span>
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-white/10 p-4 text-sm">
              <p className="text-white/70">Next automation</p>
              <p className="text-2xl font-semibold text-white">Sunrise recap @ 05:20</p>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm md:col-span-7">
            <p className="text-xs uppercase tracking-normal text-slate-400">Control</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-800">
              Keep every resident and screen on vibe.
            </h2>
            <div className="mt-6 space-y-4 text-slate-600">
              {VENUE_FEATURES.map((feature) => (
                <div
                  key={feature.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5"
                >
                  <p className="text-lg font-semibold text-slate-800">{feature.label}</p>
                  <p className="text-sm">{feature.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

