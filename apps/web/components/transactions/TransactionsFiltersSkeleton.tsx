export default function TransactionsFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-32 rounded-full bg-[#0d1f2d] border border-[#1a2d3d] animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
