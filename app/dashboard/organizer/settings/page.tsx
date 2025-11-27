'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Upload,
  Video as VideoIcon,
} from 'lucide-react'

import { createClient } from '@/utils/supabase/client'
import { cn } from '@/utils/cn'

const BUCKET = 'edge_assets'

type MediaItem = {
  name: string
  url: string
  type: 'image' | 'video'
  createdAt?: string
}

export default function OrganizerSettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [userId, setUserId] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const [avatarUploading, setAvatarUploading] = useState(false)
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const inferMediaType = useCallback((fileName: string): MediaItem['type'] => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    if (extension && ['mp4', 'mov', 'm4v'].includes(extension)) {
      return 'video'
    }
    return 'image'
  }, [])

  const fetchProfile = useCallback(
    async (uid: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', uid)
        .single()

      if (error) {
        console.error(error)
        return
      }

      setUsername(data?.username ?? 'Organizer')
      setAvatarUrl(data?.avatar_url ?? null)
    },
    [supabase]
  )

  const fetchMediaLibrary = useCallback(
    async (uid: string) => {
      setMediaLoading(true)
      const folder = `organizers/${uid}/brand-media`

      try {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(folder, {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' },
          })

        if (error) throw error

        if (!data) {
          setMediaItems([])
          return
        }

        const mapped: MediaItem[] = data.map((item) => {
          const fullPath = `${folder}/${item.name}`
          const {
            data: { publicUrl },
          } = supabase.storage.from(BUCKET).getPublicUrl(fullPath)

          const type = inferMediaType(item.name)
          return {
            name: item.name,
            url: publicUrl,
            type,
            createdAt: item.created_at ?? undefined,
          }
        })

        setMediaItems(mapped)
      } catch (storageError) {
        console.error(storageError)
        setMediaItems([])
      } finally {
        setMediaLoading(false)
      }
    },
    [inferMediaType, supabase]
  )

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarUploading(true)
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const filePath = `profiles/${userId}/avatar-${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, { upsert: true, cacheControl: '3600' })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      setStatusMessage('Avatar aktualisiert.')
    } catch (error) {
      console.error(error)
      setErrorMessage('Upload fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return
    const files = event.target.files
    if (!files?.length) return

    setMediaUploading(true)
    setErrorMessage(null)
    setStatusMessage(null)

    const folder = `organizers/${userId}/brand-media`

    try {
      await Promise.all(
        Array.from(files).map(async (file) => {
          const filePath = `${folder}/${Date.now()}-${file.name}`
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
            })
          if (error) throw error
        })
      )

      await fetchMediaLibrary(userId)
      setStatusMessage('Media Library aktualisiert.')
    } catch (error) {
      console.error(error)
      setErrorMessage('Upload fehlgeschlagen. Prüfe Dateityp & Größe.')
    } finally {
      setMediaUploading(false)
      if (event.target) event.target.value = ''
    }
  }

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) {
        console.error(error)
        return
      }

      if (user) {
        setUserId(user.id)
        await fetchProfile(user.id)
        await fetchMediaLibrary(user.id)
      }
    }

    loadProfile()
  }, [fetchMediaLibrary, fetchProfile, supabase])

  const renderMediaGrid = () => {
    if (mediaLoading) {
      return (
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Bibliothek wird geladen…
        </div>
      )
    }

    if (!mediaItems.length) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-inner">
            <ImageIcon className="h-6 w-6 text-slate-400" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Noch keine Brand Files
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Lade Logos & Aftermovies hoch, um deinen Katalog zu füllen.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {mediaItems.map((item) => (
          <div
            key={item.name}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100"
          >
            <div className="aspect-square overflow-hidden bg-slate-900/5">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  controls={false}
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <Image
                  src={item.url}
                  alt={item.name}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
              <p className="truncate text-xs font-semibold text-slate-700">
                {item.name}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {item.type === 'video' ? (
                  <>
                    <VideoIcon size={10} />
                    MP4
                  </>
                ) : (
                  <>
                    <ImageIcon size={10} />
                    LOGO
                  </>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-normal text-slate-400">Organizer</p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-900">
          Profile & Media
        </h1>
        <p className="text-lg text-slate-500">
          Apple-grade Controls für dein Booking Profil & Brand Library.
        </p>
      </header>

      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-normal text-slate-400">
              Section 01
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Avatar</h2>
            <p className="text-sm text-slate-500">
              Kuratiere dein Veranstalter-Profil mit einem präzisen Look.
            </p>
          </div>
          {statusMessage && (
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-500">
              {statusMessage}
            </span>
          )}
          {errorMessage && (
            <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              {errorMessage}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-8">
          <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-inner">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={username}
                fill
                className="object-cover"
                sizes="112px"
              />
            ) : (
              <div className="flex flex-col items-center text-slate-400">
                <Camera className="h-6 w-6" />
                <span className="mt-2 text-xs uppercase tracking-normal">
                  {username?.[0] ?? 'O'}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">{username}</p>
            <p className="text-xs text-slate-500">
              PNG / JPG, max. 5 MB. Quadratisch für perfekte Thumbnails.
            </p>
            <label
              className={cn(
                'inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-300 hover:text-slate-900',
                avatarUploading && 'pointer-events-none opacity-60'
              )}
            >
              <Upload size={14} />
              {avatarUploading ? 'Uploading…' : 'Upload Avatar'}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-normal text-slate-400">
              Section 02
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">
              Brand & Media Library
            </h2>
            <p className="text-sm text-slate-500">
              Logos, Motion Assets & Aftermovies zentral kuratiert.
            </p>
          </div>
          <label
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800',
              mediaUploading && 'pointer-events-none opacity-70'
            )}
          >
            <Upload size={14} />
            {mediaUploading ? 'Uploading…' : 'Upload Media'}
            <input
              type="file"
              accept="image/png,image/jpeg,video/mp4,video/mov,video/m4v"
              multiple
              className="hidden"
              onChange={handleMediaUpload}
            />
          </label>
        </div>

        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6">
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <ImageIcon size={14} />
              PNG · JPG
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              <VideoIcon size={14} />
              MP4 Aftermovies
            </div>
            <p className="text-xs text-slate-500">
              Max. 250MB pro Upload · Drag & Drop ready.
            </p>
          </div>

          {renderMediaGrid()}
        </div>
      </section>
    </div>
  )
}


