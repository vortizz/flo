import {
  BarChart2Icon,
  Landmark,
  Lock,
  RefreshCw,
  Smartphone,
  Tag,
} from 'lucide-react'
import ScrollButton from '../ScrollButton'
import FeaturesCarousel from '../carousels/FeaturesCarousel'
import FeatureCard from '../FeatureCard'

const FEATURES = [
  {
    icon: <Landmark size={18} />,
    title: 'Bank connection',
    desc: 'Connect your bank accounts securely using Open Banking. No passwords ever shared — just consent-based access.',
  },
  {
    icon: <RefreshCw size={18} />,
    title: 'Automatic sync',
    desc: 'Transactions are fetched and categorised automatically. Your dashboard stays fresh without you lifting a finger.',
  },
  {
    icon: <BarChart2Icon size={18} />,
    title: 'Cashflow insights',
    desc: 'See income vs expenses over time, track your savings rate, and understand exactly where your money goes each month.',
  },
  {
    icon: <Tag size={18} />,
    title: 'Smart categories',
    desc: 'Transactions are automatically grouped into categories like groceries, dining, utilities, and transport.',
  },
  {
    icon: <Smartphone size={18} />,
    title: 'Works everywhere',
    desc: 'Flo is fully responsive. Access your finances from your phone, tablet, or desktop — wherever you are.',
  },
  {
    icon: <Lock size={18} />,
    title: 'Privacy first',
    desc: 'Your data is yours. We never sell it, never share it, and you can delete everything at any time.',
  },
]

export { FEATURES }

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative h-screen snap-start flex flex-col items-center justify-center bg-[#040e1a] px-0 md:px-8 lg:px-12 pt-20"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="max-w-[1100px] mx-auto w-full px-4 md:px-0">
        <div className="text-xs text-[#00C896] font-semibold tracking-widest uppercase mb-3 text-center">
          Features
        </div>
        <h2 className="text-2xl md:text-[38px] font-bold text-white text-center tracking-[-0.5px] mb-3">
          Everything you need to understand your money
        </h2>
        <p className="text-sm md:text-base text-[#8b949e] text-center max-w-[560px] mx-auto mb-6 md:mb-10 leading-relaxed">
          Flo turns raw bank data into clear, actionable insights — so you spend
          less time wondering and more time deciding.
        </p>
      </div>
      <FeaturesCarousel features={FEATURES} />
      <div className="hidden lg:grid max-w-[1100px] mx-auto w-full grid-cols-3 gap-5 px-0">
        {FEATURES.map(f => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
      <ScrollButton currentSection="features" />
    </section>
  )
}
