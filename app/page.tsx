import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import HomeExperience from '@/components/HomeExperience'

async function HomeContent() {
  const supabase = await createClient()

  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(18)

  if (error) {
    console.error('Error fetching assets:', error)
  }

  return <HomeExperience assets={assets ?? []} />
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FB]" />}>
      <HomeContent />
    </Suspense>
  )
}
