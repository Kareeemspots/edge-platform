import type { DesignerWithData } from '@/components/DesignerCard'
import type { Database } from '@/types/database'

export type DesignerDiscipline = 'Motion' | '3D' | 'Static' | 'Branding'

type Asset = Database['public']['Tables']['assets']['Row']
export type DesignerPackage = Database['public']['Tables']['service_packages']['Row']

const STUDIO_NAMES = [
  'Neon Studio',
  'VibeGraphix',
  'Lumen Forge',
  'Pulse Patterns',
  'Afterglow Labs',
  'Velocity Division',
  'Echo Atelier',
  'Nova Grid',
  'Spectrum Assembly',
  'Orbit Works',
  'Halo Graphics',
  'Signal Studio',
]

const LOCATIONS = [
  'Berlin, DE',
  'Paris, FR',
  'Lisbon, PT',
  'Amsterdam, NL',
  'London, UK',
  'Barcelona, ES',
  'Copenhagen, DK',
  'Zurich, CH',
]

const PLACEHOLDER_AVATARS = [
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80',
]

const PORTFOLIO_STILLS = [
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
]

const DISCIPLINES: DesignerDiscipline[] = ['Motion', '3D', 'Static', 'Branding']

const randomFrom = <T,>(items: T[]): T =>
  items[Math.floor(Math.random() * items.length)]

const buildAssets = (designerId: string): Asset[] => {
  const shuffled = [...PORTFOLIO_STILLS].sort(() => 0.5 - Math.random())

  return shuffled.slice(0, 3).map((imageUrl, index) => ({
    id: `${designerId}-asset-${index}`,
    title: `Portfolio Asset ${index + 1}`,
    file_url: imageUrl,
    thumbnail_url: imageUrl,
    file_type: 'image/jpeg',
    width: null,
    height: null,
    uploader_id: designerId,
    location_name: null,
    location_logo_url: null,
    dj_name: null,
    smart_links: null,
    hex_color: '#0f172a',
  }))
}

const buildPackages = (designerId: string): DesignerPackage[] => [
  {
    id: `${designerId}-pkg-basic`,
    designer_id: designerId,
    tier: 'Basic',
    price: Math.floor(Math.random() * 400 + 400),
    turnaround: `${Math.floor(Math.random() * 3 + 3)} Tage`,
    description: '1 Key Visual + 2 Revisionen',
    created_at: new Date().toISOString(),
  },
  {
    id: `${designerId}-pkg-standard`,
    designer_id: designerId,
    tier: 'Standard',
    price: Math.floor(Math.random() * 500 + 900),
    turnaround: `${Math.floor(Math.random() * 4 + 5)} Tage`,
    description: 'Loop-Motion + Social Kit',
    created_at: new Date().toISOString(),
  },
  {
    id: `${designerId}-pkg-premium`,
    designer_id: designerId,
    tier: 'Premium',
    price: Math.floor(Math.random() * 800 + 1400),
    turnaround: `${Math.floor(Math.random() * 4 + 7)} Tage`,
    description: 'Aftermovie + Full Brand System',
    created_at: new Date().toISOString(),
  },
]

export type MockDesigner = DesignerWithData & {
  name: string
  studio: string
  discipline: DesignerDiscipline
  location: string
  rating: number
}

export const generateMockDesigners = (count = 8): MockDesigner[] =>
  Array.from({ length: count }).map((_, index) => {
    const id = `mock-${index}`
    const studioName = STUDIO_NAMES[(index + 3) % STUDIO_NAMES.length]

    return {
      id,
      name: studioName,
      studio: studioName,
      username: studioName,
      avatar_url: randomFrom(PLACEHOLDER_AVATARS),
      rating: Number((Math.random() * 0.7 + 4.2).toFixed(1)),
      discipline: randomFrom(DISCIPLINES),
      location: randomFrom(LOCATIONS),
      assets: buildAssets(id),
      packages: buildPackages(id),
    }
  })

