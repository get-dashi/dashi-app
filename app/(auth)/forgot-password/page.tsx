import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col h-screen items-center justify-center px-6 bg-[#0d0d0f]">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          <h1 className="text-xl font-black tracking-[-0.04em] mb-1">Reset Password</h1>
          <p className="text-sm text-[#8e8e93]">We&apos;ll email you a reset link.</p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
