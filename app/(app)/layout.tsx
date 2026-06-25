import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import { getMyOrganizations } from '@/actions/organizations'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [profileResult, orgs] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getMyOrganizations(),
  ])

  return (
    <div className="flex h-screen bg-[#0d0d14] overflow-hidden">
      <Sidebar profile={profileResult.data} orgs={orgs} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
