'use client'

import { useState, useRef } from 'react'
import CarouselControls from './CarouselControls'

interface Badge {
  icon: React.ReactNode
  title: string
  sub: string
}

export default function SecurityBadgesCarousel({
  badges,
}: {
  badges: Badge[]
}) {
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  function goTo(index: number) {
    const next = Math.max(0, Math.min(index, badges.length - 1))
    const el = scrollRef.current
    if (!el) return
    setCurrent(next)
    el.scrollTo({ left: next * el.offsetWidth, behavior: 'smooth' })
  }

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    setCurrent(Math.round(el.scrollLeft / el.offsetWidth))
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto flex snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {badges.map(b => (
          <div
            key={b.title}
            className="shrink-0 snap-center px-1"
            style={{ width: '100%' }}
          >
            <div className="flex items-center gap-3 p-4 bg-[#071828] border border-[#1a2d3d] rounded-[10px]">
              <div className="w-9 h-9 bg-[#00C89615] rounded-lg flex items-center justify-center text-[#00C896] shrink-0">
                {b.icon}
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">
                  {b.title}
                </div>
                <div className="text-[11px] text-[#8b949e]">{b.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <CarouselControls current={current} total={badges.length} onGoTo={goTo} />
    </div>
  )
}
