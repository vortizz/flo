import ScrollButton from '../ScrollButton'
import DashboardPreview from '../DashboardPreview'

export default function PreviewSection() {
  return (
    <section
      id="preview"
      className="relative h-screen snap-start flex flex-col items-center justify-center bg-[#040e1a] px-4 md:px-8 lg:px-12"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="max-w-[900px] mx-auto w-full flex flex-col items-center gap-5">
        <div className="text-center">
          <div className="text-xs text-[#00C896] font-semibold tracking-widest uppercase mb-3">
            Dashboard
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-[-0.5px] mb-3">
            Your finances at a glance
          </h2>
          <p className="text-sm md:text-base text-[#8b949e] max-w-[500px] mx-auto leading-relaxed">
            Everything you need to understand your money — income, expenses,
            transactions, and spending categories — in one clean view.
          </p>
        </div>
        <DashboardPreview />
      </div>
      <ScrollButton currentSection="preview" />
    </section>
  )
}
