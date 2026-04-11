'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'

/**
 * Invite deep link — /join/[dare-id]
 * If signed in: redirect straight to the dare.
 * If not: save the dare ID, go to onboarding, then redirect after sign-in.
 */
export default function JoinPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Already signed in — go straight to the dare
        router.replace(`/dare/${id}`)
      } else {
        // Save the intended destination, go sign in
        sessionStorage.setItem('roshi_join_dare', id)
        router.replace('/onboarding')
      }
    })
  }, [id, router])

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100dvh', fontFamily: 'var(--font-ui)', color: 'var(--muted)',
      fontSize: 14,
    }}>
      loading dare…
    </div>
  )
}
