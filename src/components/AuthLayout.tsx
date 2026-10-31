import type { ReactNode } from 'react'

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-brand">
          <span className="auth-brand-mark">
            <img
              src="/bbts-logo.png"
              alt=""
              width="27"
              height="37"
            />
          </span>

          <span>
            BB Tecnologia{' '}
            <span className="brand-line">e Serviços</span>
          </span>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="login-page auth-main"
      >
        <section
          className="auth-hero"
          aria-labelledby="auth-heading"
        >
          <div className="auth-planet" aria-hidden="true" />

          <div
            className="auth-hero-content"
            id="sobre-plataforma"
          >
            <span className="auth-kicker">
              Pesquisa, desenvolvimento e inovação
            </span>

            <h1 id="auth-heading">
              Ideias que
              <br /> transformam.
              <br />{' '}
              <span>
                Evidências que
                <br /> conectam.
              </span>
            </h1>

            <p>
              Da pesquisa ao resultado: acompanhe projetos,
              experimentos e recursos em uma plataforma integrada.
            </p>

            <div className="auth-pills">
              <span>P&amp;D</span>
              <span>Lei do Bem</span>
              <span>Gestão de projetos</span>
            </div>

            <div className="auth-hero-signature">
              <span className="auth-signature-line" />
              Tecnologia a serviço da inovação.
            </div>
          </div>
        </section>

        <div className="auth-form-shell">
          {children}
        </div>
      </main>
    </div>
  )
}