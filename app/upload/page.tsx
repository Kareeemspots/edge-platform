'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Loader2, UploadCloud } from 'lucide-react'
import SmartLinkInput, { type SmartLink } from '@/components/SmartLinkInput'
import { createClient } from '@/utils/supabase/client'
import { cn } from '@/utils/cn'

const BUCKET = 'edge_assets'

const createFileKey = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

export default function UploadPage() {
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
    if (!mainFile) {
      setStatus('error')
      setFeedback('Please select a main asset.')
      return
    }

    setStatus('uploading')
    setFeedback(null)
    setProgress(18)

    try {
      const assetPath = `events/${createFileKey()}-${mainFile.name}`
      const uploads: Promise<any>[] = [
        supabase.storage.from(BUCKET).upload(assetPath, mainFile, {
          cacheControl: '3600',
          upsert: false,
        }),
      ]

      let locationPath: string | null = null
      if (locationLogoFile) {
        locationPath = `locations/${createFileKey()}-${locationLogoFile.name}`
        uploads.push(
          supabase.storage.from(BUCKET).upload(locationPath, locationLogoFile, {
            cacheControl: '3600',
            upsert: false,
          })
        )
      }

      const uploadResponses = await Promise.all(uploads)
      uploadResponses.forEach(({ error }) => {
        if (error) throw error
      })

      setProgress(60)

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

      setProgress(85)

      const { error: insertError } = await supabase.from('assets').insert({
        title,
        file_url: assetPublicUrl,
        thumbnail_url: assetPublicUrl,
        file_type: mainFile.type,
        width: null,
        height: null,
        uploader_id: 'edge-console',
        location_name: locationName || null,
        location_logo_url: locationLogoUrl,
        dj_name: djName || null,
        smart_links: smartLinks.length ? smartLinks : null,
        hex_color: hexColor || null,
      })

      if (insertError) throw insertError

      setProgress(100)
      setStatus('success')
      setFeedback('Event published to EDGE.')
      resetForm()
      setTimeout(() => setProgress(0), 1200)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setFeedback(
        error instanceof Error ? error.message : 'Upload failed. Please try again.'
      )
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
            <p className="text-base font-semibold text-slate-800">Main Asset</p>
            <p className="text-sm text-slate-500">
              Drop 4K stills, hero frames or looping motion.
            </p>
          </div>
          <label
            htmlFor="main-asset"
            className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
          >
            Browse files
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
            alt="Asset preview"
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
    <main className="relative min-h-screen bg-[#F8F9FB] px-4 pb-20 pt-32 text-slate-800">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 text-center md:text-left">
          <p className="text-xs uppercase tracking-normal text-slate-400">
            Edge Upload Studio
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-800 md:text-5xl">
            Curate your drop with Apple-grade finesse.
          </h1>
          <p className="text-lg text-slate-500">
            Ingest hero files, assign vibe-matching colors and publish in a single,
            serene workflow.
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
                    Event Name
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
                      Upload
                    </label>
                    {locationLogoPreview && (
                      <div className="mt-3 h-16 w-16 overflow-hidden rounded-2xl border border-slate-200">
                        <Image
                          src={locationLogoPreview}
                          alt="Location logo preview"
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
                    Dominant color for instant mood pairing.
                  </h3>
                  <p className="text-sm text-slate-500">
                    This hue powers dashboard pills, preview dots and smart filters.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={hexColor}
                    onChange={(event) => setHexColor(event.target.value)}
                    className="h-16 w-16 cursor-pointer rounded-2xl border border-slate-200"
                    aria-label="Dominant color selector"
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
                  {status === 'uploading' ? 'Publishing your drop…' : feedback}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'uploading'}
              className={cn(
                'w-full rounded-3xl bg-slate-900 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800',
                status === 'uploading' && 'pointer-events-none opacity-70'
              )}
            >
              {status === 'uploading' ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publishing
                </span>
              ) : (
                'Publish Drop'
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
    </main>
  )
}

