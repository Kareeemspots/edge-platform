'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Download } from 'lucide-react'
import { Database } from '@/types/database'
import { cn } from '@/utils/cn'

type Asset = Database['public']['Tables']['assets']['Row']

interface AssetCardProps {
  asset: Asset
  className?: string
}

const WATERMARK_SVG = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <text x="0" y="120" font-size="18" font-family="Inter, Arial, sans-serif" fill="%23121c2f" fill-opacity="0.08">EDGE PREVIEW</text>
  </svg>
`)

const DATE_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export default function AssetCard({ asset, className }: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const isVideo = asset.file_type?.startsWith('video')
  const mediaSrc = asset.thumbnail_url || asset.file_url
  const smartLinksCount =
    asset.smart_links && Array.isArray(asset.smart_links)
      ? asset.smart_links.length
      : 0
  const dominantColor = asset.hex_color || '#00c8aa'
  const updatedAt = asset.created_at ? new Date(asset.created_at) : new Date()
  const formattedUpdatedAt = DATE_FORMATTER.format(updatedAt)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoRef.current && isVideo) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => null)
      }
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current && isVideo) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const handleDownload = () => {
    window.open(asset.file_url, '_blank')
  }

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100">
        {isVideo ? (
          <video
            ref={videoRef}
            src={asset.file_url}
            poster={mediaSrc}
            muted
            loop
            playsInline
            preload="metadata"
            className={cn(
              'h-full w-full object-cover transition duration-500',
              isHovered ? 'scale-105' : 'scale-100'
            )}
          />
        ) : (
          <Image
            src={mediaSrc}
            alt={asset.title}
            width={asset.width || 800}
            height={asset.height || 1000}
            className={cn(
              'h-full w-full object-cover transition duration-500',
              isHovered ? 'scale-105' : 'scale-100'
            )}
            unoptimized
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage: `url("data:image/svg+xml,${WATERMARK_SVG}")`,
            backgroundSize: '160px 160px',
            transform: 'rotate(-45deg) scale(1.2)',
            transformOrigin: 'center',
            mixBlendMode: 'multiply',
          }}
        />

        {asset.location_logo_url && (
          <div className="absolute left-4 top-4 h-11 w-11 overflow-hidden rounded-2xl border border-white/50 bg-white/80 shadow-md backdrop-blur">
            <Image
              src={asset.location_logo_url}
              alt={`${asset.location_name ?? 'Location'} logo`}
              width={44}
              height={44}
              className="h-full w-full object-cover"
              unoptimized
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {asset.location_name ?? 'Edge Collection'}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-slate-800">
              {asset.title}
            </h3>
            {asset.dj_name && (
              <p className="text-sm text-slate-500">{asset.dj_name}</p>
            )}
          </div>
          <span
            className="mt-1 inline-flex h-4 w-4 rounded-full border border-white shadow-inner"
            style={{ backgroundColor: dominantColor }}
            aria-label="Dominant color"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            {isVideo ? 'Ultra Motion' : 'Still Capture'}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            {smartLinksCount} Smart Links
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">Updated {formattedUpdatedAt}</p>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            aria-label="Download asset"
          >
            <Download size={16} />
            Save
          </button>
        </div>
      </div>
    </article>
  )
}

