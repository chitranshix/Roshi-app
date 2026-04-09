const COLORS = [
  '#E17055', '#FDCB6E', '#00B894', '#0984E3',
  '#6C5CE7', '#E84393', '#00CEC9', '#D63031',
  '#A29BFE', '#55EFC4', '#F39C12', '#8E44AD',
]

function colorFromName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

interface AvatarProps {
  name: string
  size?: number
  className?: string
}

export default function Avatar({ name, size = 36, className }: AvatarProps) {
  const bg = colorFromName(name)
  const initial = name.trim()[0]?.toUpperCase() ?? '?'
  const fontSize = Math.round(size * 0.42)

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize,
        color: '#fff',
        userSelect: 'none',
      }}
      aria-label={name}
    >
      {initial}
    </div>
  )
}
