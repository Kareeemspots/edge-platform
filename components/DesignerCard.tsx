import { useRef } from 'react'
import Image from 'next/image'
import { Star, MapPin } from 'lucide-react'
import { Database } from '@/types/database'

type Asset = Database['public']['Tables']['assets']['Row']
type ServicePackage = Database['public']['Tables']['service_packages']['Row']

interface DesignerWithData {
  id: string
  username: string | null
  avatar_url: string | null
  assets: Asset[]
  packages: ServicePackage[]
  rating?: number // Mock property
  location?: string // Mock property
}

interface DesignerCardProps {
  designer: DesignerWithData
}

export default function DesignerCard({ designer }: DesignerCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // FIX: Wir erzwingen hier die Umwandlung in eine Zahl mit || 0 Fallback
  const minPrice = designer.packages?.length 
    ? Math.min(...designer.packages.map((pkg) => Number(pkg.price || 0))) 
    : 0

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white transition hover:shadow-lg">
      {/* Image Carousel */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <div
          ref={scrollRef}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
        >
          {designer.assets.slice(0, 5).map((asset) => (
            <div key={asset.id} className="relative h-full w-full flex-shrink-0 snap-center">
              <Image
                src={asset.thumbnail_url || asset.file_url}
                alt={asset.title || 'Designer Asset'}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
          {designer.assets.length === 0 && (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              No media
            </div>
          )}
        </div>
        
        {/* Navigation Arrows (Hidden by default, show on hover) */}
        <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 transition group-hover:opacity-100 pointer-events-none">
          <button 
            onClick={handlePrevSlide} 
            className="pointer-events-auto rounded-full bg-white/80 p-2 shadow-sm hover:bg-white"
          >
            ←
          </button>
          <button 
            onClick={handleNextSlide} 
            className="pointer-events-auto rounded-full bg-white/80 p-2 shadow-sm hover:bg-white"
          >
            →
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-100">
              {designer.avatar_url ? (
                <Image src={designer.avatar_url} alt={designer.username || ''} fill className="object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-900" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                {designer.username || 'Unnamed Studio'}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} />
                <span>{designer.location || 'Remote'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-slate-700">4.9</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Starting at</span>
            <span className="text-lg font-bold text-slate-900">€{minPrice}</span>
          </div>
          <button className="rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-slate-800">
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}
