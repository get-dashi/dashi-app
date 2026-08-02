import { BottomNav } from './BottomNav'
import { ToastContainer } from '@/components/ui/Toast'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0d0d0f]">
      <div className="flex-1 relative overflow-hidden">
        {children}
      </div>
      <BottomNav />
      <ToastContainer />
    </div>
  )
}
