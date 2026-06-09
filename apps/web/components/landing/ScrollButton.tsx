'use client'

import { ChevronDown } from 'lucide-react'

const SECTIONS = [
  'hero',
  'preview',
  'features',
  'how-it-works',
  'security',
  'cta',
]

interface ScrollButtonProps {
  currentSection: string
}

export default function ScrollButton({ currentSection }: ScrollButtonProps) {
  const currentIndex = SECTIONS.indexOf(currentSection)
  const nextSection = SECTIONS[currentIndex + 1]
  if (!nextSection) return null

  return (
    <button
      onClick={() =>
        document
          .getElementById(nextSection)
          ?.scrollIntoView({ behavior: 'smooth' })
      }
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#8b949e] hover:text-[#00C896] transition-colors group"
    >
      <div className="w-8 h-8 rounded-full border border-[#1a2d3d] group-hover:border-[#00C896] flex items-center justify-center transition-colors animate-bounce">
        <ChevronDown size={16} />
      </div>
    </button>
  )
}
