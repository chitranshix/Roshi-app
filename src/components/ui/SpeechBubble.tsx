import styles from './SpeechBubble.module.css'

interface Props {
  children: React.ReactNode
  className?: string
  tail?: 'right' | 'top' | 'bottom-right'
}

const TAIL_CLASS = {
  'right':        'tailRight',
  'top':          'tailTop',
  'bottom-right': 'tailBottomRight',
} as const

export default function SpeechBubble({ children, className, tail = 'right' }: Props) {
  return (
    <div className={[styles.bubble, styles[TAIL_CLASS[tail]], className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
