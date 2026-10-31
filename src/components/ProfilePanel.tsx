import { useState } from 'react'
import type { FormEvent } from 'react'
import { api, logout, readSession, saveSession } from '../lib/api'
import type { User } from '../types'

type Props = { user: User; onUpdated: () => void }
const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'Não foi possível salvar.'

export default function ProfilePanel({ user, onUpdated }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function profile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true); setError(''); setNotice('')
    try {
      const result = await api<{ usuario: User }>('/auth/me', 'PUT', {
        nome: data.get('nome'), email: data.get('email'), senha_atual: data.get('senha_atual'),
      })
      const session = readSession()
      if (session) saveSession({ ...session, usuario: result.usuario })
      form.reset()
      setNotice('Perfil atualizado.')
      onUpdated()
    } catch (error) { setError(errorMessage(error)) }
    finally { setBusy(false) }
  }

  async function password(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setError(''); setNotice('')
    if (data.get('nova_senha') !== data.get('confirmacao')) {
      setError('A confirmação da nova senha não confere.'); return
    }
    setBusy(true)
    try {
      await api('/auth/me/senha', 'PUT', {
        senha_atual: data.get('senha_atual'), nova_senha: data.get('nova_senha'),
      })
      form.reset()
      logout()
    } catch (error) { setError(errorMessage(error)) }
    finally { setBusy(false) }
  }

  return <section className="card profile">
    <div className="avatar large">{user.nome.slice(0, 1)}</div>
    <h2>{user.nome}</h2>
    <p>{user.perfil} · Usuário #{user.id_usuario}</p>
    {error && <p className="notice error" role="alert">{error}</p>}
    {notice && <p className="notice success" role="status">{notice}</p>}
    <h3>Dados da conta</h3>
    <form onSubmit={profile}>
      <fieldset disabled={busy} className="account-fields">
        <div className="form-grid">
          <label>Nome<input name="nome" defaultValue={user.nome} required maxLength={191} autoComplete="name" /></label>
          <label>E-mail<input name="email" type="email" defaultValue={user.email} required maxLength={191} autoComplete="username" /></label>
          <label className="full">Senha atual para confirmar<input name="senha_atual" type="password" required autoComplete="current-password" /></label>
        </div>
        <div className="actions"><button className="primary">Salvar perfil</button></div>
      </fieldset>
    </form>
    <h3>Alterar senha</h3>
    <p>A nova senha deve ter pelo menos 10 caracteres e até 72 bytes. Após salvar, entre novamente. As sessões anteriores serão encerradas.</p>
    <form onSubmit={password}>
      <fieldset disabled={busy} className="account-fields">
        <div className="form-grid">
          <label className="full">Senha atual<input name="senha_atual" type="password" required autoComplete="current-password" /></label>
          <label>Nova senha<input name="nova_senha" type="password" minLength={10} required autoComplete="new-password" /></label>
          <label>Confirmar nova senha<input name="confirmacao" type="password" minLength={10} required autoComplete="new-password" /></label>
        </div>
        <div className="actions"><button className="primary">Alterar senha e entrar novamente</button></div>
      </fieldset>
    </form>
    <p className="muted">O perfil de acesso é administrado pelo responsável pelo ambiente. Foto e recuperação por e-mail ainda não estão disponíveis.</p>
    <button type="button" disabled={busy} onClick={logout}>Encerrar sessão</button>
  </section>
}
