'use client'

import { MOOD_FILTERS } from '@/lib/venues'
import { Chip } from '@/components/ui/Chip'

interface MoodFilterProps {
  active: string
  onChange: (mood: string) => void
}

export function MoodFilter({ active, onChange }: MoodFilterProps) {
  return (
    <div className="px-5 pb-3 flex-shrink-0">
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {Object.entries(MOOD_FILTERS).map(([key, cfg]) => (
          <Chip
            key={key}
            label={cfg.label}
            active={active === key}
            onClick={() => onChange(key)}
          />
        ))}
      </div>
    </div>
  )
}
