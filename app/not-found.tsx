'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FB] px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-6xl font-semibold text-slate-900">404</h1>
        <h2 className="mb-2 text-2xl font-semibold text-slate-800">
          Seite nicht gefunden
        </h2>
        <p className="mb-8 text-slate-500">
          Die Seite, die du suchst, existiert nicht oder wurde verschoben.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Home size={16} />
            Zur Startseite
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
          >
            <ArrowLeft size={16} />
            Zurück
          </button>
        </div>
      </div>
    </div>
  )
}

