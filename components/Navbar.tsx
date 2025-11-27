'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogIn, Sparkles, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/utils/cn'
import AuthModal from './AuthModal'

const personaRouteMap: Record<string, string> = {
  designer: '/dashboard/designer',
  organizer: '/dashboard/organizer',
  club: '/dashboard/club',
}

const getDashboardHref = (persona?: string | null) =>
  persona ? personaRouteMap[persona] ?? '/dashboard' : '/dashboard'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [persona, setPersona] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (currentUser) {
        setUser(currentUser)
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url, persona')
          .eq('id', currentUser.id)
          .single()

        setAvatarUrl(profile?.avatar_url ?? null)
        setPersona(profile?.persona ?? null)
      } else {
        setUser(null)
        setAvatarUrl(null)
        setPersona(null)
      }
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const marketplaceClick = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    router.push('/dashboard/organizer/marketplace')
  }

  const dashboardClick = () => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    router.push(getDashboardHref(persona))
  }

  // Hide navbar on dashboard routes (but show on /dashboard itself for persona selection)
  if (pathname?.startsWith('/dashboard') && pathname !== '/dashboard') {
    return null
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
        <nav className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-6 rounded-full bg-white/95 px-6 py-3 shadow-lg shadow-slate-900/5 ring-1 ring-white/60 backdrop-blur">
          <div className="flex flex-1 items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md"
            >
              EDGE
              <span className="text-xs font-normal text-slate-300">OS</span>
            </Link>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Link
                href="/"
                className={cn(
                  'rounded-full px-4 py-2 transition hover:text-slate-900',
                  pathname === '/' && 'bg-slate-100 text-slate-900'
                )}
              >
                Startseite
              </Link>

              <button
                onClick={marketplaceClick}
                className={cn(
                  'rounded-full px-4 py-2 transition hover:text-slate-900',
                  pathname?.includes('/dashboard/organizer/marketplace') &&
                    'bg-slate-100 text-slate-900'
                )}
              >
                Marktplatz
              </button>

              <button
                onClick={dashboardClick}
                className={cn(
                  'rounded-full px-4 py-2 transition hover:text-slate-900',
                  pathname?.startsWith('/dashboard') && 'bg-slate-100 text-slate-900'
                )}
              >
                Dashboard
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={marketplaceClick}
              className="hidden items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:inline-flex"
            >
              <Sparkles size={14} />
              Markt
            </button>

            {user ? (
              <button
                onClick={dashboardClick}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
                aria-label="Dashboard öffnen"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <User size={16} />
                )}
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800"
              >
                <LogIn size={16} />
                Anmelden
              </button>
            )}
          </div>
        </nav>
      </div>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  )
}

