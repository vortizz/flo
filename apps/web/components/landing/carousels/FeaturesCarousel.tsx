'use client'

import { useState, useRef } from 'react'
import FeatureCard from '../FeatureCard'
import CarouselControls from './CarouselControls'

interface Feature {
  icon: React.ReactNode
  title: string
  desc: string
}

export default function FeaturesCarousel({
  features,
}: {
  features: Feature[]
}) {
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  function goTo(index: number) {
    const next = Math.max(0, Math.min(index, features.length - 1))
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
    <div className="lg:hidden w-full flex flex-col items-center gap-4">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="w-full overflow-x-auto flex snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {features.map(f => (
          <div
            key={f.title}
            className="shrink-0 snap-center px-4"
            style={{ width: '100%' }}
          >
            <FeatureCard {...f} />
          </div>
        ))}
      </div>
      <CarouselControls
        current={current}
        total={features.length}
        onGoTo={goTo}
      />
    </div>
  )
}
