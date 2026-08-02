'use client'

interface RecommendationCountProps {
  count: number
  size?: 'sm' | 'md'
}

export function RecommendationCount({ count, size = 'sm' }: RecommendationCountProps) {
  if (count <= 0) return null

  const textClass =
    size === 'md'
      ? 'text-[0.68rem] font-bold'
      : 'text-[0.55rem] font-bold'

  return (
    <span
      className={`${textClass} bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent`}
    >
      {count} {count === 1 ? 'person' : 'people'} added this
    </span>
  )
}
