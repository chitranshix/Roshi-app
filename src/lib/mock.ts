// Temporary mock data — replace with Supabase queries later

export type DareStatus = 'pending_you' | 'pending_them' | 'complete'

export interface Dare {
  id: string
  word: string
  from: string
  to: string
  status: DareStatus
  sentAt: string        // relative string for now
  yourPoints?: number
}

export interface DailyWord {
  word: string
  completedBy: string[] // player names who finished
  allPlayers: string[]
}

export const MOCK_PLAYER = 'Aashu'

export const MOCK_DAILY: DailyWord = {
  word: 'pellucid',
  completedBy: ['Sam', 'Alex'],
  allPlayers: ['Sam', 'Alex', 'Priya', MOCK_PLAYER],
}

export const MOCK_DARES: Dare[] = [
  { id: 'd1', word: 'loquacious', from: 'Sam',  to: MOCK_PLAYER, status: 'pending_you',   sentAt: '2h ago' },
  { id: 'd2', word: 'ephemeral',  from: MOCK_PLAYER, to: 'Alex',  status: 'pending_them',  sentAt: '6h ago' },
  { id: 'd3', word: 'luminous',   from: 'Priya', to: MOCK_PLAYER, status: 'pending_you',   sentAt: '1d ago' },
]

// Sentence options for a dare — in real app, generated server-side
export const MOCK_SENTENCES: Record<string, { sentence: string; correct: boolean }[]> = {
  loquacious: [
    { sentence: 'The loquacious man sat in silence all evening.', correct: false },
    { sentence: 'She was loquacious, never pausing her stream of stories.', correct: true },
    { sentence: 'The loquacious path wound through the forest slowly.', correct: false },
    { sentence: 'He gave a short, loquacious nod and left the room.', correct: false },
  ],
}
