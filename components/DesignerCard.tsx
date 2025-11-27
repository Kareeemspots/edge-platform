'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Star, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import type { DesignerProfile, DesignerPackage } from '@/utils/mockData'

type DesignerCardProps = {
  designer: DesignerProfile & { color?: string | null }
  onBook: (designer: DesignerProfile, pkg: DesignerPackage) => void
}

export default function DesignerCard({ designer, onBook }: DesignerCardProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const minPrice = Math.min(...designer.packages.map((pkg) => Number(pkg.price)))

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : designer.portfolio.length - 1))
  }

  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentSlide((prev) => (prev < designer.portfolio.length - 1 ? prev + 1 : 0))
  }

  useEffect(() => {
    if (scrollRef.current) {
      const scrollWidth = scrollRef.current.scrollWidth / designer.portfolio.length
      scrollRef.current.scrollTo({
        left: scrollWidth * currentSlide,
        behavior: 'smooth',
      })
    }
  }, [currentSlide, designer.portfolio.length])

  const handleCardClick = () => {
    // Open booking modal with first package
    onBook(designer, designer.packages[0])
  }

  return (
    <div
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      onClick={handleCardClick}
    >
      {/* Image Carousel */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <div
          ref={scrollRef}
          className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {designer.portfolio.map((image, index) => (
            <div
              key={index}
              className="relative h-full w-full flex-shrink-0 snap-center"
            >
              <Image
                src={image}
                alt={`${designer.name} portfolio ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows - Only show if more than 1 image */}
        {designer.portfolio.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md opacity-0 transition hover:bg-white group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-md opacity-0 transition hover:bg-white group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {designer.portfolio.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentSlide(index)
                  }}
                  className={`h-1.5 rounded-full transition ${
                    index === currentSlide
                      ? 'w-6 bg-white'
                      : 'w-1.5 bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Discipline Badge */}
        <div className="absolute right-3 top-3 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {designer.discipline}
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-col gap-3 p-4">
        {/* Header with Avatar and Name */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50">
            <Image
              src={designer.avatar}
              alt={designer.name}
              fill
              sizes="48px"
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {designer.name}
            </h3>
            <p className="truncate text-xs text-slate-500">{designer.studio}</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-semibold text-slate-900">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {designer.rating}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={12} />
          {designer.location}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <p className="text-xs text-slate-500">Ab</p>
            <p className="text-lg font-semibold text-slate-900">€{minPrice}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBook(designer, designer.packages[0])
            }}
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Jetzt buchen
          </button>
        </div>
      </div>
    </div>
  )
}

