export default function AccountsTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 w-fit">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-8 w-24 rounded-md bg-[#0d1f2d] border border-[#1a2d3d] animate-pulse"
          />
        ))}
      </div>
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-[#1a2d3d] items-center"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#1a2d3d] animate-pulse" />
              <div className="h-3 w-20 rounded bg-[#1a2d3d] animate-pulse" />
            </div>
            <div className="h-3 w-24 rounded bg-[#1a2d3d] animate-pulse" />
            <div className="h-3 w-12 rounded bg-[#1a2d3d] animate-pulse" />
            <div className="h-3 w-16 rounded bg-[#1a2d3d] animate-pulse" />
            <div className="h-3 w-12 rounded bg-[#1a2d3d] animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-[#1a2d3d] animate-pulse" />
            <div className="h-3 w-8 rounded bg-[#1a2d3d] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
