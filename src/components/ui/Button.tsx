import styles from './Button.module.css'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'subtle'
  children: React.ReactNode
}

export default function Button({ variant = 'primary', children, className, ...rest }: ButtonProps) {
  const cls = [styles.btn, styles[variant], className].filter(Boolean).join(' ')
  return <button className={cls} {...rest}>{children}</button>
}
