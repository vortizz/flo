import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CarouselControls({
  current,
  total,
  onGoTo,
}: {
  current: number
  total: number
  onGoTo: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => onGoTo(current - 1)}
        disabled={current === 0}
        className="w-9 h-9 rounded-full border border-[#1a2d3d] flex items-center justify-center text-[#8b949e] hover:text-white hover:border-[#00C896] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={[
              'rounded-full transition-all',
              i === current
                ? 'w-4 h-1.5 bg-[#00C896]'
                : 'w-1.5 h-1.5 bg-[#1a2d3d] hover:bg-[#8b949e]',
            ].join(' ')}
          />
        ))}
      </div>
      <button
        onClick={() => onGoTo(current + 1)}
        disabled={current === total - 1}
        className="w-9 h-9 rounded-full border border-[#1a2d3d] flex items-center justify-center text-[#8b949e] hover:text-white hover:border-[#00C896] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
