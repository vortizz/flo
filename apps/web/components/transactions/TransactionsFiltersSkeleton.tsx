export default function TransactionsFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full h-9.5 rounded-lg bg-[#0d1f2d] border border-[#1a2d3d] animate-pulse" />
      <div className="flex items-center gap-2 border-b border-white/5 pb-6 pt-2 mb-2 flex-wrap">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9.5 w-32 rounded-lg bg-[#0d1f2d] border border-[#1a2d3d] animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
