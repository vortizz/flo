export default function AccountsSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-[#1a2d3d] animate-pulse" />
            <div className="w-8 h-8 rounded-lg bg-[#1a2d3d] animate-pulse" />
          </div>
          <div className="h-8 w-36 rounded bg-[#1a2d3d] animate-pulse mt-1" />
          <div className="h-3 w-28 rounded bg-[#1a2d3d] animate-pulse" />
        </div>
      ))}
    </div>
  )
}
