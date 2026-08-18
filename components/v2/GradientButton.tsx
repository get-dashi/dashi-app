'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'gradient' | 'outline' | 'ghost'
  icon?: ReactNode
  fullWidth?: boolean
}

export function GradientButton({
  children,
  size = 'md',
  variant = 'gradient',
  icon,
  fullWidth = false,
  className = '',
  style,
  ...props
}: GradientButtonProps) {
  const heights = { sm: 44, md: 52, lg: 56 }
  const fontSizes = { sm: '0.78rem', md: '0.875rem', lg: '0.95rem' }

  const base: React.CSSProperties = {
    height: heights[size],
    borderRadius: 14,
    fontWeight: 800,
    fontSize: fontSizes[size],
    letterSpacing: '-0.01em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.12s ease, opacity 0.12s ease',
    width: fullWidth ? '100%' : undefined,
    paddingLeft: 20,
    paddingRight: 20,
    ...style,
  }

  const variants: Record<string, React.CSSProperties> = {
    gradient: {
      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
      color: '#fff',
      boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
    },
    outline: {
      background: 'rgba(124,58,237,0.1)',
      color: '#fff',
      border: '1px solid rgba(124,58,237,0.4)',
    },
    ghost: {
      background: 'rgba(255,255,255,0.06)',
      color: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(255,255,255,0.1)',
    },
  }

  return (
    <button
      {...props}
      style={{ ...base, ...variants[variant] }}
      className={`active:scale-95 ${className}`}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  )
}
