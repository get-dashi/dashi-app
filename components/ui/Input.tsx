import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-[#f5f5f7]',
            'placeholder:text-white/30 outline-none font-["Inter",sans-serif]',
            'focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all',
            error && 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 font-semibold">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
