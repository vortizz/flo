import { Ban, CircleCheck, Eye, Lock, Shield, Trash } from 'lucide-react'
import ScrollButton from '../ScrollButton'
import SecurityBadgesCarousel from '../carousels/SecurityBadgesCarousel'

const SECURITY_ITEMS = [
  {
    icon: <Lock size={16} />,
    title: 'Read-only access',
    desc: 'Flo can only view your transactions. We are technically unable to move money or change your account settings.',
  },
  {
    icon: <Shield size={16} />,
    title: '256-bit AES encryption',
    desc: 'All data is encrypted at rest and in transit. Your banking credentials are never stored on our servers.',
  },
  {
    icon: <Eye size={16} />,
    title: 'Zero credential storage',
    desc: 'We use Open Banking consent flows — your username and password never touch our systems.',
  },
]

const SECURITY_BADGES = [
  {
    icon: <CircleCheck size={16} />,
    title: 'Open Banking compliant',
    sub: 'Consent-based access via regulated API',
  },
  {
    icon: <Shield size={16} />,
    title: '256-bit AES encryption',
    sub: 'Industry-standard data protection',
  },
  {
    icon: <Ban size={16} />,
    title: 'Zero credential storage',
    sub: 'We never see your banking passwords',
  },
  {
    icon: <Trash size={16} />,
    title: 'Right to deletion',
    sub: 'Delete all your data at any time',
  },
]

export { SECURITY_BADGES }

export default function SecuritySection() {
  return (
    <section
      id="security"
      className="relative h-screen snap-start flex flex-col items-center justify-center bg-[#040e1a] px-4 md:px-8 lg:px-12"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="max-w-[1100px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center">
          <div className="flex flex-col gap-5">
            <div className="text-xs text-[#00C896] font-semibold tracking-widest uppercase">
              Security
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-white tracking-[-0.5px] leading-tight">
              Your security is our top priority
            </h2>
            <p className="text-sm md:text-base text-[#8b949e] leading-relaxed">
              Flo is built on the same infrastructure used by leading financial
              institutions. We take security seriously at every layer.
            </p>
            {SECURITY_ITEMS.map(item => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="size-8 md:size-10 bg-[#00C89615] border border-[#00C89630] rounded-[10px] flex items-center justify-center text-[#00C896] shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="text-sm md:text-[15px] font-semibold text-white mb-1">
                    {item.title}
                  </div>
                  <div className="text-xs md:text-[13px] text-[#8b949e] leading-normal">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-2xl p-4 md:p-8 flex flex-col gap-3">
            <div className="text-[13px] font-semibold text-[#8b949e] mb-1">
              Security certifications
            </div>
            <div className="lg:hidden">
              <SecurityBadgesCarousel badges={SECURITY_BADGES} />
            </div>
            <div className="hidden lg:flex flex-col gap-3">
              {SECURITY_BADGES.map(b => (
                <div
                  key={b.title}
                  className="flex items-center gap-3 p-3 md:p-4 bg-[#071828] border border-[#1a2d3d] rounded-[10px]"
                >
                  <div className="w-9 h-9 bg-[#00C89615] rounded-lg flex items-center justify-center text-[#00C896] shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white">
                      {b.title}
                    </div>
                    <div className="text-[11px] text-[#8b949e]">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ScrollButton currentSection="security" />
    </section>
  )
}
