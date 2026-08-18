import { V2AppShell } from '@/components/v2/AppShell'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <V2AppShell>{children}</V2AppShell>
}
