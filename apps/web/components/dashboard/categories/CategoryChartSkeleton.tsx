export default function CategoryChartSkeleton() {
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="h-3.5 w-40 rounded bg-[#1a2d3d] animate-pulse" />
        <div className="h-3 w-28 rounded bg-[#1a2d3d] animate-pulse" />
      </div>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-64 h-64 rounded-full bg-[#1a2d3d] animate-pulse shrink-0" />
        <div className="flex flex-col gap-3 w-full">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-3 w-32 rounded bg-[#1a2d3d] animate-pulse" />
              <div className="h-3 w-16 rounded bg-[#1a2d3d] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
