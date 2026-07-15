export default function CashflowChartSkeleton() {
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-3.5 w-32 rounded bg-[#1a2d3d] animate-pulse" />
          <div className="h-3 w-24 rounded bg-[#1a2d3d] animate-pulse" />
        </div>
        <div className="h-3 w-28 rounded bg-[#1a2d3d] animate-pulse" />
      </div>
      <div className="flex-1 min-h-55 w-full rounded-lg bg-[#1a2d3d] animate-pulse" />
    </div>
  )
}
