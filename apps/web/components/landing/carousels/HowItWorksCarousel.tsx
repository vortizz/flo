'use client'

import { useState, useRef } from 'react'
import CarouselControls from './CarouselControls'

interface Step {
  title: string
  desc: string
}

export default function HowItWorksCarousel({ steps }: { steps: Step[] }) {
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  function goTo(index: number) {
    const next = Math.max(0, Math.min(index, steps.length - 1))
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
    <div className="md:hidden w-full flex flex-col items-center gap-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto flex snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            className="shrink-0 snap-center px-4"
            style={{ width: '100%' }}
          >
            <div className="flex flex-col items-center text-center gap-4 bg-[#0d1f2d] border border-[#1a2d3d] rounded-[14px] p-8">
              <div className="w-14 h-14 rounded-full bg-[#071828] border-2 border-[#00C896] flex items-center justify-center text-xl font-bold text-[#00C896]">
                {i + 1}
              </div>
              <div className="text-base font-semibold text-white">
                {s.title}
              </div>
              <div className="text-sm text-[#8b949e] leading-relaxed">
                {s.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
      <CarouselControls current={current} total={steps.length} onGoTo={goTo} />
    </div>
  )
}
