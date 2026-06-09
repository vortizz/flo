export default function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-[14px] p-4 md:p-7 relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00C896] to-[rgba(0,200,150,0.05)]" />
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 md:w-11 md:h-11 bg-[#00C89615] border border-[#00C89630] rounded-xl flex items-center justify-center mb-3 md:mb-4 text-[#00C896]">
          {icon}
        </div>
        <div className="text-sm md:text-base font-semibold text-white mb-1.5 md:mb-2">
          {title}
        </div>
      </div>
      <div className="text-xs md:text-sm text-[#8b949e] leading-relaxed">
        {desc}
      </div>
    </div>
  )
}
