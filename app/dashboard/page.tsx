'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import PersonaModal from '@/components/PersonaModal'

const personaRouteMap: Record<string, string> = {
  designer: '/dashboard/designer',
  organizer: '/dashboard/organizer',
  club: '/dashboard/club',
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [persona, setPersona] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPersonaModal, setShowPersonaModal] = useState(false)

  useEffect(() => {
    const checkPersona = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('persona')
          .eq('id', user.id)
          .single()

        const userPersona = profile?.persona as string | null
        setPersona(userPersona)

        if (userPersona && personaRouteMap[userPersona]) {
          // Redirect to persona-specific dashboard
          router.replace(personaRouteMap[userPersona])
        } else {
          // Show persona selection modal
          setShowPersonaModal(true)
        }
      } catch (error) {
        console.error('Error checking persona:', error)
        setShowPersonaModal(true)
      } finally {
        setLoading(false)
      }
    }

    checkPersona()
  }, [router, supabase])

  const handlePersonaSelected = () => {
    setShowPersonaModal(false)
    // The PersonaModal will handle the redirect
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900 mx-auto" />
          <p className="text-sm text-slate-500">Lade Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PersonaModal open={showPersonaModal} onClose={handlePersonaSelected} />
      {!showPersonaModal && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">
              Weiterleitung zum Dashboard...
            </p>
          </div>
        </div>
      )}
    </>
  )
}

