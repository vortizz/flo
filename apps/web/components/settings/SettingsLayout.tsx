'use client'

import { useEffect, useRef, useState } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { User, LogOut, Menu, X } from 'lucide-react'

const NAV_ITEMS = [{ id: 'profile', label: 'Profile', icon: User }]

function NavContent({
  activeSection,
  onNavigate,
  onSignOut,
}: {
  activeSection: string
  onNavigate: (id: string) => void
  onSignOut: () => void
}) {
  return (
    <>
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={[
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left w-full',
            activeSection === id
              ? 'bg-[#1e293b] text-white border border-[#1a2d3d]'
              : 'text-[#8b949e] hover:text-white hover:bg-[#ffffff08]',
          ].join(' ')}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}

      <div className="mt-2 pt-2 border-t border-[#1a2d3d]">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all text-left"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </>
  )
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { signOut } = useClerk()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('profile')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { threshold: 0.3 },
    )
    const sections = document.querySelectorAll('[data-section]')
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileMenuOpen(false)
  }

  async function handleSignOut() {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-full">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl px-4 py-3">
        <span className="text-sm font-medium text-white">
          {NAV_ITEMS.find(i => i.id === activeSection)?.label ?? 'Settings'}
        </span>
        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="text-[#8b949e] hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-2 flex flex-col gap-1">
          <NavContent
            activeSection={activeSection}
            onNavigate={scrollToSection}
            onSignOut={handleSignOut}
          />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block w-52 shrink-0">
        <div className="sticky top-0 flex flex-col gap-1">
          <NavContent
            activeSection={activeSection}
            onNavigate={scrollToSection}
            onSignOut={handleSignOut}
          />
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 flex flex-col gap-8 min-w-0">
        {children}
      </div>
    </div>
  )
}
