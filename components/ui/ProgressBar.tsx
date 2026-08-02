interface ProgressBarProps {
  value: number // 0-100
  className?: string
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={`h-1 bg-white/8 rounded-full overflow-hidden ${className ?? ''}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
