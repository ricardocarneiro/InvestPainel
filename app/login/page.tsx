'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase'
import { Building2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
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

  return (
    <div className="min-h-screen grid grid-cols-2 bg-surface">
      {/* Left panel */}
      <div className="relative flex flex-col justify-between p-16 bg-surface-container-low overflow-hidden">
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
      <div className="flex flex-col justify-center px-16 max-w-lg mx-auto w-full">
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
              <button type="button" className="text-label-sm text-secondary hover:text-secondary-container transition-weighted">
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

        <p className="text-label-sm text-on-surface-variant/60 text-center mt-10">
          InvestPainel © 2024 Wealth Management Solution.<br />
          Restricted access — authorized users only.
        </p>
      </div>
    </div>
  )
}
