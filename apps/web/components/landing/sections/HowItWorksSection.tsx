import ScrollButton from '../ScrollButton'
import HowItWorksCarousel from '../carousels/HowItWorksCarousel'

const STEPS = [
  {
    title: 'Create your account',
    desc: "Sign up in seconds. No credit card required. Just your email and you're in.",
  },
  {
    title: 'Connect your banks',
    desc: 'Link your bank accounts using secure Open Banking consent. Read-only — we can never touch your money.',
  },
  {
    title: 'Get clarity',
    desc: 'Your dashboard instantly shows your cashflow, spending categories, and financial trends.',
  },
]

export { STEPS }

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative h-screen snap-start flex flex-col items-center justify-center bg-[#040e1a] px-0 md:px-8 lg:px-12 pt-20"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="max-w-[900px] mx-auto w-full px-4 md:px-0">
        <div className="text-xs text-[#00C896] font-semibold tracking-widest uppercase mb-3 text-center">
          How it works
        </div>
        <h2 className="text-2xl md:text-[38px] font-bold text-white text-center tracking-[-0.5px] mb-3">
          Up and running in under 5 minutes
        </h2>
        <p className="text-sm md:text-base text-[#8b949e] text-center max-w-[560px] mx-auto mb-6 md:mb-12 leading-relaxed">
          No spreadsheets, no manual entry. Just connect your accounts and Flo
          handles the rest.
        </p>
      </div>
      <HowItWorksCarousel steps={STEPS} />
      <div className="hidden md:grid max-w-[900px] mx-auto w-full grid-cols-3 gap-6 relative px-8 lg:px-0">
        <div className="absolute top-7 left-[16.6%] right-[16.6%] h-px bg-[#1a2d3d] z-0" />
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center gap-4 relative z-10"
          >
            <div className="w-14 h-14 rounded-full bg-[#0d1f2d] border-2 border-[#00C896] flex items-center justify-center text-xl font-bold text-[#00C896]">
              {i + 1}
            </div>
            <div className="text-base font-semibold text-white">{s.title}</div>
            <div className="text-sm text-[#8b949e] leading-relaxed">
              {s.desc}
            </div>
          </div>
        ))}
      </div>
      <ScrollButton currentSection="how-it-works" />
    </section>
  )
}
