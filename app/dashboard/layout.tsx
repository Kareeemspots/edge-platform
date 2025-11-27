import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Get user profile to determine persona
  const { data: profile } = await supabase
    .from('profiles')
    .select('persona')
    .eq('id', user.id)
    .single()

  const persona = profile?.persona as 'designer' | 'organizer' | 'club' | null

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <DashboardSidebar persona={persona} />
      <main className="ml-64 min-h-screen p-8">{children}</main>
    </div>
  )
}

