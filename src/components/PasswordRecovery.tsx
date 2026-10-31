import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../lib/api'
import AuthLayout from './AuthLayout'

const message = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível concluir. Tente novamente.'

export function RecoveryRequest() {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true); setNotice(''); setError('')
    try {
      const result = await api<{ message: string }>('/auth/recuperar-senha', 'POST', {
        email: String(data.get('email') || '').trim().toLowerCase(),
      }, false)
      setNotice(result.message)
    } catch (error) { setError(message(error)) }
    finally { setBusy(false) }
  }
  return <details className="recovery-request">
    <summary>Esqueci minha senha</summary>
    <p>Informe o e-mail da sua conta para receber um link de redefinição.</p>
    <form onSubmit={submit}>
      <label>E-mail de recuperação<input name="email" type="email" required maxLength={191} autoComplete="email" /></label>
      {notice && <p className="notice success" role="status">{notice}</p>}
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Solicitando…' : 'Enviar link de recuperação'}</button>
    </form>
  </details>
}

export function ResetPassword({ token, onComplete }: { token: string; onComplete: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    // O token fica somente na memória da tela, fora do histórico visível.
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nova_senha = String(data.get('nova_senha') || '')
    setError('')
    if (nova_senha !== data.get('confirmacao')) { setError('A confirmação da senha não confere.'); return }
    setBusy(true)
    try {
      await api('/auth/redefinir-senha', 'POST', { token, nova_senha }, false)
      setDone(true)
    } catch (error) { setError(message(error)) }
    finally { setBusy(false) }
  }
  return <AuthLayout>
    <section className="login-card"><span className="eyebrow">Segurança da conta</span><h2>Redefinir senha</h2>
      {done ? <><p className="notice success" role="status">Senha redefinida. Entre com sua nova senha.</p><button className="primary" onClick={onComplete}>Voltar para entrar</button></>
        : <><p>Use pelo menos 10 caracteres. O link vale por 15 minutos e pode ser usado uma única vez.</p>
          <form onSubmit={submit}>
            <label>Nova senha<input name="nova_senha" type="password" required minLength={10} autoComplete="new-password" disabled={busy} /></label>
            <label>Confirmar nova senha<input name="confirmacao" type="password" required minLength={10} autoComplete="new-password" disabled={busy} /></label>
            {error && <p className="notice error" role="alert">{error}</p>}
            <button className="primary" disabled={busy}>{busy ? 'Redefinindo…' : 'Salvar nova senha'}</button>
            <button type="button" disabled={busy} onClick={onComplete}>Voltar ao login</button>
          </form></>}
    </section>
  </AuthLayout>
}
