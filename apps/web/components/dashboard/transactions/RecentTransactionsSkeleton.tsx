export default function RecentTransactionsSkeleton() {
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-40 rounded bg-[#1a2d3d] animate-pulse" />
          <div className="h-3 w-24 rounded bg-[#1a2d3d] animate-pulse" />
        </div>
        <div className="h-3 w-16 rounded bg-[#1a2d3d] animate-pulse" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1a2d3d] animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3.5 w-32 rounded bg-[#1a2d3d] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#1a2d3d] animate-pulse" />
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              <div className="h-3.5 w-16 rounded bg-[#1a2d3d] animate-pulse" />
              <div className="h-3 w-20 rounded bg-[#1a2d3d] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
