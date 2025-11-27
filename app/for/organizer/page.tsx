import Link from 'next/link'

const ORGANIZER_FEATURES = [
  {
    title: 'Smart Press Kits',
    detail: 'Auto-generate decks with approved copy, logos and download links.',
  },
  {
    title: 'Event Flyer Assets',
    detail: 'Spin up adaptive flyer stacks for every channel in seconds.',
  },
  {
    title: 'Talent Collaboration',
    detail: 'Share moodboards with DJs, PR teams and sponsors instantly.',
  },
]

export default function OrganizerPersonaPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FB] px-4 pb-24 pt-32 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-12">
        <section className="rounded-[32px] bg-white p-10 shadow-sm">
          <p className="text-xs uppercase tracking-normal text-slate-400">Organizer</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-800">
            Events look better on EDGE.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-500">
            Build consistent, on-brand visuals for every stop of your tour. EDGE keeps
            assets, credits and approvals in one calm workspace.
          </p>
          <Link
            href="/upload"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            Create Event Board
          </Link>
        </section>

        <section className="grid gap-6 md:grid-cols-12">
          <div className="rounded-3xl bg-white p-8 shadow-sm md:col-span-6">
            <p className="text-xs uppercase tracking-normal text-slate-400">
              Instant Kits
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-800">
              Drop a lineup, get every asset you need.
            </h2>
            <ul className="mt-6 space-y-4 text-slate-600">
              {ORGANIZER_FEATURES.map((feature) => (
                <li key={feature.title} className="rounded-2xl bg-slate-50/70 p-4">
                  <p className="text-lg font-semibold text-slate-800">{feature.title}</p>
                  <p className="text-sm">{feature.detail}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-slate-900/95 p-8 text-white shadow-xl md:col-span-6">
            <p className="text-xs uppercase tracking-normal text-white/60">
              Live Dashboard
            </p>
            <h3 className="mt-4 text-3xl font-semibold">Press Kit Status</h3>
            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span>New York Showcase</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">
                  Approved
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Lisbon Rooftop</span>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-amber-200">
                  Feedback
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Paris Fashion Link-up</span>
                <span className="rounded-full bg-slate-100/20 px-3 py-1 text-white/80">
                  Drafting
                </span>
              </div>
            </div>
            <div className="mt-10 rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-white/70">Edge Sync</p>
              <p className="text-2xl font-semibold text-white">All agencies updated 12m ago</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

