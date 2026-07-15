import { HandCoins } from 'lucide-react'

type CashAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type CashAvatarRounded = 'full' | 'lg' | 'xl' | '2xl'

const SIZE_CONFIG: Record<CashAvatarSize, { container: string; icon: number }> =
  {
    xs: { container: 'w-5 h-5', icon: 10 },
    sm: { container: 'w-8 h-8', icon: 15 },
    md: { container: 'w-8 h-8', icon: 16 },
    lg: { container: 'w-9 h-9', icon: 16 },
    xl: { container: 'w-12 h-12', icon: 20 },
  }

const ROUNDED_CONFIG: Record<CashAvatarRounded, string> = {
  full: 'rounded-full',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
}

export default function CashAvatar({
  size = 'md',
  rounded = 'full',
}: {
  size?: CashAvatarSize
  rounded?: CashAvatarRounded
}) {
  const { container, icon } = SIZE_CONFIG[size]
  return (
    <div
      className={`${container} ${ROUNDED_CONFIG[rounded]} bg-[#00C896]/10 border border-[#00C896]/20 flex items-center justify-center shrink-0`}
    >
      <HandCoins size={icon} className="text-[#00C896]" />
    </div>
  )
}
