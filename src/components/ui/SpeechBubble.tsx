import styles from './SpeechBubble.module.css'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function SpeechBubble({ children, className }: Props) {
  return (
    <div className={[styles.bubble, className].filter(Boolean).join(' ')}>
      <div className={styles.tail} />
      {children}
    </div>
  )
}
