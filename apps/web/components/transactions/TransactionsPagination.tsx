import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TransactionsPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function TransactionsPagination({
  page,
  totalPages,
  onPageChange,
}: TransactionsPaginationProps) {
  const pages: (number | '...')[] = []

  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    ) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-[#94a3b8] hover:not-disabled:text-white hover:not-disabled:bg-[#1a2d3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`dots-${i}`}
            className="w-7 h-7 flex items-center justify-center text-xs text-[#8b949e]"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={[
              'w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-sm font-medium transition-colors',
              page === p
                ? 'bg-[#14b8a633] text-[#2dd4bf]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#1a2d3d]',
            ].join(' ')}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-[#94a3b8] hover:not-disabled:text-white hover:not-disabled:bg-[#1a2d3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
