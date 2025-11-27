'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'
import SmartLinkInput, { type SmartLink } from '@/components/SmartLinkInput'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/utils/cn'
import { toast } from 'sonner'

const BUCKET = 'edge_assets'

const createFileKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

// Sanitize filename to remove special characters
const safeFileName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function DesignerDashboard() {
  const supabase = useMemo(() => createClient(), [])

  const [title, setTitle] = useState('')
  const [locationName, setLocationName] = useState('')
  const [djName, setDjName] = useState('')
  const [hexColor, setHexColor] = useState('#00c8aa')
  const [smartLinks, setSmartLinks] = useState<SmartLink[]>([])

  const [mainFile, setMainFile] = useState<File | null>(null)
  const [mainPreview, setMainPreview] = useState<string | null>(null)
  const [locationLogoFile, setLocationLogoFile] = useState<File | null>(null)
  const [locationLogoPreview, setLocationLogoPreview] = useState<string | null>(null)

  const [isDraggingAsset, setIsDraggingAsset] = useState(false)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUserId()
  }, [supabase])

  useEffect(() => {
    return () => {
      if (mainPreview) URL.revokeObjectURL(mainPreview)
      if (locationLogoPreview) URL.revokeObjectURL(locationLogoPreview)
    }
  }, [mainPreview, locationLogoPreview])

  const resetForm = () => {
    setTitle('')
    setLocationName('')
    setDjName('')
    setHexColor('#00c8aa')
    setSmartLinks([])
    setMainFile(null)
    setLocationLogoFile(null)
    if (mainPreview) URL.revokeObjectURL(mainPreview)
    if (locationLogoPreview) URL.revokeObjectURL(locationLogoPreview)
    setMainPreview(null)
    setLocationLogoPreview(null)
  }

  const handleMainFileSelect = (file: File | null) => {
    if (!file) return
    if (mainPreview) URL.revokeObjectURL(mainPreview)
    setMainFile(file)
    setMainPreview(URL.createObjectURL(file))
  }

  const handleLocationLogoSelect = (file: File | null) => {
    if (!file) return
    if (locationLogoPreview) URL.revokeObjectURL(locationLogoPreview)
    setLocationLogoFile(file)
    setLocationLogoPreview(URL.createObjectURL(file))
  }

  const handleAssetDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingAsset(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleMainFileSelect(file)
  }

  const handlePublish = async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Validate user is logged in
    if (!userId) {
      const errorMsg = 'Du musst angemeldet sein, um Assets hochzuladen.'
      setStatus('error')
      setFeedback(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate main file is selected
    if (!mainFile) {
      const errorMsg = 'Bitte wähle ein Haupt-Asset aus.'
      setStatus('error')
      setFeedback(errorMsg)
      toast.error(errorMsg)
      return
    }

    setStatus('uploading')
    setFeedback(null)
    setProgress(18)

    try {
      // Sanitize filenames for storage
      const safeName = safeFileName(mainFile.name)
      const assetPath = `events/${createFileKey()}-${safeName}`
      
      // Upload main file
      const { data: mainData, error: mainError } = await supabase.storage
        .from(BUCKET)
        .upload(assetPath, mainFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (mainError) {
        if (mainError.message.includes('Bucket not found')) {
          throw new Error('Storage-Bucket nicht gefunden. Bitte kontaktiere den Support.')
        } else if (mainError.message.includes('exceeded')) {
          throw new Error('Datei zu groß. Maximale Größe: 50MB.')
        } else if (mainError.message.includes('not allowed')) {
          throw new Error('Zugriff verweigert. Bitte überprüfe deine Berechtigungen.')
        }
        throw mainError
      }

      setProgress(40)

      // Upload location logo if provided
      let locationPath: string | null = null
      if (locationLogoFile) {
        const safeLogoName = safeFileName(locationLogoFile.name)
        locationPath = `locations/${createFileKey()}-${safeLogoName}`
        
        const { error: logoError } = await supabase.storage
          .from(BUCKET)
          .upload(locationPath, locationLogoFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (logoError) {
          console.warn('Location logo upload failed:', logoError)
          // Continue without logo
          locationPath = null
        }
      }

      setProgress(60)

      // Get public URLs
      const {
        data: { publicUrl: assetPublicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(assetPath)

      let locationLogoUrl: string | null = null
      if (locationPath) {
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET).getPublicUrl(locationPath)
        locationLogoUrl = publicUrl
      }

      setProgress(75)

      // Insert asset record into database
      const { error: insertError } = await supabase.from('assets').insert({
        title,
        file_url: assetPublicUrl,
        thumbnail_url: assetPublicUrl,
        file_type: mainFile.type,
        width: null,
        height: null,
        uploader_id: userId,
        location_name: locationName || null,
        location_logo_url: locationLogoUrl,
        dj_name: djName || null,
        smart_links: smartLinks.length ? smartLinks : null,
        hex_color: hexColor || null,
      })

      if (insertError) {
        if (insertError.message.includes('duplicate')) {
          throw new Error('Dieses Asset existiert bereits.')
        } else if (insertError.message.includes('foreign key')) {
          throw new Error('Benutzer-ID ungültig. Bitte melde dich erneut an.')
        }
        throw insertError
      }

      setProgress(100)
      setStatus('success')
      const successMsg = 'Event wurde erfolgreich auf EDGE veröffentlicht!'
      setFeedback(successMsg)
      toast.success(successMsg)
      resetForm()
      setTimeout(() => setProgress(0), 1200)
    } catch (error) {
      console.error('Upload error:', error)
      setStatus('error')
      const errorMsg = error instanceof Error 
        ? error.message 
        : 'Upload fehlgeschlagen. Bitte versuche es erneut.'
      setFeedback(errorMsg)
      toast.error(errorMsg)
      setTimeout(() => setProgress(0), 1200)
    }
  }

  const renderMainPreview = () => {
    if (!mainPreview) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 text-center text-slate-500">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <UploadCloud className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">Haupt-Asset</p>
            <p className="text-sm text-slate-500">
              Ziehe 4K Stills, Hero Frames oder Looping Motion hierher.
            </p>
          </div>
          <label
            htmlFor="main-asset"
            className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            Dateien durchsuchen
          </label>
        </div>
      )
    }

    const isVideo = mainFile?.type?.startsWith('video')
    return (
      <div className="relative overflow-hidden rounded-3xl bg-slate-50">
        {isVideo ? (
          <video
            src={mainPreview}
            className="h-full w-full object-cover"
            controls
            muted
            playsInline
          />
        ) : (
          <Image
            src={mainPreview}
            alt="Asset-Vorschau"
            width={1200}
            height={1600}
            className="h-full w-full object-cover"
            unoptimized
          />
        )}
        <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {mainFile?.name}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-normal text-slate-400">
          Designer Dashboard
        </p>
        <h1 className="text-4xl font-semibold leading-tight text-slate-800">
          Creative Studio
        </h1>
        <p className="text-lg text-slate-500">
          Lade deine kreativen Assets hoch und verwalte sie präzise.
        </p>
      </header>

      <form
        onSubmit={handlePublish}
        className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]"
      >
        <div
          onDragEnter={(event) => {
            event.preventDefault()
            setIsDraggingAsset(true)
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsDraggingAsset(false)
            }
          }}
          onDrop={handleAssetDrop}
          className={cn(
            'relative min-h-[480px] rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 transition-all',
            isDraggingAsset && 'border-slate-400 bg-slate-50'
          )}
        >
          <input
            type="file"
            id="main-asset"
            accept="image/*,video/*"
            className="hidden"
            onChange={(event) =>
              handleMainFileSelect(event.target.files?.[0] ?? null)
            }
          />
          {renderMainPreview()}
          {mainFile && (
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                {Math.round((mainFile.size / 1024 / 1024) * 10) / 10} MB
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                {mainFile.type || 'unknown'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="space-y-5">
              <div>
                <label className="text-xs uppercase tracking-normal text-slate-400">
                  Event-Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="EDGE x Hyperion Showcase"
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-normal text-slate-400">
                    Location
                  </label>
                  <input
                    type="text"
                    value={locationName}
                    onChange={(event) => setLocationName(event.target.value)}
                    placeholder="Horizon Sky Towers"
                    className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div className="w-full md:w-40">
                  <label className="text-xs uppercase tracking-normal text-slate-400">
                    Location Logo
                  </label>
                  <input
                    type="file"
                    id="location-logo"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handleLocationLogoSelect(event.target.files?.[0] ?? null)
                    }
                  />
                  <label
                    htmlFor="location-logo"
                    className="mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-center text-xs font-semibold text-slate-500 transition hover:border-slate-400"
                  >
                    Hochladen
                  </label>
                  {locationLogoPreview && (
                    <div className="mt-3 h-16 w-16 overflow-hidden rounded-2xl border border-slate-200">
                      <Image
                        src={locationLogoPreview}
                        alt="Location Logo Vorschau"
                        width={64}
                        height={64}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-normal text-slate-400">
                  Line-up / DJ
                </label>
                <input
                  type="text"
                  value={djName}
                  onChange={(event) => setDjName(event.target.value)}
                  placeholder="Sarah Mitchell · Live"
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-normal text-slate-400">
                  Vibe Match
                </p>
                <h3 className="mt-2 text-lg font-semibold text-slate-800">
                  Dominante Farbe für sofortiges Mood-Matching.
                </h3>
                <p className="text-sm text-slate-500">
                  Diese Farbe treibt Dashboard-Pills, Preview-Dots und Smart-Filter an.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={hexColor}
                  onChange={(event) => setHexColor(event.target.value)}
                  className="h-16 w-16 cursor-pointer rounded-2xl border border-slate-200"
                  aria-label="Dominante Farbe auswählen"
                />
                <div>
                  <p className="text-xs uppercase tracking-normal text-slate-400">
                    HEX
                  </p>
                  <p className="text-xl font-semibold text-slate-800">{hexColor}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <SmartLinkInput value={smartLinks} onChange={setSmartLinks} />
          </div>

          {progress > 0 && (
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">
                {status === 'uploading' ? 'Drop wird veröffentlicht…' : feedback}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'uploading' || !userId}
            className={cn(
              'w-full rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800',
              (status === 'uploading' || !userId) && 'pointer-events-none opacity-70'
            )}
          >
            {status === 'uploading' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Wird veröffentlicht
              </span>
            ) : (
              'Drop veröffentlichen'
            )}
          </button>

          {feedback && status !== 'uploading' && (
            <p
              className={cn(
                'text-center text-sm',
                status === 'success' ? 'text-emerald-500' : 'text-rose-500'
              )}
            >
              {feedback}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

