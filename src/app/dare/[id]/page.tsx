import { notFound } from 'next/navigation'
import { MOCK_DARES } from '@/lib/mock'
import DareFlow from './DareFlow'

interface Props { params: Promise<{ id: string }> }

export default async function DarePage({ params }: Props) {
  const { id } = await params
  const dare = MOCK_DARES.find(d => d.id === id)
  if (!dare) notFound()
  return <DareFlow dare={dare} />
}
