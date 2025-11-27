'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PenSquare, CalendarDays, Building2, Waves } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

type PersonaId = 'designer' | 'organizer' | 'club'

interface PersonaModalProps {
  open: boolean
  onClose?: () => void
}

const PERSONAS: Array<{
  id: PersonaId
  title: string
  description: string
  href: string
  icon: React.ElementType
}> = [
  {
    id: 'designer',
    title: 'Designer',
    description: 'Ich möchte Assets verkaufen & mein Portfolio aufbauen.',
    href: '/for/designer',
    icon: PenSquare,
  },
  {
    id: 'organizer',
    title: 'Veranstalter',
    description: 'Ich brauche Visuals & Press Kits für Events.',
    href: '/for/organizer',
    icon: CalendarDays,
  },
  {
    id: 'club',
    title: 'Club / Venue',
    description: 'Ich verwalte Resident DJs & Screens.',
    href: '/for/club',
    icon: Building2,
  },
]

export default function PersonaModal({ open, onClose }: PersonaModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  const handlePersonaSelect = async (persona: PersonaId, href: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('edgePersona', persona)
    }

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, persona }, { onConflict: 'id' })
        
        // Redirect to appropriate dashboard based on persona
        onClose?.()
        if (persona === 'designer') {
          router.push('/dashboard/designer')
        } else if (persona === 'organizer') {
          router.push('/dashboard/organizer')
        } else if (persona === 'club') {
          router.push('/dashboard/club')
        } else {
          router.push(href)
        }
        router.refresh()
        return
      }
    } catch (error) {
      console.error('Failed to persist persona preference', error)
    }

    onClose?.()
    router.push(href)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mx-4 max-w-3xl rounded-3xl bg-white p-8 shadow-2xl"
          >
            <p className="text-xs uppercase tracking-normal text-slate-400">
              Willkommen
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900">
              Wie wirst du EDGE nutzen?
            </h2>
            <p className="mt-2 text-slate-500">
              Wähle eine Persona, um Workflows, Dashboards und Empfehlungen anzupassen.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {PERSONAS.map((persona) => {
                const Icon = persona.icon
                return (
                  <motion.button
                    key={persona.id}
                    onClick={() => handlePersonaSelect(persona.id, persona.href)}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex h-full flex-col gap-4 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-5 text-left shadow-sm transition hover:border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/90 text-white shadow-lg">
                        <Icon size={20} />
                      </div>
                      <Waves size={18} className="text-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-slate-900">
                        {persona.title}
                      </p>
                      <p className="text-sm text-slate-500">{persona.description}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      Fortfahren →
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

