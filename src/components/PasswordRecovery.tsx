import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'
import AuthLayout from './AuthLayout'
import '../recovery.css'

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Não foi possível concluir. Tente novamente.'

export function RecoveryRequest() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] =
    useState<'password' | 'login'>('password')
  const [busy, setBusy] = useState(false)
  const [email, setEmail] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const screen = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const root = document.getElementById('root')
    const wasInert = root?.inert ?? false
    const overflow = document.body.style.overflow

    if (root) root.inert = true

    document.body.style.overflow = 'hidden'
    screen.current?.focus()

    function keyboard(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      }

      if (event.key !== 'Tab') return

      const controls = Array.from(
        screen.current?.querySelectorAll<HTMLElement>(
          'button, input, a[href]',
        ) ?? [],
      ).filter(
        item =>
          !item.matches(':disabled') &&
          !item.closest('[hidden]'),
      )

      const first = controls[0]
      const last = controls[controls.length - 1]

      if (!first) {
        event.preventDefault()
        screen.current?.focus()
        return
      }

      if (
        event.shiftKey &&
        (
          document.activeElement === first ||
          document.activeElement === screen.current
        )
      ) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (
          document.activeElement === last ||
          document.activeElement === screen.current
        )
      ) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', keyboard)

    return () => {
      document.removeEventListener('keydown', keyboard)
      document.body.style.overflow = overflow

      if (root) root.inert = wasInert
      if (previous?.isConnected) previous.focus()
    }
  }, [open])

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (busy) return

    setBusy(true)
    setNotice('')
    setError('')

    try {
      const result = await api<{ message: string }>(
        '/auth/recuperar-senha',
        'POST',
        {
          email: email.trim().toLowerCase(),
        },
        false,
      )

      setNotice(result.message)
    } catch (error) {
      setError(message(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="recovery-link"
        onClick={() => setOpen(true)}
      >
        Esqueci minha senha ou meu login
      </button>

      {open && createPortal(
        <div
          className="recovery-screen"
          ref={screen}
          role="dialog"
          aria-modal="true"
          aria-labelledby="recovery-title"
          tabIndex={-1}
        >
          <header className="recovery-top">
            <span className="recovery-brand">
              SGA · LEI DO BEM
            </span>

            <button
              type="button"
              onClick={() => setOpen(false)}
            >
              Voltar ao login
            </button>
          </header>

          <div className="recovery-layout">
            <aside className="recovery-intro">
              <span className="eyebrow">
                Recuperação de acesso
              </span>

              <h2>Vamos ajudar você a voltar.</h2>

              <p>
                Escolha a opção que corresponde à sua
                dificuldade.
              </p>

              <ol>
                <li>
                  Identifique o e-mail usado no cadastro.
                </li>
                <li>
                  Solicite um link de redefinição.
                </li>
                <li>
                  Crie uma nova senha e entre novamente.
                </li>
              </ol>

              <small>
                O remetente da plataforma e o e-mail da
                sua conta podem ser diferentes.
              </small>
            </aside>

            <section className="recovery-card">
              <div
                className="recovery-symbol"
                aria-hidden="true"
              >
                ↗
              </div>

              <h1 id="recovery-title">
                Recuperar acesso
              </h1>

              <p>
                Seu login é o e-mail cadastrado no sistema.
              </p>

              <div
                className="recovery-tabs"
                role="group"
                aria-label="Tipo de ajuda"
              >
                <button
                  type="button"
                  aria-pressed={mode === 'password'}
                  onClick={() => setMode('password')}
                >
                  Esqueci a senha
                </button>

                <button
                  type="button"
                  aria-pressed={mode === 'login'}
                  onClick={() => setMode('login')}
                >
                  Esqueci o e-mail
                </button>
              </div>

              {mode === 'login' ? (
                <div className="recovery-help">
                  <h2>Não lembra seu e-mail?</h2>

                  <p>
                    Confira o endereço usado para entrar
                    anteriormente ou os avisos que recebeu
                    da plataforma.
                  </p>

                  <p>
                    Se continuar sem identificar a conta,
                    peça ao administrador do ambiente para
                    conferir seu cadastro e validar sua
                    identidade.
                  </p>

                  <p>
                    O sistema não revela e-mails cadastrados
                    a partir do nome de uma pessoa.
                  </p>

                  <button
                    type="button"
                    className="primary"
                    onClick={() => setMode('password')}
                  >
                    Já sei meu e-mail
                  </button>
                </div>
              ) : (
                <>
                  <form
                    onSubmit={submit}
                    aria-busy={busy}
                  >
                    <label>
                      E-mail de recuperação

                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={191}
                        autoComplete="email"
                        placeholder="Seu e-mail cadastrado"
                        value={email}
                        onChange={event =>
                          setEmail(event.target.value)
                        }
                        disabled={busy}
                      />
                    </label>

                    {notice && (
                      <div
                        className="recovery-feedback success"
                        role="status"
                      >
                        <strong>
                          Solicitação recebida
                        </strong>

                        <p>{notice}</p>

                        <small>
                          Isso não confirma que a conta
                          existe ou que o e-mail foi entregue.
                        </small>
                      </div>
                    )}

                    {error && (
                      <p
                        className="recovery-feedback error"
                        role="alert"
                      >
                        {error}
                      </p>
                    )}

                    <button
                      className="primary recovery-submit"
                      disabled={busy}
                    >
                      {busy
                        ? 'Solicitando link…'
                        : notice
                          ? 'Solicitar outro link'
                          : 'Enviar link de recuperação'}
                    </button>
                  </form>

                  <details className="recovery-troubleshoot">
                    <summary>
                      O e-mail não chegou?
                    </summary>

                    <ul>
                      <li>
                        Confira a caixa de spam e o lixo
                        eletrônico.
                      </li>
                      <li>
                        Verifique se digitou o endereço
                        cadastrado na conta.
                      </li>
                      <li>
                        Ter um remetente verificado no
                        serviço de e-mail não cria uma
                        conta na plataforma.
                      </li>
                      <li>
                        Se persistir, peça ao administrador
                        para conferir os registros de envio.
                      </li>
                    </ul>
                  </details>

                  <p className="recovery-footnote">
                    O link de redefinição vale por 15
                    minutos. Não compartilhe o link nem
                    sua senha.
                  </p>
                </>
              )}
            </section>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export function ResetPassword({
  token,
  onComplete,
}: {
  token: string
  onComplete: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    )
  }, [])

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (busy) return

    const data = new FormData(event.currentTarget)
    const nova_senha = String(
      data.get('nova_senha') || '',
    )

    setError('')

    if (nova_senha !== data.get('confirmacao')) {
      setError('A confirmação da senha não confere.')
      return
    }

    if (
      nova_senha.length < 10 ||
      new TextEncoder().encode(nova_senha).length > 72
    ) {
      setError(
        'Use pelo menos 10 caracteres e até 72 bytes.',
      )
      return
    }

    setBusy(true)

    try {
      await api(
        '/auth/redefinir-senha',
        'POST',
        { token, nova_senha },
        false,
      )

      setDone(true)
    } catch (error) {
      setError(message(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
      <section className="login-card recovery-reset">
        <span className="eyebrow">
          Segurança da conta
        </span>

        <h2>Crie sua nova senha</h2>

        {done ? (
          <>
            <p
              className="recovery-feedback success"
              role="status"
            >
              Senha redefinida. Entre com sua nova senha.
            </p>

            <button
              type="button"
              className="primary"
              onClick={onComplete}
            >
              Voltar para entrar
            </button>
          </>
        ) : (
          <>
            <p>
              Escolha uma senha com pelo menos 10
              caracteres. O link vale por 15 minutos
              e pode ser usado uma única vez.
            </p>

            <form
              onSubmit={submit}
              aria-busy={busy}
            >
              <label>
                Nova senha

                <input
                  name="nova_senha"
                  type={visible ? 'text' : 'password'}
                  required
                  minLength={10}
                  autoComplete="new-password"
                  disabled={busy}
                />
              </label>

              <label>
                Confirmar nova senha

                <input
                  name="confirmacao"
                  type={visible ? 'text' : 'password'}
                  required
                  minLength={10}
                  autoComplete="new-password"
                  disabled={busy}
                />
              </label>

              <button
                type="button"
                className="recovery-visibility"
                aria-pressed={visible}
                onClick={() =>
                  setVisible(value => !value)
                }
              >
                {visible
                  ? 'Ocultar senhas'
                  : 'Mostrar senhas'}
              </button>

              {error && (
                <p
                  className="recovery-feedback error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <button
                className="primary"
                disabled={busy}
              >
                {busy
                  ? 'Redefinindo…'
                  : 'Salvar nova senha'}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={onComplete}
              >
                Voltar ao login
              </button>
            </form>
          </>
        )}
      </section>
    </AuthLayout>
  )
}