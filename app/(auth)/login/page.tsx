import { SignInForm } from '@/components/auth/SignInForm'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import Link from 'next/link'

export default function LoginPage() {
  return (
    <div className="flex flex-col h-screen items-center justify-center px-6 bg-[#0d0d0f]">
      <div className="w-full max-w-xs">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-[2rem] font-black tracking-[-0.04em] mb-1">
            Da<span className="gradient-text">shi</span>
          </h1>
          <p className="text-sm text-[#8e8e93]">Discover your city.</p>
        </div>

        <SignInForm />
        <OAuthButtons />

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-white/30 underline hover:text-white/50 transition-colors">
            Continue without account
          </Link>
        </div>
      </div>
    </div>
  )
}
