import SettingsNav from '@/components/settings/SettingsNav'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-full">
      <SettingsNav />
      <div className="flex-1 flex flex-col gap-8 min-w-0">{children}</div>
    </div>
  )
}
