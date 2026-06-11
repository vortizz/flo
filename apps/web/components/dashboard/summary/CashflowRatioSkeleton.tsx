export default function CashflowRatioSkeleton() {
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="w-28 h-3 bg-[#1a2d3d] rounded animate-pulse shrink-0" />

      <div className="h-3 rounded-full bg-[#1a2d3d] sm:flex-1 animate-pulse" />

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1a2d3d] animate-pulse inline-block" />
            <span className="w-16 h-3 bg-[#1a2d3d] rounded animate-pulse inline-block" />
          </div>
        ))}
      </div>
    </div>
  )
}
