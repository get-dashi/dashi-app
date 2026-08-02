import { cn } from '@/lib/utils'

interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function Chip({ label, active, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 whitespace-nowrap',
        active
          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-white'
          : 'bg-white/6 border border-white/10 text-white/60 hover:text-white hover:border-white/20',
        className
      )}
    >
      {label}
    </button>
  )
}
