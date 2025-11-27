import Link from 'next/link'

const DESIGNER_FEATURES = [
  {
    title: 'Upload once, sync everywhere',
    body: 'Batch ingest stills, loops and PSDs directly into EDGE with auto-tagging.',
  },
  {
    title: 'Sell premium drops',
    body: 'Attach smart links, pricing tiers and licensing rules in a single panel.',
  },
  {
    title: 'Live analytics',
    body: 'Track downloads, conversions and moodboard saves by city and channel.',
  },
]

export default function DesignerPersonaPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FB] px-4 pb-24 pt-32 text-slate-800">
      <div className="mx-auto max-w-5xl space-y-12">
        <section className="rounded-[32px] bg-white p-10 shadow-sm">
          <p className="text-xs uppercase tracking-normal text-slate-400">Designer</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-800">
            Monetize your Creativity.
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-500">
            Launch storefront-ready drops, bundle smart links and share ultra-polished
            previews for clients and collectors—no marketplace fees required.
          </p>
          <Link
            href="/upload"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
          >
            Start Uploading
          </Link>
        </section>

        <section className="grid gap-6 md:grid-cols-12">
          <div className="rounded-3xl bg-white p-8 shadow-sm md:col-span-7">
            <p className="text-xs uppercase tracking-normal text-slate-400">Workflow</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-800">
              A Bento grid for your entire drop lifecycle.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {DESIGNER_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-slate-600"
                >
                  <p className="text-lg font-semibold text-slate-800">{feature.title}</p>
                  <p className="mt-2 text-sm">{feature.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:col-span-5">
            <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-800 p-8 text-white shadow-xl">
              <p className="text-sm uppercase tracking-normal text-white/70">Pulse</p>
              <h3 className="mt-4 text-3xl font-semibold">$42,800</h3>
              <p className="text-sm text-white/80">Monthly asset revenue</p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Top Asset</span>
                  <span className="font-semibold">Neon Bloom Pack</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Conversion</span>
                  <span className="font-semibold text-emerald-300">+28%</span>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6">
              <p className="text-sm uppercase tracking-normal text-slate-400">
                Coming Soon
              </p>
              <p className="mt-3 text-2xl font-semibold text-slate-800">
                Private collector drops with timed access.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

