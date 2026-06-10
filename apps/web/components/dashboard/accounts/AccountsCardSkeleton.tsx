export default function AccountsCardSkeleton() {
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl flex flex-col overflow-hidden">
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div className="flex flex-col gap-1.5">
          <div className="h-3.5 w-20 rounded bg-[#1a2d3d] animate-pulse" />
          <div className="h-3 w-32 rounded bg-[#1a2d3d] animate-pulse" />
        </div>
        <div className="h-7 w-16 rounded-lg bg-[#1a2d3d] animate-pulse" />
      </div>
      <div className="px-5 flex-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 border-b border-[#1a2d3d] last:border-0"
          >
            <div className="w-9 h-9 rounded-full bg-[#1a2d3d] animate-pulse shrink-0" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 w-28 rounded bg-[#1a2d3d] animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-[#1a2d3d] animate-pulse" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <div className="h-3 w-16 rounded bg-[#1a2d3d] animate-pulse" />
              <div className="h-2.5 w-20 rounded bg-[#1a2d3d] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-[#1a2d3d] flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-[#1a2d3d] animate-pulse" />
        <div className="h-3.5 w-28 rounded bg-[#1a2d3d] animate-pulse" />
      </div>
    </div>
  )
}
