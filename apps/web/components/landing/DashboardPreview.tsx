export default function DashboardPreview() {
  return (
    <div className="w-full max-w-195">
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-[14px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a2d3d] flex items-center justify-between">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
          </div>
          <div className="text-sm text-[#8b949e]">Flo — Overview</div>
          <div className="w-14" />
        </div>
        <div className="p-4 md:p-5 flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                label: 'Income',
                val: '$8,450',
                color: 'text-[#00C896]',
                sub: '↑ 8.3% vs last month',
                subColor: 'text-[#00C896]',
              },
              {
                label: 'Expenses',
                val: '$5,210',
                color: 'text-[#ef4444]',
                sub: 'vs $4,957 last month',
                subColor: 'text-[#8b949e]',
              },
              {
                label: 'Net savings',
                val: '$3,240',
                color: 'text-white',
                sub: '↑ 13.9% vs last month',
                subColor: 'text-[#00C896]',
              },
            ].map(c => (
              <div
                key={c.label}
                className="bg-[#071828] border border-[#1a2d3d] rounded-[10px] p-2.5 md:p-3.5 text-left"
              >
                <div className="text-xs text-[#8b949e] mb-1">{c.label}</div>
                <div className={`text-sm md:text-lg font-bold ${c.color}`}>
                  {c.val}
                </div>
                <div className={`text-xs mt-0.5 hidden md:block ${c.subColor}`}>
                  {c.sub}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-left">
            <div className="bg-[#071828] border border-[#1a2d3d] rounded-[10px] p-3 md:p-3.5">
              <div className="text-xs md:text-sm font-semibold text-white mb-2">
                Recent Transactions
              </div>
              {[
                {
                  name: 'Woolworths',
                  amt: '-$142.50',
                  color: 'text-[#ef4444]',
                },
                {
                  name: 'Acme Corp — Salary',
                  amt: '+$3,450.00',
                  color: 'text-[#00C896]',
                },
                {
                  name: 'AGL Energy',
                  amt: '-$215.00',
                  color: 'text-[#ef4444]',
                },
                {
                  name: 'Industry Beans',
                  amt: '-$18.50',
                  color: 'text-[#ef4444]',
                },
              ].map(t => (
                <div
                  key={t.name}
                  className="flex justify-between py-1.5 border-b border-[#0d1f2d]"
                >
                  <span className="text-xs text-[#8b949e] truncate mr-2">
                    {t.name}
                  </span>
                  <span className={`text-xs font-semibold shrink-0 ${t.color}`}>
                    {t.amt}
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-[#071828] border border-[#1a2d3d] rounded-[10px] p-3 md:p-3.5">
              <div className="text-xs md:text-sm font-semibold text-white mb-2">
                Spending by Category
              </div>
              {[
                { name: 'Housing', amt: '$2,400' },
                { name: 'Food & Dining', amt: '$850' },
                { name: 'Transport', amt: '$420' },
                { name: 'Entertainment', amt: '$310' },
              ].map(t => (
                <div
                  key={t.name}
                  className="flex justify-between py-1.5 border-b border-[#0d1f2d]"
                >
                  <span className="text-xs text-[#8b949e]">{t.name}</span>
                  <span className="text-xs font-semibold text-white">
                    {t.amt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
