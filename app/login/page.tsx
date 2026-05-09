'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase'
import { Building2, ArrowRight, CheckCircle } from 'lucide-react'

type Mode = 'login' | 'forgot' | 'sent'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const router = useRouter()
  const supabase = createBrowserSupabase()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/painel/clientes')
    router.refresh()
  }

  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-senha`,
    })

    setLoading(false)
    if (error) {
      setErro('Could not send reset email. Check the address and try again.')
      return
    }
    setMode('sent')
  }

  return (
    <div className="min-h-screen grid grid-cols-1 sm:grid-cols-2 bg-surface">
      {/* Left panel */}
      <div className="relative hidden sm:flex flex-col justify-between p-16 bg-surface-container-low overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary-container/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-label-lg text-primary font-semibold uppercase tracking-wider">InvestPainel</span>
          </div>

          <h1 className="text-display-lg font-bold text-on-surface leading-[1.05] mb-6">
            The Sovereign<br />
            <span className="text-primary">Architect</span> of<br />
            Private Wealth.
          </h1>

          <div className="w-10 h-0.5 bg-secondary-container mb-16" />
        </div>

        <div className="relative z-10">
          <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-6">Institutional Integrity</p>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-headline-md font-bold text-on-surface">0.02%</p>
              <p className="text-body-sm text-on-surface-variant mt-1">Standard Tracking Error</p>
            </div>
            <div>
              <p className="text-headline-md font-bold text-on-surface">Global</p>
              <p className="text-body-sm text-on-surface-variant mt-1">Multi-Asset Custody</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-col justify-center px-6 sm:px-16 py-12 max-w-lg mx-auto w-full">
        {/* Mobile logo */}
        <div className="flex items-center gap-3 mb-10 sm:hidden">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-label-lg text-primary font-semibold uppercase tracking-wider">InvestPainel</span>
        </div>

        {/* LOGIN */}
        {mode === 'login' && (
          <>
            <div className="mb-10">
              <h2 className="text-headline-sm font-semibold text-on-surface mb-2">Welcome</h2>
              <p className="text-body-md text-on-surface-variant">Access your wealth governance platform.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Corporate Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@investpainel.com"
                  required
                  className="h-12 w-full px-4 text-body-md text-on-surface bg-surface-container-low rounded border-b border-transparent focus:outline-none focus:bg-surface-container-lowest focus:border-b focus:border-primary placeholder:text-on-surface-variant/40 transition-weighted"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => { setErro(''); setMode('forgot') }}
                    className="text-label-sm text-secondary hover:text-secondary-container transition-weighted">
                    Forgot password?
                  </button>
                </div>
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 w-full px-4 text-body-md text-on-surface bg-surface-container-low rounded border-b border-transparent focus:outline-none focus:bg-surface-container-lowest focus:border-b focus:border-primary placeholder:text-on-surface-variant/40 transition-weighted"
                />
              </div>

              {erro && <p className="text-body-sm text-red-600 bg-red-50 px-4 py-3 rounded">{erro}</p>}

              <button type="submit" disabled={loading}
                className="w-full h-12 mt-2 bg-primary-container text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-primary transition-weighted disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : (<>Access Platform <ArrowRight className="h-4 w-4" /></>)}
              </button>
            </form>
          </>
        )}

        {/* FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <>
            <div className="mb-10">
              <h2 className="text-headline-sm font-semibold text-on-surface mb-2">Reset Password</h2>
              <p className="text-body-md text-on-surface-variant">
                Enter your email and we'll send a secure link to reset your password.
              </p>
            </div>

            <form onSubmit={handleForgot} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Corporate Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@investpainel.com"
                  required
                  className="h-12 w-full px-4 text-body-md text-on-surface bg-surface-container-low rounded border-b border-transparent focus:outline-none focus:bg-surface-container-lowest focus:border-b focus:border-primary placeholder:text-on-surface-variant/40 transition-weighted"
                />
              </div>

              {erro && <p className="text-body-sm text-red-600 bg-red-50 px-4 py-3 rounded">{erro}</p>}

              <button type="submit" disabled={loading}
                className="w-full h-12 bg-primary-container text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-primary transition-weighted disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : (<>Send Reset Link <ArrowRight className="h-4 w-4" /></>)}
              </button>

              <button type="button" onClick={() => { setErro(''); setMode('login') }}
                className="w-full text-label-sm text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-weighted text-center pt-1">
                ← Back to sign in
              </button>
            </form>
          </>
        )}

        {/* EMAIL SENT */}
        {mode === 'sent' && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-7 w-7 text-emerald-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-headline-sm font-semibold text-on-surface mb-3">Check your inbox</h2>
            <p className="text-body-md text-on-surface-variant mb-2">
              A password reset link was sent to:
            </p>
            <p className="text-body-md font-semibold text-primary mb-8">{email}</p>
            <p className="text-body-sm text-on-surface-variant mb-8">
              Click the link in the email to set a new password. The link expires in 1 hour.
            </p>
            <button onClick={() => { setErro(''); setMode('login') }}
              className="text-label-sm text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-weighted">
              ← Back to sign in
            </button>
          </div>
        )}

        <p className="text-label-sm text-on-surface-variant/60 text-center mt-10">
          InvestPainel © 2024 Wealth Management Solution.<br />
          Restricted access — authorized users only.
        </p>
      </div>
    </div>
  )
}
