import styles from './Card.module.css'

interface CardProps {
  children: React.ReactNode
  flush?: boolean
  className?: string
  onClick?: () => void
}

export default function Card({ children, flush, className, onClick }: CardProps) {
  const cls = [styles.card, flush ? styles.flush : '', className].filter(Boolean).join(' ')
  return (
    <div className={cls} onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      {children}
    </div>
  )
}
