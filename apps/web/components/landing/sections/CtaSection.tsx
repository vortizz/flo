import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { FloLogo } from '@/components/logo'

export default function CtaSection() {
  return (
    <section
      id="cta"
      className="relative h-screen snap-start flex flex-col items-center justify-center bg-[#040e1a] px-4 md:px-8 lg:px-12"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="max-w-200 mx-auto w-full flex-1 flex items-center justify-center">
        <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-[20px] py-12 md:py-15 px-6 md:px-12 text-center w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-[-0.5px]">
            Start understanding your money today
          </h2>
          <p className="text-sm md:text-base text-[#8b949e] mb-7">
            Free to start, no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/sign-up"
              className="px-7 py-3.5 rounded-[10px] text-[15px] font-semibold bg-[#00C896] text-[#040e1a] no-underline flex items-center justify-center gap-1 hover:bg-[#00b386] transition-colors"
            >
              Get started free <ArrowRight size={18} />
            </Link>
            <Link
              href="/sign-in"
              className="px-7 py-3.5 rounded-[10px] text-[15px] font-semibold bg-transparent border border-[#1a2d3d] text-[#e6edf3] no-underline hover:bg-[#1a2d3d] transition-colors text-center"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
      <footer className="w-full border-t border-[#1a2d3d] py-6 md:py-8 px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 mx-auto">
          <div className="flex items-center gap-2 justify-self-center md:justify-self-start">
            <FloLogo size={28} />
            <span className="text-white font-semibold">Flo</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {['Privacy policy', 'Terms of service', 'Security', 'Contact'].map(
              l => (
                <a
                  key={l}
                  href="#"
                  className="text-xs md:text-sm text-[#8b949e] no-underline hover:text-[#e6edf3] transition-colors"
                >
                  {l}
                </a>
              ),
            )}
          </div>
          <div className="text-xs md:text-sm text-[#8b949e] justify-self-center md:justify-self-end">
            © 2026 Flo. All rights reserved.
          </div>
        </div>
      </footer>
    </section>
  )
}
