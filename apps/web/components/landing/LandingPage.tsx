'use client'

import { useRef, useState, useEffect } from 'react'
import { FloLogo } from '@/components/logo'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import HeroSection from './sections/HeroSection'
import PreviewSection from './sections/PreviewSection'
import FeaturesSection from './sections/FeaturesSection'
import HowItWorksSection from './sections/HowItWorksSection'
import SecuritySection from './sections/SecuritySection'
import CtaSection from './sections/CtaSection'

const SECTIONS = [
  'hero',
  'preview',
  'features',
  'how-it-works',
  'security',
  'cta',
]

const SECTION_LABELS = [
  { id: 'hero', label: 'Home' },
  { id: 'preview', label: 'Overview' },
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'security', label: 'Security' },
  { id: 'cta', label: 'Get started' },
]

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeSection, setActiveSection] = useState('hero')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { root: container, threshold: 0.5 },
    )
    SECTIONS.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 lg:px-12 py-4 border-b border-[#1a2d3d] bg-[#040e1a]/95 backdrop-blur-sm">
        <div className="grid grid-cols-2 lg:grid-cols-3 items-center">
          <div className="flex items-center gap-2 justify-self-start">
            <FloLogo size={32} />
            <span className="text-white font-semibold text-lg">Flo</span>
          </div>
          <div className="hidden lg:flex items-center gap-1 justify-self-center">
            {SECTION_LABELS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all text-nowrap',
                  activeSection === id
                    ? 'bg-[#1e293b] text-white border border-[#2a3d4d]'
                    : 'text-[#8b949e] hover:text-white',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3 justify-self-end">
            <Link
              href="/sign-in"
              className="px-4 py-2 border border-[#1a2d3d] rounded-lg bg-transparent text-[#e6edf3] text-sm no-underline hover:bg-[#1a2d3d] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 rounded-lg bg-[#00C896] text-[#040e1a] text-sm font-semibold no-underline hover:bg-[#00b386] transition-colors"
            >
              Get started
            </Link>
          </div>
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="lg:hidden text-[#8b949e] hover:text-white transition-all justify-self-end"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="mt-3 bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-3 flex flex-col gap-1">
            {SECTION_LABELS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={[
                  'w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  activeSection === id
                    ? 'bg-[#1e293b] text-white'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#ffffff08]',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
            <div className="border-t border-[#1a2d3d] mt-1 pt-2 flex flex-col gap-1">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-3 py-2.5 rounded-lg text-sm text-[#8b949e] border border-[#1a2d3d] no-underline hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-3 py-2.5 rounded-lg text-sm font-semibold bg-[#00C896] text-[#040e1a] no-underline hover:bg-[#00b386] transition-colors"
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </nav>

      <HeroSection onScrollToSection={scrollToSection} />
      <PreviewSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <CtaSection />
    </div>
  )
}
