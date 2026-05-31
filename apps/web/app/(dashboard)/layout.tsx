import DashboardLayout from '@/components/dashboard/layout/DashboardLayout'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayout>{children}</DashboardLayout>
}
