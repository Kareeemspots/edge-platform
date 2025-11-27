'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Apple, Chrome } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AuthModalProps {
  open: boolean
  onClose: () => void
}

type AuthMode = 'signin' | 'signup'

const personaRouteMap: Record<string, string> = {
  designer: '/dashboard/designer',
  organizer: '/dashboard/organizer',
  club: '/dashboard/club',
}

const OAUTH_REDIRECT_KEY = 'edgePendingOAuthRedirect'

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const oauthListenerAttached = useRef(false)

  const redirectToPersona = useCallback(
    async (userId: string) => {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('persona')
        .eq('id', userId)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error(profileError)
      }

      const persona = profile?.persona ?? null
      onClose()

      if (persona && personaRouteMap[persona]) {
        router.push(personaRouteMap[persona])
      } else {
        // Redirect to dashboard page which will show persona selection
        router.push('/dashboard')
      }

      router.refresh()
    },
    [onClose, router, supabase]
  )

  useEffect(() => {
    if (oauthListenerAttached.current) return
    oauthListenerAttached.current = true

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const shouldHandleOAuth =
          typeof window !== 'undefined' &&
          window.localStorage.getItem(OAUTH_REDIRECT_KEY) === 'true'

        if (shouldHandleOAuth) {
          window.localStorage.removeItem(OAUTH_REDIRECT_KEY)
          await redirectToPersona(session.user.id)
        }
      }
    })

    return () => {
      subscription.unsubscribe()
      oauthListenerAttached.current = false
    }
  }, [redirectToPersona, supabase])

  useEffect(() => {
    if (!open) {
      setEmail('')
      setPassword('')
      setError(null)
      setMode('signin')
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let user: any = null

      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        user = data.user

        // Create profile after signup (or upsert if exists)
        if (user) {
          await supabase
            .from('profiles')
            .upsert(
              {
                id: user.id,
                username: email.split('@')[0],
              },
              { onConflict: 'id' }
            )
        }
      } else {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          })

        if (signInError) throw signInError
        user = signInData.user
      }

      if (user) {
        toast.success(
          mode === 'signin' ? 'Erfolgreich angemeldet!' : 'Konto erfolgreich erstellt!'
        )
        await redirectToPersona(user.id)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentifizierung fehlgeschlagen'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: 'apple' | 'google') => {
    setError(null)
    setLoading(true)

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(OAUTH_REDIRECT_KEY, 'true')
      }

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/`
              : undefined,
        },
      })

      if (oauthError) throw oauthError
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(OAUTH_REDIRECT_KEY)
      }
      setError(err instanceof Error ? err.message : 'Authentifizierung fehlgeschlagen')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl ring-1 ring-white/60"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Schließen"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-slate-900">
                  {mode === 'signin' ? 'Willkommen zurück' : 'EDGE beitreten'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {mode === 'signin'
                    ? 'Melde dich an, um auf dein Dashboard zuzugreifen'
                    : 'Erstelle dein Konto, um loszulegen'}
                </p>
              </div>

              <div className="mb-6 space-y-3">
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('apple')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Apple size={18} />
                  Mit Apple fortfahren
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialSignIn('google')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Chrome size={18} />
                  Mit Google fortfahren
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400">
                    Oder mit E-Mail fortfahren
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-slate-700"
                  >
                    E-Mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="du@beispiel.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Passwort
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Lädt...'
                    : mode === 'signin'
                      ? 'Anmelden'
                      : 'Registrieren'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin')
                    setError(null)
                  }}
                  className="text-sm text-slate-600 transition hover:text-slate-900"
                >
                  {mode === 'signin' ? (
                    <>
                      Noch kein Konto?{' '}
                      <span className="font-semibold">Registrieren</span>
                    </>
                  ) : (
                    <>
                      Bereits ein Konto?{' '}
                      <span className="font-semibold">Anmelden</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

