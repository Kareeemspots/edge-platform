'use client'

import { Database } from '@/types/database'
import AssetCard from './AssetCard'

type Asset = Database['public']['Tables']['assets']['Row']

interface MasonryGridProps {
  assets: Asset[]
}

export default function MasonryGrid({ assets }: MasonryGridProps) {
  return (
    <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
      {assets.map((asset) => (
        <div key={asset.id} className="break-inside-avoid">
          <AssetCard asset={asset} />
        </div>
      ))}
    </div>
  )
}

