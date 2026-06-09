'use client'

import Link from 'next/link'
import { ArrowRight, Database, Eye, RefreshCw, Shield } from 'lucide-react'
import ScrollButton from '../ScrollButton'

const HERO_BADGES = [
  {
    name: '256-bit Encryption',
    icon: <Shield size={14} className="text-[#00C896]" />,
  },
  {
    name: 'Read-only access',
    icon: <Eye size={14} className="text-[#00C896]" />,
  },
  {
    name: 'Real-time Sync',
    icon: <RefreshCw size={14} className="text-[#00C896]" />,
  },
  {
    name: '0 Credentials Stored',
    icon: <Database size={14} className="text-[#00C896]" />,
  },
]

interface HeroSectionProps {
  onScrollToSection: (id: string) => void
}

export default function HeroSection({ onScrollToSection }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative h-screen snap-start flex flex-col items-center justify-center bg-[#040e1a] px-4 md:px-8 lg:px-12"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="max-w-225 mx-auto text-center flex flex-col items-center gap-5 md:gap-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-[#14b8a64d] bg-[#0f172a99] text-[#5eead4]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
          Open Banking · Read-only
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight text-[#e6edf3]">
          Take control of your{' '}
          <span className="text-[#00C896]">financial life</span>
        </h1>
        <p className="text-base md:text-lg max-w-2xl text-[#8b949e] leading-relaxed">
          Flo connects to your bank accounts via Open Banking and gives you a
          real-time view of your spending, income, savings, and trends — all in
          one beautiful dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/sign-up"
            className="px-6 py-3.5 rounded-[10px] text-[15px] font-semibold bg-[#00C896] text-[#040e1a] no-underline flex items-center justify-center gap-1 hover:bg-[#00b386] transition-colors"
          >
            Get started free <ArrowRight size={18} />
          </Link>
          <a
            href="#how-it-works"
            onClick={e => {
              e.preventDefault()
              onScrollToSection('how-it-works')
            }}
            className="px-6 py-3.5 rounded-[10px] text-[15px] font-semibold bg-transparent border border-[#1a2d3d] text-[#e6edf3] no-underline hover:bg-[#1a2d3d] transition-colors text-center"
          >
            See how it works
          </a>
        </div>
        <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
          {HERO_BADGES.map(t => (
            <div
              key={t.name}
              className="flex items-center gap-1.5 text-xs text-[#8b949e]"
            >
              {t.icon} {t.name}
            </div>
          ))}
        </div>
      </div>
      <ScrollButton currentSection="hero" />
    </section>
  )
}
