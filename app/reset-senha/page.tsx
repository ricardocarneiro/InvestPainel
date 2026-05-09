'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase'
import { Building2, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetSenhaPage() {
  const [senha, setSenha] = useState('')
  const [confirma, setConfirma] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createBrowserSupabase()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('Password must be at least 6 characters.')
      return
    }
    if (senha !== confirma) {
      setErro('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setLoading(false)

    if (error) {
      setErro('Could not update password. The link may have expired — request a new one from the login page.')
      return
    }

    setDone(true)
    setTimeout(() => router.push('/login'), 3000)
  }

  const strength = senha.length === 0 ? 0 : senha.length < 6 ? 1 : senha.length < 9 ? 2 : senha.length < 12 ? 3 : 4

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Building2 className="h-4 w-4 text-white" strokeWidth={1.5} />
          </div>
          <span className="text-label-lg text-primary font-semibold uppercase tracking-wider">InvestPainel</span>
        </div>

        <div className="bg-surface-container-lowest rounded shadow-ambient p-8">
          {done ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-7 w-7 text-emerald-600" strokeWidth={1.5} />
              </div>
              <h2 className="text-headline-sm font-semibold text-on-surface mb-3">Password updated</h2>
              <p className="text-body-md text-on-surface-variant">
                Your new password has been set. Redirecting to sign in…
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-headline-sm font-semibold text-on-surface mb-2">Set new password</h2>
                <p className="text-body-md text-on-surface-variant">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      className="h-12 w-full px-4 pr-11 text-body-md text-on-surface bg-surface-container-low rounded border-b border-transparent focus:outline-none focus:bg-surface-container-lowest focus:border-b focus:border-primary placeholder:text-on-surface-variant/40 transition-weighted"
                    />
                    <button type="button" onClick={() => setShowSenha(!showSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-weighted">
                      {showSenha
                        ? <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                        : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-label-sm text-on-surface-variant uppercase tracking-wider">Confirm Password</label>
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={confirma}
                    onChange={(e) => setConfirma(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="h-12 w-full px-4 text-body-md text-on-surface bg-surface-container-low rounded border-b border-transparent focus:outline-none focus:bg-surface-container-lowest focus:border-b focus:border-primary placeholder:text-on-surface-variant/40 transition-weighted"
                  />
                </div>

                {senha.length > 0 && (
                  <div>
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className={`h-0.5 flex-1 rounded-full transition-weighted ${
                          strength >= n
                            ? strength <= 2 ? 'bg-secondary-container' : 'bg-emerald-500'
                            : 'bg-surface-container-high'
                        }`} />
                      ))}
                    </div>
                    <p className="text-label-sm text-on-surface-variant">
                      {['', 'Too short', 'Fair', 'Good', 'Strong'][strength]}
                    </p>
                  </div>
                )}

                {erro && <p className="text-body-sm text-red-600 bg-red-50 px-4 py-3 rounded">{erro}</p>}

                <button type="submit" disabled={loading}
                  className="w-full h-12 bg-primary-container text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-primary transition-weighted disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : (<>Update Password <ArrowRight className="h-4 w-4" /></>)}
                </button>

                <button type="button" onClick={() => router.push('/login')}
                  className="w-full text-label-sm text-on-surface-variant uppercase tracking-wider hover:text-on-surface transition-weighted text-center pt-1">
                  ← Back to sign in
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-label-sm text-on-surface-variant/60 text-center mt-6">
          InvestPainel © 2024 — Restricted access.
        </p>
      </div>
    </div>
  )
}
