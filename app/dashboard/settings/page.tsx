'use client'

import { useState, useEffect, useMemo } from 'react'
import { User, Mail, Upload, Loader2, Camera } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

const BUCKET = 'edge_assets'

const createFileKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const safeFileName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [persona, setPersona] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      
      if (currentUser) {
        setUser(currentUser)
        setEmail(currentUser.email || '')
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url, persona')
          .eq('id', currentUser.id)
          .single()
        
        if (profile) {
          setUsername(profile.username || '')
          setAvatarUrl(profile.avatar_url || null)
          setPersona(profile.persona || null)
        }
      }
    }
    loadUserData()
  }, [supabase])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const preview = URL.createObjectURL(file)
      setAvatarPreview(preview)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return null

    setUploading(true)
    try {
      const safeName = safeFileName(avatarFile.name)
      const avatarPath = `avatars/${user.id}/${createFileKey()}-${safeName}`
      
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(avatarPath, avatarFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage-Bucket nicht gefunden.')
        } else if (uploadError.message.includes('exceeded')) {
          throw new Error('Datei zu groß. Maximale Größe: 5MB.')
        }
        throw uploadError
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(avatarPath)

      return publicUrl
    } catch (error) {
      console.error('Avatar upload error:', error)
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Avatar-Upload fehlgeschlagen.'
      toast.error(errorMsg)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!user) {
      toast.error('Kein Benutzer angemeldet.')
      return
    }

    setSaving(true)
    try {
      let newAvatarUrl = avatarUrl

      // Upload new avatar if selected
      if (avatarFile) {
        const uploadedUrl = await handleAvatarUpload()
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl
        } else {
          throw new Error('Avatar-Upload fehlgeschlagen.')
        }
      }

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            username,
            avatar_url: newAvatarUrl,
            persona,
          },
          { onConflict: 'id' }
        )

      if (error) {
        throw error
      }

      setAvatarUrl(newAvatarUrl)
      setAvatarFile(null)
      setAvatarPreview(null)
      
      toast.success('Profil erfolgreich aktualisiert!')
    } catch (error) {
      console.error('Save profile error:', error)
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Profil konnte nicht gespeichert werden.'
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const getPersonaLabel = () => {
    if (persona === 'designer') return 'Vorname / Künstlername'
    if (persona === 'organizer') return 'Name der Location / Brand'
    if (persona === 'club') return 'Name des Clubs / Venue'
    return 'Name'
  }

  const getPersonaPlaceholder = () => {
    if (persona === 'designer') return 'Max Mustermann'
    if (persona === 'organizer') return 'Hyperion Events'
    if (persona === 'club') return 'Berghain'
    return 'Dein Name'
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-normal text-slate-400">Einstellungen</p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-800">
          Konto-Einstellungen
        </h1>
        <p className="text-lg text-slate-500">
          Verwalte deine Konto-Präferenzen und Profilinformationen.
        </p>
      </header>

      {/* Avatar Upload Section */}
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Profilbild</h2>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative group">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-slate-200 bg-slate-50">
              {avatarPreview || avatarUrl ? (
                <Image
                  src={avatarPreview || avatarUrl || ''}
                  alt="Avatar"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-12 w-12 text-slate-300" />
                </div>
              )}
            </div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition hover:bg-slate-800"
            >
              <Camera size={18} />
            </label>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-semibold text-slate-900">Dein Profilbild</h3>
            <p className="mt-1 text-sm text-slate-500">
              JPG, PNG oder GIF (max. 5MB)
            </p>
            {avatarFile && (
              <p className="mt-2 text-xs text-emerald-600">
                Neues Bild ausgewählt: {avatarFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information Section */}
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Profilinformationen</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              <div className="mb-2 flex items-center gap-2">
                <Mail size={16} />
                E-Mail
              </div>
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600"
            />
            <p className="mt-1 text-xs text-slate-500">
              Deine E-Mail-Adresse kann nicht geändert werden.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              <div className="mb-2 flex items-center gap-2">
                <User size={16} />
                {getPersonaLabel()}
              </div>
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={getPersonaPlaceholder()}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
            <p className="mt-1 text-xs text-slate-500">
              {persona === 'designer' && 'Dein Name, wie er auf deinen Assets erscheint.'}
              {persona === 'organizer' && 'Name deiner Event-Agentur oder Brand.'}
              {persona === 'club' && 'Name deines Clubs oder Venue.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Persona
            </label>
            <div className="flex items-center gap-3">
              <select
                value={persona || ''}
                onChange={(e) => setPersona(e.target.value as any)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="" disabled>Wähle deine Rolle</option>
                <option value="designer">Designer</option>
                <option value="organizer">Veranstalter</option>
                <option value="club">Club / Venue</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Wähle die Rolle, die am besten zu deiner Nutzung passt.
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving || uploading}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving || uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird gespeichert...
            </>
          ) : (
            'Änderungen speichern'
          )}
        </button>
      </div>
    </div>
  )
}
