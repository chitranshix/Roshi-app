import { createServerSupabase } from '@/lib/supabase-server'
import TrapClient from './TrapClient'

export const dynamic = 'force-dynamic'

interface Props { searchParams: Promise<{ word?: string }> }

export default async function TrapPage({ searchParams }: Props) {
  const { word } = await searchParams
  const supabase = await createServerSupabase()
  const { data: users } = await supabase.from('users').select('id, name')
  const { data: { user } } = await supabase.auth.getUser()
  const friends = (users ?? []).filter(u => u.id !== user?.id)
  return <TrapClient word={word ?? null} friends={friends} myId={user?.id ?? null} />
}
