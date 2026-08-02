import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25',
      secondary: 'bg-[#1c1c1e] border border-[#2a2a2e] text-[#f5f5f7] hover:bg-[#2a2a2e]',
      ghost: 'bg-transparent border border-white/10 text-white/70 hover:bg-white/5',
      danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
    }

    const sizes = {
      sm: 'text-xs px-4 py-2',
      md: 'text-sm px-5 py-3',
      lg: 'text-base px-7 py-4 rounded-2xl',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
