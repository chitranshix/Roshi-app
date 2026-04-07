import styles from './SpeechBubble.module.css'

interface Props {
  children: React.ReactNode
  className?: string
  tail?: 'right' | 'top' | 'bottom-right'
}

export default function SpeechBubble({ children, className, tail = 'right' }: Props) {
  return (
    <div className={[
      styles.bubble,
      tail === 'top' ? styles.tailTop : tail === 'bottom-right' ? styles.tailBottomRight : styles.tailRight,
      className,
    ].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
