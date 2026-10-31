import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../lib/api'

type Company = {
  razao_social: string
  nome_fantasia: string
  situacao_cadastral: string
  cnae_principal: {
    codigo: number
    descricao: string
  }
  municipio: string
  uf: string
  aviso: string
}

export default function PublicQueries() {
  const [company, setCompany] = useState<Company | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function consultar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const cnpj = String(data.get('cnpj') || '').replace(/\D/g, '')

    setCompany(null)
    setError('')

    if (cnpj.length !== 14) {
      setError('Informe um CNPJ com 14 dígitos.')
      return
    }

    setBusy(true)

    try {
      const result = await api<Company>(
        `/public/cnpj/${cnpj}`,
        'GET',
        undefined,
        false,
      )

      setCompany(result)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Não foi possível consultar o CNPJ.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card">
      <h2>Consulta cadastral de CNPJ</h2>

      <p>
        Consulte informações cadastrais.
        Esta consulta não avalia a elegibilidade à Lei do Bem.
      </p>

      <form onSubmit={consultar}>
        <fieldset disabled={busy} className="account-fields">
          <label>
            CNPJ

            <input
              name="cnpj"
              required
              maxLength={18}
              placeholder="00.000.000/0001-00"
            />
          </label>

          <div className="actions">
            <button className="primary">
              {busy ? 'Consultando…' : 'Consultar CNPJ'}
            </button>
          </div>
        </fieldset>
      </form>

      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}

      {company && (
        <div aria-live="polite">
          <h3>{company.razao_social}</h3>

          <div className="detail-grid">
            <span>
              Nome fantasia
              <strong>
                {company.nome_fantasia || 'Não informado'}
              </strong>
            </span>

            <span>
              Situação
              <strong>
                {company.situacao_cadastral || 'Não informada'}
              </strong>
            </span>

            <span>
              Localidade
              <strong>
                {company.municipio} / {company.uf}
              </strong>
            </span>

            <span>
              CNAE principal
              <strong>
                {company.cnae_principal.codigo}
                {' — '}
                {company.cnae_principal.descricao}
              </strong>
            </span>
          </div>

          <p className="muted">{company.aviso}</p>
        </div>
      )}
    </section>
  )
}