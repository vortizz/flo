export default function TransactionsTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-b border-[#1a2d3d]"
          >
            <div className="h-3 w-16 rounded bg-[#1a2d3d] animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1a2d3d] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#1a2d3d] animate-pulse" />
            </div>
            <div className="h-5 w-20 rounded-full bg-[#1a2d3d] animate-pulse" />
            <div className="h-3 w-20 rounded bg-[#1a2d3d] animate-pulse" />
            <div className="h-3 w-16 rounded bg-[#1a2d3d] animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
