import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="flex flex-col h-screen items-center justify-center px-6 bg-[#0d0d0f] text-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <h1 className="text-xl font-black tracking-[-0.03em] mb-2">Check your inbox</h1>
      <p className="text-sm text-white/50 leading-relaxed mb-8 max-w-xs">
        We sent a confirmation email. Click the link inside to activate your Dashi account.
      </p>
      <Link href="/login" className="text-sm text-purple-400 font-semibold hover:text-purple-300 transition-colors">
        Back to Sign In
      </Link>
    </div>
  )
}
