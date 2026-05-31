'use client'

import PeriodSelector from './PeriodSelector'
import { Search, Bell, Menu } from 'lucide-react'

export default function TopBar({
  title,
  onMenuToggle,
}: {
  title: string
  onMenuToggle: () => void
}) {
  return (
    <header className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-md shrink-0 z-10">
      {/* Main row */}
      <div className="flex items-center justify-between h-16 px-4 sm:h-20 sm:px-6 lg:px-8 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            aria-label="Toggle sidebar"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu size={20} className="text-[#8b949e]" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Period selector: hidden on mobile (shown in second row), visible sm+ */}
          <div className="hidden sm:block">
            <PeriodSelector />
          </div>

          {/* Search bar: hidden on mobile */}
          <div className="hidden md:flex items-center gap-2 bg-[#111c2a] border border-[#1a2d3d] rounded-lg px-4 w-48 py-2 lg:w-64 focus-within:border-[#00C896]/40 transition-colors">
            <Search size={15} className="text-[#8b949e] shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm text-[#e6edf3] placeholder:text-[#8b949e] w-full"
            />
          </div>

          <button
            aria-label="Notifications"
            className="relative flex items-center justify-center w-10 h-10 border border-white/10 rounded-full hover:bg-white/5 transition-colors"
          >
            <Bell size={18} className="text-[#8b949e]" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#00C896] border border-[#040e1a]" />
          </button>
        </div>
      </div>

      {/* Mobile second row: period selector */}
      <div className="sm:hidden px-4 pb-3">
        <PeriodSelector />
      </div>
    </header>
  )
}
