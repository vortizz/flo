export default function SummaryCardSkeleton() {
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-3">
      <div className="h-3.5 w-20 rounded bg-[#1a2d3d] animate-pulse" />
      <div className="h-8 w-40 rounded bg-[#1a2d3d] animate-pulse" />
      <div className="h-3 w-28 rounded bg-[#1a2d3d] animate-pulse" />
    </div>
  )
}
