import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import {
  api,
  download,
  encodeFile,
  logout,
  readSession,
  saveFile,
  saveSession,
} from './lib/api'

import type { Session } from './lib/api'
import { date, money, number, totals } from './lib/metrics'

import type {
  Alert,
  Audit,
  Dashboard,
  Dossier,
  Expense,
  Milestone,
  Pagination,
  Project,
  Timesheet,
  User,
} from './types'

import './App.css'

type Screen =
  | 'dashboard'
  | 'projetos'
  | 'evidencias'
  | 'financeiro'
  | 'relatorios'
  | 'auditoria'
  | 'perfil'

type Body = Record<string, string | null>

type Field = {
  name: string
  label: string
  type?: string
  required?: boolean
  options?: { value: string; label: string }[]
  value?: string
  min?: number
  max?: number
  step?: string
  nullable?: boolean
}

type Dialog = {
  title: string
  fields: Field[]
  save: (body: Body) => Promise<unknown>
}

const screens: {
  id: Screen
  label: string
  icon: string
}[] = [
  { id: 'dashboard', label: 'BEM+ Radar', icon: '◉' },
  {
    id: 'projetos',
    label: 'Elegibilidade e projetos',
    icon: '◇',
  },
  {
    id: 'evidencias',
    label: 'Marcos e evidências',
    icon: '▤',
  },
  {
    id: 'financeiro',
    label: 'Timesheets e dispêndios',
    icon: '◷',
  },
  {
    id: 'relatorios',
    label: 'Relatórios internos',
    icon: '▥',
  },
  {
    id: 'auditoria',
    label: 'Auditoria e logs',
    icon: '◎',
  },
  { id: 'perfil', label: 'Meu Perfil', icon: '○' },
]

const canManage = (user: User) =>
  [
    'Administrador',
    'Gestor P&D / Lei do Bem',
    'Gestor Lei do Bem',
  ].includes(user.perfil)

const options = (values: string[]) =>
  values.map(value => ({
    value,
    label: value,
  }))

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Não foi possível concluir a operação.'

function useApi<T>(path: string, revision = 0) {
  const key = `${path}:${revision}`

  const [result, setResult] = useState<{
    key: string
    data: T | null
    error: string
  }>({
    key: '',
    data: null,
    error: '',
  })

  useEffect(() => {
    let active = true

    api<T>(path)
      .then(data => {
        if (active) {
          setResult({ key, data, error: '' })
        }
      })
      .catch(error => {
        if (active) {
          setResult({
            key,
            data: null,
            error: message(error),
          })
        }
      })

    return () => {
      active = false
    }
  }, [path, key])

  return result.key === key
    ? { ...result, loading: false }
    : {
        data: null,
        error: '',
        loading: true,
      }
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>
}

function Empty({
  children = 'Nenhum registro encontrado.',
}: {
  children?: ReactNode
}) {
  return <p className="empty">{children}</p>
}

function Card({
  title,
  value,
  note,
}: {
  title: string
  value: ReactNode
  note?: string
}) {
  return (
    <article className="card metric">
      <span className="eyebrow">{title}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </article>
  )
}

function Modal({
  dialog,
  close,
}: {
  dialog: Dialog
  close: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)
    const body: Body = {}

    for (const field of dialog.fields) {
      const value = String(
        data.get(field.name) ?? '',
      ).trim()

      if (value !== '') {
        body[field.name] = value
      } else if (field.nullable) {
        body[field.name] = null
      }
    }

    setBusy(true)
    setError('')

    try {
      await dialog.save(body)
      close()
    } catch (error) {
      setError(message(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header>
          <h2 id="modal-title">{dialog.title}</h2>

          <button
            onClick={close}
            disabled={busy}
            aria-label="Fechar formulário"
          >
            ×
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="form-grid">
            {dialog.fields.map(field => (
              <label
                key={field.name}
                className={
                  field.type === 'textarea' ? 'full' : ''
                }
              >
                {field.label}
                {field.required && ' *'}

                {field.options ? (
                  <select
                    name={field.name}
                    defaultValue={
                      field.value ??
                      field.options[0]?.value
                    }
                    required={field.required}
                  >
                    {field.options.map(option => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    defaultValue={field.value || ''}
                    rows={4}
                    required={field.required}
                  />
                ) : (
                  <input
                    name={field.name}
                    type={field.type || 'text'}
                    defaultValue={field.value || ''}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                  />
                )}
              </label>
            ))}
          </div>

          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}

          <footer>
            <button
              type="button"
              onClick={close}
              disabled={busy}
            >
              Cancelar
            </button>

            <button
              className="primary"
              disabled={busy}
            >
              {busy ? 'Salvando…' : 'Salvar'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function Login({
  onLogin,
}: {
  onLogin: (session: Session) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    setBusy(true)
    setError('')

    try {
      const session = await api<Session>(
        '/auth/login',
        'POST',
        {
          email: data.get('email'),
          senha: data.get('senha'),
        },
        false,
      )

      saveSession(session)
      onLogin(session)
    } catch (error) {
      setError(message(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-intro">
        <span className="brand-box">LB</span>

        <span className="eyebrow">
          BBTS · Pesquisa e Desenvolvimento
        </span>

        <h1>
          Da inovação
          <br />
          à evidência.
        </h1>

        <p>
          Projetos, experimentos e recursos reunidos
          em um só lugar.
        </p>

        <div className="login-note">
          SGA-LB <span>Gestão de P&D</span>
        </div>
      </section>

      <section className="login-card">
        <span className="eyebrow">
          Acesso à plataforma
        </span>

        <h2>Bem-vindo de volta</h2>
        <p>Entre com o e-mail cadastrado no sistema.</p>

        <form onSubmit={submit}>
          <label>
            E-mail
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              placeholder="nome@empresa.com.br"
            />
          </label>

          <label>
            Senha
            <div className="password">
              <input
                type={show ? 'text' : 'password'}
                name="senha"
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
              >
                {show ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </label>

          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}

          <button
            className="primary"
            disabled={busy}
          >
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <details>
          <summary>Esqueci minha senha</summary>
          <p>
            A recuperação automática ainda não está
            disponível. Solicite suporte ao responsável
            pelo ambiente.
          </p>
        </details>

        <small>
          A sessão fica nesta aba. Matrícula e SSO
          ainda não estão disponíveis.
        </small>
      </section>
    </main>
  )
}

function projectFields(
  project: Project | null,
  users: User[],
  user: User,
  year: string,
): Field[] {
  const fields: Field[] = [
    {
      name: 'codigo',
      label: 'Código',
      required: true,
    },
    {
      name: 'nome',
      label: 'Nome',
      required: true,
    },
    {
      name: 'ano_base',
      label: 'Ano-base',
      type: 'number',
      required: true,
      min: 2000,
      max: 2100,
      value: year || String(new Date().getFullYear()),
    },
    {
      name: 'usuario_responsavel_id',
      label: 'Responsável',
      required: true,
      value: String(user.id_usuario),
      options: users.map(item => ({
        value: String(item.id_usuario),
        label: item.nome,
      })),
    },
    {
      name: 'classificacao_pd',
      label: 'Classificação de P&D',
      required: true,
      value: 'Pesquisa aplicada',
    },
    {
      name: 'status',
      label: 'Status do projeto',
      options: options([
        'Em Avaliação',
        'Em Apuração',
        'Concluído',
      ]),
    },
    {
      name: 'trl_inicial',
      label: 'TRL inicial',
      type: 'number',
      min: 1,
      max: 9,
      required: true,
      value: '1',
    },
    {
      name: 'score_trl',
      label: 'TRL atual',
      type: 'number',
      min: 1,
      max: 9,
      required: true,
      value: '1',
    },
    {
      name: 'elegibilidade_pct',
      label: 'Elegibilidade informada (%)',
      type: 'number',
      min: 0,
      max: 100,
      step: '0.01',
      required: true,
      value: '0',
    },
    {
      name: 'risco_glosa',
      label: 'Risco informado',
      options: options(['Baixo', 'Médio', 'Alto']),
    },
    {
      name: 'risco_glosa_pct',
      label: 'Risco informado (%) — opcional',
      type: 'number',
      min: 0,
      max: 100,
      step: '0.01',
      nullable: true,
    },
    {
      name: 'orcamento',
      label: 'Orçamento (R$)',
      type: 'number',
      min: 0,
      step: '0.01',
      value: '0',
    },
    { name: 'diretoria', label: 'Diretoria' },
    { name: 'gerencia', label: 'Gerência' },
    {
      name: 'trilha_tecnologica',
      label: 'Trilha tecnológica',
    },
    {
      name: 'tipo_inovacao',
      label: 'Tipo de inovação',
      value: 'Tecnológica',
    },
    {
      name: 'cnae',
      label: 'CNAE',
      nullable: true,
    },
    {
      name: 'data_inicio',
      label: 'Início',
      type: 'date',
      nullable: true,
    },
    {
      name: 'data_fim',
      label: 'Fim',
      type: 'date',
      nullable: true,
    },
    {
      name: 'descricao',
      label: 'Descrição',
      type: 'textarea',
      nullable: true,
    },
    {
      name: 'barreira_incerteza',
      label: 'Barreira de incerteza tecnológica',
      type: 'textarea',
      nullable: true,
    },
  ]

  return fields.map(field => {
    if (!project) return field

    const value = (
      project as unknown as Record<string, unknown>
    )[field.name]

    return {
      ...field,

      value:
        field.name === 'risco_glosa'
          ? project.risco_glosa.split(' (')[0]
          : field.name === 'risco_glosa_pct' &&
              value == null
            ? (
                project.risco_glosa
                  .match(/\((\d+(?:[.,]\d+)?)%\)/)?.[1]
                  .replace(',', '.') || ''
              )
            : field.type === 'date'
              ? String(value || '').slice(0, 10)
              : String(value ?? ''),
    }
  })
}

type Tools = {
  revision: number
  busy: boolean
  user: User
  run: <T>(
    work: () => Promise<T>,
    success?: string,
  ) => Promise<T>
  open: (dialog: Dialog) => void
}

function DossierPanel({
  id,
  tools,
}: {
  id: number
  tools: Tools
}) {
  const resource = useApi<Dossier>(
    `/iniciativas/${id}/dossie`,
    tools.revision,
  )

  if (resource.loading) {
    return <Empty>Carregando dossiê…</Empty>
  }

  if (resource.error || !resource.data) {
    return (
      <p className="notice error">
        {resource.error}
      </p>
    )
  }

  const {
    projeto: project,
    pendencias,
    pronto_para_fechar,
  } = resource.data

  const manager = canManage(tools.user)
  const closed = project.status_dossie === 'Fechado'

  function opinion() {
    tools.open({
      title: 'Emitir parecer técnico',

      fields: [
        {
          name: 'conclusao',
          label: 'Conclusão',
          options: options([
            'Favorável',
            'Desfavorável',
            'Ajustes necessários',
          ]),
        },
        {
          name: 'conteudo',
          label: 'Fundamentação técnica',
          type: 'textarea',
          required: true,
        },
      ],

      save: body =>
        tools.run(() =>
          api(
            `/iniciativas/${id}/pareceres`,
            'POST',
            body,
          ),
        ),
    })
  }

  function alert() {
    tools.open({
      title: 'Novo alerta',

      fields: [
        {
          name: 'titulo',
          label: 'Título',
          required: true,
        },
        {
          name: 'severidade',
          label: 'Severidade',
          options: options([
            'Baixa',
            'Média',
            'Crítica',
          ]),
        },
        {
          name: 'prazo',
          label: 'Prazo',
          type: 'date',
        },
        {
          name: 'descricao',
          label: 'Descrição',
          type: 'textarea',
          required: true,
        },
      ],

      save: body =>
        tools.run(() =>
          api(
            `/iniciativas/${id}/alertas`,
            'POST',
            body,
          ),
        ),
    })
  }

  return (
    <section className="card dossier">
      <div className="section-title">
        <div>
          <span className="eyebrow">
            {project.codigo} · Revisão {project.revisao}
          </span>
          <h2>{project.nome}</h2>
        </div>

        <Badge>{project.status_dossie}</Badge>
      </div>

      <p>
        {project.barreira_incerteza ||
          'Barreira tecnológica ainda não descrita.'}
      </p>

      <div className="detail-grid">
        <span>
          Responsável
          <strong>
            {project.usuario_responsavel.nome}
          </strong>
        </span>

        <span>
          TRL
          <strong>
            {project.trl_inicial} → {project.score_trl}
          </strong>
        </span>

        <span>
          Elegibilidade informada
          <strong>
            {number(project.elegibilidade_pct)}%
          </strong>
        </span>

        <span>
          Risco informado
          <strong>{project.risco_glosa}</strong>
        </span>
      </div>

      <h3>Pendências do dossiê</h3>

      {pendencias.length ? (
        <ul className="pending-list">
          {pendencias.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="success-text">
          Nenhuma pendência encontrada.
        </p>
      )}

      <div className="actions">
        {!closed && (
          <button onClick={alert}>
            Cadastrar alerta
          </button>
        )}

        {manager && !closed && (
          <button onClick={opinion}>
            Emitir parecer
          </button>
        )}

        {manager && !closed && (
          <button
            className="primary"
            disabled={
              !pronto_para_fechar || tools.busy
            }
            onClick={() => {
              if (
                confirm(
                  'Fechar o dossiê desta revisão?',
                )
              ) {
                void tools.run(
                  () =>
                    api(
                      `/iniciativas/${id}/dossie/fechar`,
                      'POST',
                    ),
                  'Dossiê fechado.',
                ).catch(() => {})
              }
            }}
          >
            Validar e fechar dossiê
          </button>
        )}

        {manager && closed && (
          <button
            onClick={() =>
              tools.open({
                title: 'Reabrir dossiê',

                fields: [
                  {
                    name: 'motivo',
                    label: 'Justificativa',
                    type: 'textarea',
                    required: true,
                  },
                ],

                save: body =>
                  tools.run(() =>
                    api(
                      `/iniciativas/${id}/dossie/reabrir`,
                      'POST',
                      body,
                    ),
                  ),
              })
            }
          >
            Reabrir com justificativa
          </button>
        )}
      </div>

      <h3>Alertas</h3>

      {!project.alertas.length && (
        <Empty>Sem alertas registrados.</Empty>
      )}

      {project.alertas.map(item => (
        <article
          className="record"
          key={item.id_alerta}
        >
          <div>
            <Badge>
              {item.severidade} · {item.status}
            </Badge>

            <h4>{item.titulo}</h4>
            <p>{item.descricao}</p>

            {item.resolucao && (
              <small>
                Resolução: {item.resolucao}
              </small>
            )}
          </div>

          {manager &&
            !closed &&
            item.status === 'Aberto' && (
              <button
                onClick={() =>
                  tools.open({
                    title: 'Resolver alerta',

                    fields: [
                      {
                        name: 'resolucao',
                        label:
                          'Como a pendência foi resolvida?',
                        type: 'textarea',
                        required: true,
                      },
                    ],

                    save: body =>
                      tools.run(() =>
                        api(
                          `/alertas/${item.id_alerta}/resolver`,
                          'POST',
                          body,
                        ),
                      ),
                  })
                }
              >
                Resolver
              </button>
            )}
        </article>
      ))}

      <h3>Histórico de pareceres</h3>

      {!project.pareceres.length && (
        <Empty>Sem pareceres registrados.</Empty>
      )}

      {project.pareceres.map(item => (
        <article
          key={item.id_parecer}
          className="record"
        >
          <div>
            <Badge>{item.conclusao}</Badge>
            <p>{item.conteudo}</p>

            <small>
              Revisão {item.revisao_projeto} ·
              Autor #{item.autor_id} ·{' '}
              {date(item.criado_em)}
            </small>
          </div>
        </article>
      ))}
    </section>
  )
}

function EvidencePanel({
  p,
  tools,
}: {
  p: Project
  tools: Tools
}) {
  const [marcoId, setMarcoId] = useState(
    p.marcos[0]?.id_marco || 0,
  )

  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [fileKey, setFileKey] = useState(0)

  const closed = p.status_dossie === 'Fechado'
  const manager = canManage(tools.user)

  const activeMarcoId = p.marcos.some(
    milestone => milestone.id_marco === marcoId,
  )
    ? marcoId
    : (p.marcos[0]?.id_marco || 0)

  async function upload(event: FormEvent) {
    event.preventDefault()
    setError('')

    try {
      if (!file || !activeMarcoId) {
        throw new Error(
          'Selecione um marco e um arquivo.',
        )
      }

      const conteudo_base64 = await encodeFile(file)

      await tools.run(
        () =>
          api(
            `/iniciativas/${p.id_iniciativa}/marcos/${activeMarcoId}/evidencias`,
            'POST',
            {
              nome: file.name,
              conteudo_base64,
            },
          ),
        'Arquivo enviado. Ele está pendente de validação.',
      )

      setFile(null)
      setFileKey(value => value + 1)
    } catch (error) {
      setError(message(error))
    }
  }

  function edit(milestone?: Milestone) {
    tools.open({
      title: milestone
        ? 'Editar marco'
        : 'Novo marco experimental',

      fields: [
        {
          name: 'titulo',
          label: 'Título',
          required: true,
          value: milestone?.titulo,
        },
        {
          name: 'periodo',
          label: 'Período',
          required: true,
          value: milestone?.periodo,
        },
        {
          name: 'descricao',
          label: 'Hipótese, experimento e resultados',
          type: 'textarea',
          required: true,
          value: milestone?.descricao,
        },
      ],

      save: body =>
        tools.run(() =>
          api(
            `/iniciativas/${p.id_iniciativa}/marcos${
              milestone
                ? `/${milestone.id_marco}`
                : ''
            }`,
            milestone ? 'PUT' : 'POST',
            body,
          ),
        ),
    })
  }

  return (
    <>
      <section className="card">
        <div className="section-title">
          <div>
            <span className="eyebrow">{p.codigo}</span>
            <h2>Registro de evidências</h2>
          </div>

          <button
            disabled={closed || tools.busy}
            onClick={() => edit()}
          >
            Novo marco
          </button>
        </div>

        <p>
          O documento deve ser vinculado a um marco
          experimental. Limite de 5 MiB por arquivo.
          O servidor calcula o hash.
        </p>

        <form
          noValidate
          onSubmit={upload}
          className="upload-form"
        >
          <label>
            Marco experimental
            <select
              required
              value={activeMarcoId}
              onChange={event =>
                setMarcoId(Number(event.target.value))
              }
            >
              <option value={0}>
                Selecione um marco
              </option>

              {p.marcos.map(milestone => (
                <option
                  key={milestone.id_marco}
                  value={milestone.id_marco}
                >
                  {milestone.titulo}
                </option>
              ))}
            </select>
          </label>

          <label>
            Documento
            <input
              key={fileKey}
              type="file"
              required
              disabled={closed}
              onChange={event =>
                setFile(
                  event.target.files?.[0] || null,
                )
              }
            />
          </label>

          <button
            className="primary"
            disabled={
              closed ||
              tools.busy ||
              !p.marcos.length
            }
          >
            Enviar evidência
          </button>
        </form>

        {closed && (
          <p className="notice">
            Dossiê fechado. Reabra para alterar os registros.
          </p>
        )}

        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
      </section>

      {p.marcos.map(milestone => (
        <section
          className="card"
          key={milestone.id_marco}
        >
          <div className="section-title">
            <div>
              <Badge>
                {milestone.status_validacao}
              </Badge>

              <h2>{milestone.titulo}</h2>
              <small>{milestone.periodo}</small>
            </div>

            <div className="actions">
              <button
                disabled={closed || tools.busy}
                onClick={() => edit(milestone)}
              >
                Editar marco
              </button>

              {manager && (
                <button
                  disabled={
                    closed ||
                    tools.busy ||
                    milestone.status_validacao ===
                      'Validado'
                  }
                  onClick={() =>
                    void tools.run(() =>
                      api(
                        `/iniciativas/${p.id_iniciativa}/marcos/${milestone.id_marco}/validar`,
                        'POST',
                      ),
                    ).catch(() => {})
                  }
                >
                  Validar marco
                </button>
              )}
            </div>
          </div>

          <p>{milestone.descricao}</p>

          {!milestone.evidencias.length && (
            <Empty>Nenhuma evidência anexada.</Empty>
          )}

          {milestone.evidencias.map(evidence => (
            <article
              className="record"
              key={evidence.id_evidencia}
            >
              <div>
                <h4>{evidence.nome}</h4>

                <small>
                  {number(
                    evidence.tamanho_bytes / 1024,
                  )}{' '}
                  KiB · {evidence.status}
                </small>

                <code>
                  SHA-256: {evidence.sha256}
                </code>
              </div>

              <div className="actions">
                <button
                  onClick={() =>
                    void tools.run(
                      () =>
                        download(
                          evidence.id_evidencia,
                          evidence.nome,
                        ),
                      'Download iniciado.',
                    ).catch(() => {})
                  }
                  disabled={tools.busy}
                >
                  Baixar
                </button>

                {manager && (
                  <button
                    disabled={
                      closed ||
                      tools.busy ||
                      evidence.status === 'Validado'
                    }
                    onClick={() =>
                      void tools.run(() =>
                        api(
                          `/evidencias/${evidence.id_evidencia}/validar`,
                          'POST',
                        ),
                      ).catch(() => {})
                    }
                  >
                    Validar
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      ))}

      {!p.marcos.length && (
        <Empty>
          Cadastre o primeiro marco para anexar evidências.
        </Empty>
      )}
    </>
  )
}

function FinancePanel({
  p,
  tools,
}: {
  p: Project
  tools: Tools
}) {
  const [selected, setSelected] = useState<number[]>([])

  const closed = p.status_dossie === 'Fechado'
  const manager = canManage(tools.user)

  function expense(item?: Expense) {
    tools.open({
      title: item
        ? 'Editar dispêndio'
        : 'Novo dispêndio',

      fields: [
        {
          name: 'descricao',
          label: 'Descrição',
          required: true,
          value: item?.descricao,
        },
        {
          name: 'categoria',
          label: 'Categoria',
          required: true,
          value: item?.categoria,
        },
        {
          name: 'valor',
          label: 'Valor (R$)',
          type: 'number',
          required: true,
          min: 0.01,
          step: '0.01',
          value: String(item?.valor || ''),
        },
        {
          name: 'data',
          label: 'Data',
          type: 'date',
          required: true,
          value: item?.data.slice(0, 10),
        },
        {
          name: 'documento_comprobatorio',
          label: 'Referência documental / nota fiscal',
          value: item?.documento_comprobatorio || '',
          nullable: true,
        },
      ],

      save: body =>
        tools.run(() =>
          api(
            `/iniciativas/${p.id_iniciativa}/dispendios${
              item ? `/${item.id_dispendio}` : ''
            }`,
            item ? 'PUT' : 'POST',
            body,
          ),
        ),
    })
  }

  function time(item?: Timesheet) {
    const fields: Field[] = [
      {
        name: 'colaborador_id',
        label: 'Identificação do colaborador',
        required: true,
      },
      {
        name: 'colaborador_nome',
        label: 'Nome',
        required: true,
      },
      {
        name: 'cargo_regime',
        label: 'Cargo / regime',
        required: true,
      },
      {
        name: 'data',
        label: 'Data de referência',
        type: 'date',
        required: true,
      },
      {
        name: 'horas_mes',
        label: 'Horas',
        type: 'number',
        required: true,
        min: 0.01,
        max: 744,
        step: '0.01',
      },
      {
        name: 'elegivel_pct',
        label: 'Percentual elegível informado',
        type: 'number',
        required: true,
        min: 0,
        max: 100,
        step: '0.01',
        value: '100',
      },
      {
        name: 'custo_apropriado',
        label: 'Custo apropriado (R$)',
        type: 'number',
        required: true,
        min: 0,
        step: '0.01',
      },
      {
        name: 'justificativa',
        label: 'Atividade experimental / justificativa',
        type: 'textarea',
        required: true,
      },
    ]

    tools.open({
      title: item
        ? 'Editar horas — exige nova aprovação'
        : 'Registrar horas',

      fields: fields.map(field =>
        item
          ? {
              ...field,
              value:
                field.name === 'data'
                  ? item.data.slice(0, 10)
                  : String(
                      (
                        item as unknown as
                        Record<string, unknown>
                      )[field.name] ?? '',
                    ),
            }
          : field,
      ),

      save: body =>
        tools.run(() =>
          api(
            `/iniciativas/${p.id_iniciativa}/timesheets${
              item ? `/${item.id_timesheet}` : ''
            }`,
            item ? 'PUT' : 'POST',
            body,
          ),
        ),
    })
  }

  const summary = totals([p])

  return (
    <>
      <div className="metrics">
        <Card
          title="Dispêndios registrados"
          value={money(summary.expenses)}
        />

        <Card
          title="Horas registradas"
          value={`${number(summary.hours)} h`}
        />

        <Card
          title="Horas aprovadas"
          value={`${number(summary.approvedHours)} h`}
        />

        <Card
          title="Custo pessoal aprovado"
          value={money(summary.personnel)}
        />
      </div>

      {!p.ano_base && (
        <p className="notice">
          Preencha o ano-base na edição do projeto
          antes de registrar despesas ou horas.
        </p>
      )}

      <section className="card">
        <div className="section-title">
          <h2>Timesheets</h2>

          <div className="actions">
            <button
              disabled={closed || tools.busy}
              onClick={() => time()}
            >
              Registrar horas
            </button>

            {manager && (
              <button
                className="primary"
                disabled={
                  closed ||
                  tools.busy ||
                  !selected.length ||
                  selected.length > 100
                }
                onClick={() =>
                  void tools.run(() =>
                    api(
                      '/timesheets/aprovar-lote',
                      'POST',
                      { ids: selected },
                    ),
                  )
                    .then(() => setSelected([]))
                    .catch(() => {})
                }
              >
                Aprovar selecionados ({selected.length})
              </button>
            )}
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Selecionar</th>
                <th>Colaborador</th>
                <th>Referência</th>
                <th>Horas</th>
                <th>Custo</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {p.timesheets.map(item => (
                <tr key={item.id_timesheet}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={
                        `Selecionar timesheet ${item.id_timesheet}`
                      }
                      disabled={
                        closed ||
                        !manager ||
                        item.status !== 'Pendente'
                      }
                      checked={selected.includes(
                        item.id_timesheet,
                      )}
                      onChange={event =>
                        setSelected(values =>
                          event.target.checked
                            ? [
                                ...values,
                                item.id_timesheet,
                              ]
                            : values.filter(
                                id =>
                                  id !== item.id_timesheet,
                              ),
                        )
                      }
                    />
                  </td>

                  <td>
                    <strong>
                      {item.colaborador_nome}
                    </strong>

                    <small>
                      {item.colaborador_id} ·{' '}
                      {item.cargo_regime}
                    </small>
                  </td>

                  <td>{date(item.data)}</td>
                  <td>{number(item.horas_mes)}</td>
                  <td>{money(item.custo_apropriado)}</td>

                  <td>
                    <Badge>{item.status}</Badge>
                  </td>

                  <td>
                    <button
                      disabled={closed || tools.busy}
                      onClick={() => time(item)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!p.timesheets.length && (
          <Empty>Sem horas registradas.</Empty>
        )}
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Dispêndios</h2>

          <button
            disabled={closed || tools.busy}
            onClick={() => expense()}
          >
            Novo dispêndio
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Data</th>
                <th>Categoria</th>
                <th>Valor</th>
                <th>Documento</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {p.dispendios.map(item => (
                <tr key={item.id_dispendio}>
                  <td>{item.descricao}</td>
                  <td>{date(item.data)}</td>
                  <td>{item.categoria}</td>
                  <td>{money(item.valor)}</td>

                  <td>
                    {item.documento_comprobatorio ||
                      'Não informado'}
                  </td>

                  <td>
                    <button
                      disabled={closed || tools.busy}
                      onClick={() => expense(item)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!p.dispendios.length && (
          <Empty>Sem dispêndios registrados.</Empty>
        )}
      </section>

      <p className="muted">
        Despesas e custos de pessoal são apresentados
        separadamente. A edição de horas não recalcula
        automaticamente seu custo.
      </p>
    </>
  )
}

function AuditPanel({
  revision,
}: {
  revision: number
}) {
  const [page, setPage] = useState(1)

  const resource = useApi<Pagination<Audit>>(
    `/auditoria?pagina=${page}&limite=20`,
    revision,
  )

  if (resource.loading) {
    return <Empty>Carregando logs…</Empty>
  }

  if (resource.error || !resource.data) {
    return (
      <p className="notice error">
        {resource.error}
      </p>
    )
  }

  return (
    <section className="card">
      <h2>Histórico de ações</h2>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Usuário</th>
              <th>Ação</th>
              <th>Entidade</th>
              <th>Registro</th>
            </tr>
          </thead>

          <tbody>
            {resource.data.dados.map(item => (
              <tr key={item.id_auditoria}>
                <td>
                  {new Date(
                    item.criado_em,
                  ).toLocaleString('pt-BR')}
                </td>
                <td>#{item.usuario_id}</td>
                <td>{item.acao}</td>
                <td>{item.entidade}</td>
                <td>{item.registro_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!resource.data.dados.length && <Empty />}

      <div className="pager">
        <span>
          {resource.data.paginacao.total} eventos
        </span>

        <button
          disabled={page <= 1}
          onClick={() => setPage(value => value - 1)}
        >
          Anterior
        </button>

        <span>Página {page}</span>

        <button
          disabled={
            page >=
            resource.data.paginacao.total_paginas
          }
          onClick={() => setPage(value => value + 1)}
        >
          Próxima
        </button>
      </div>
    </section>
  )
}

function Workspace({
  session,
}: {
  session: Session
}) {
  const [screen, setScreen] =
    useState<Screen>('dashboard')

  const [year, setYear] = useState('')
  const [revision, setRevision] = useState(0)

  const [selectedId, setSelectedId] =
    useState<number | null>(null)

  const [dialog, setDialog] =
    useState<Dialog | null>(null)

  const [busy, setBusy] = useState(false)

  const [notice, setNotice] = useState<{
    text: string
    error: boolean
  } | null>(null)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const data = useApi<Dashboard>(
    '/elegibilidade/dashboard',
    revision,
  )

  const me = useApi<{ usuario: User }>(
    '/auth/me',
    revision,
  )

  const users = useApi<User[]>(
    '/usuarios',
    revision,
  )

  const user = me.data?.usuario || session.usuario
  const manager = canManage(user)

  async function run<T>(
    work: () => Promise<T>,
    success = 'Operação realizada com sucesso.',
  ): Promise<T> {
    setBusy(true)

    try {
      const result = await work()

      setRevision(value => value + 1)
      setNotice({
        text: success,
        error: false,
      })

      return result
    } catch (error) {
      setNotice({
        text: message(error),
        error: true,
      })

      throw error
    } finally {
      setBusy(false)
    }
  }

  const tools: Tools = {
    revision,
    busy,
    user,
    run,
    open: setDialog,
  }

  const all = data.data?.projetos || []

  const projects = all.filter(
    project =>
      !year || String(project.ano_base) === year,
  )

  const filtered = projects.filter(project =>
    `${project.codigo} ${project.nome} ${project.classificacao_pd}`
      .toLocaleLowerCase('pt-BR')
      .includes(
        search.toLocaleLowerCase('pt-BR'),
      ),
  )

  const pages = Math.max(
    1,
    Math.ceil(filtered.length / 5),
  )

  const currentPage = Math.min(page, pages)

  const active =
    projects.find(
      project =>
        project.id_iniciativa === selectedId,
    ) ||
    projects[0] ||
    null

  const summary = totals(projects)

  function navigate(id: Screen) {
    setScreen(id)
    setSearch('')
    setPage(1)
    setNotice(null)
  }

  function editProject(project: Project | null) {
    setDialog({
      title: project
        ? 'Editar projeto'
        : 'Novo projeto de P&D',

      fields: projectFields(
        project,
        users.data || [user],
        user,
        year,
      ),

      save: body =>
        run(async () => {
          const created = await api<Project>(
            `/iniciativas${
              project
                ? `/${project.id_iniciativa}`
                : ''
            }`,
            project ? 'PUT' : 'POST',
            body,
          )

          setSelectedId(created.id_iniciativa)

          return created
        }),
    })
  }

  function openProject(project: Project) {
    setSelectedId(project.id_iniciativa)
    navigate('projetos')
  }

  async function report() {
    const result = await api<unknown>(
      `/relatorios/mcti${
        year ? `?ano_base=${year}` : ''
      }`,
    )

    saveFile(
      new Blob(
        [JSON.stringify(result, null, 2)],
        { type: 'application/json' },
      ),
      `previa-interna-${year || 'todos'}.json`,
    )
  }

  const projectPicker = (
    <label className="project-picker">
      Projeto
      <select
        value={active?.id_iniciativa || ''}
        onChange={event =>
          setSelectedId(Number(event.target.value))
        }
      >
        {!projects.length && (
          <option value="">
            Nenhum projeto
          </option>
        )}

        {projects.map(project => (
          <option
            value={project.id_iniciativa}
            key={project.id_iniciativa}
          >
            {project.codigo} — {project.nome}
          </option>
        ))}
      </select>
    </label>
  )

  const projectTable = (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Classificação</th>
            <th>TRL</th>
            <th>Elegibilidade informada</th>
            <th>Dossiê</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {filtered
            .slice(
              (currentPage - 1) * 5,
              currentPage * 5,
            )
            .map(project => (
              <tr key={project.id_iniciativa}>
                <td>
                  <small>{project.codigo}</small>
                  <strong>{project.nome}</strong>
                  <small>
                    {project.diretoria} /{' '}
                    {project.gerencia}
                  </small>
                </td>

                <td>{project.classificacao_pd}</td>

                <td>
                  {project.trl_inicial} →{' '}
                  {project.score_trl}
                </td>

                <td>
                  {number(
                    project.elegibilidade_pct,
                  )}%

                  <progress
                    value={Number(
                      project.elegibilidade_pct,
                    )}
                    max={100}
                  />
                </td>

                <td>
                  <Badge>
                    {project.status_dossie}
                  </Badge>
                </td>

                <td>
                  <div className="actions">
                    <button
                      onClick={() =>
                        openProject(project)
                      }
                    >
                      Dossiê
                    </button>

                    {screen === 'projetos' && (
                      <>
                        <button
                          disabled={
                            project.status_dossie ===
                              'Fechado' || busy
                          }
                          onClick={() =>
                            editProject(project)
                          }
                        >
                          Editar
                        </button>

                        {manager && (
                          <button
                            className="danger"
                            disabled={
                              project.status_dossie ===
                                'Fechado' || busy
                            }
                            onClick={() => {
                              if (
                                confirm(
                                  'Excluir projeto? A API impede excluir projetos com histórico.',
                                )
                              ) {
                                void run(() =>
                                  api(
                                    `/iniciativas/${project.id_iniciativa}`,
                                    'DELETE',
                                  ),
                                ).catch(() => {})
                              }
                            }}
                          >
                            Excluir
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {!filtered.length && <Empty />}
    </div>
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          href="#"
          className="brand"
          onClick={event => {
            event.preventDefault()
            navigate('dashboard')
          }}
        >
          <span className="brand-box">LB</span>

          <span>
            <strong>BBTS | SGA-LB</strong>
            <small>Lei do Bem · P&D</small>
          </span>
        </a>

        <div className="sidebar-label">
          Módulos de apuração
        </div>

        <nav>
          {screens
            .filter(
              item =>
                item.id !== 'auditoria' || manager,
            )
            .map(item => (
              <button
                className={
                  screen === item.id ? 'active' : ''
                }
                onClick={() => navigate(item.id)}
                key={item.id}
              >
                <span aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
        </nav>

        <footer>
          <strong>{user.nome}</strong>
          <small>{user.perfil}</small>

          <button onClick={logout}>
            Sair da conta ↗
          </button>

          <small>
            ERP / ponto: integração não configurada
          </small>
        </footer>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <span>
            Gestão de Pesquisa e Desenvolvimento
          </span>

          <div className="actions">
            <label>
              Ano-base
              <select
                value={year}
                onChange={event => {
                  setYear(event.target.value)
                  setSelectedId(null)
                  setPage(1)
                }}
              >
                <option value="">
                  Todos os anos
                </option>

                {[
                  ...new Set(
                    all
                      .map(project => project.ano_base)
                      .filter(
                        (value): value is number =>
                          value !== null,
                      ),
                  ),
                ]
                  .sort((a, b) => b - a)
                  .map(value => (
                    <option
                      key={value}
                      value={value}
                    >
                      {value}
                    </option>
                  ))}
              </select>
            </label>

            <button
              onClick={() =>
                setRevision(value => value + 1)
              }
              disabled={busy || data.loading}
            >
              Atualizar
            </button>

            <span className="avatar">
              {user.nome.slice(0, 1)}
            </span>
          </div>
        </header>

        <main>
          <div className="page-title">
            <div>
              <span className="eyebrow">
                SGA-LB ·{' '}
                {year
                  ? `Ano-base ${year}`
                  : 'Carteira completa'}
              </span>

              <h1>
                {
                  screens.find(
                    item => item.id === screen,
                  )?.label
                }
              </h1>

              <p>
                Dados registrados no sistema
                de acompanhamento de P&D.
              </p>
            </div>

            {[
              'dashboard',
              'projetos',
            ].includes(screen) && (
              <button
                className="primary"
                disabled={
                  busy ||
                  users.loading ||
                  !!users.error
                }
                onClick={() => editProject(null)}
              >
                + Novo projeto P&D
              </button>
            )}
          </div>

          {notice && (
            <div
              role={notice.error ? 'alert' : 'status'}
              className={
                `notice ${
                  notice.error ? 'error' : 'success'
                }`
              }
            >
              {notice.text}

              <button
                onClick={() => setNotice(null)}
                aria-label="Fechar aviso"
              >
                ×
              </button>
            </div>
          )}

          {data.loading || me.loading ? (
            <Empty>Carregando dados da API…</Empty>
          ) : data.error || me.error ? (
            <p
              className="notice error"
              role="alert"
            >
              {data.error || me.error}
            </p>
          ) : (
            <>
              {users.error && (
                <p className="notice error">
                  Não foi possível carregar responsáveis:
                  {' '}{users.error}
                </p>
              )}

              {screen === 'dashboard' && (
                <>
                  <div className="metrics">
                    <Card
                      title="Projetos mapeados"
                      value={summary.count}
                      note={
                        `${summary.eligible} com score informado ≥ 85%`
                      }
                    />

                    <Card
                      title="Dispêndios"
                      value={money(summary.expenses)}
                    />

                    <Card
                      title="Horas P&D"
                      value={
                        `${number(summary.hours)} h`
                      }
                      note={
                        `${number(summary.approvedHours)} h aprovadas`
                      }
                    />

                    <Card
                      title="Documentos"
                      value={summary.documents}
                      note={
                        `${summary.highRisk} projetos com risco alto informado`
                      }
                    />
                  </div>

                  <div className="two-columns">
                    <section className="card">
                      <h2>
                        Dispêndios e horas por trilha
                      </h2>

                      {summary.tracks.map(track => (
                        <article
                          className="track"
                          key={track.name}
                        >
                          <div>
                            <strong>
                              {track.name}
                            </strong>

                            <span>
                              {money(track.cost)}
                            </span>
                          </div>

                          <progress
                            max={Math.max(
                              summary.expenses,
                              1,
                            )}
                            value={track.cost}
                          />

                          <small>
                            {track.count} projetos ·{' '}
                            {number(track.hours)} h
                            registradas
                          </small>
                        </article>
                      ))}

                      {!summary.tracks.length && (
                        <Empty />
                      )}
                    </section>

                    <section className="card">
                      <h2>Alertas em aberto</h2>

                      {summary.alerts
                        .slice(0, 5)
                        .map((alert: Alert) => (
                          <article
                            className="record"
                            key={alert.id_alerta}
                          >
                            <div>
                              <Badge>
                                {alert.severidade}
                              </Badge>

                              <h4>{alert.titulo}</h4>
                              <p>{alert.descricao}</p>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedId(
                                  alert.iniciativa_id,
                                )
                                navigate('projetos')
                              }}
                            >
                              Ver projeto
                            </button>
                          </article>
                        ))}

                      {!summary.alerts.length && (
                        <Empty>
                          Sem alertas abertos neste recorte.
                        </Empty>
                      )}
                    </section>
                  </div>

                  <section className="card">
                    <h2>
                      Esteira de maturação tecnológica
                    </h2>

                    <div className="trl-grid">
                      {[
                        [1, 3, 'Conceituação'],
                        [4, 6, 'Desenvolvimento'],
                        [7, 9, 'Validação e operação'],
                      ].map(([min, max, label]) => (
                        <div
                          className="trl-column"
                          key={min}
                        >
                          <span className="eyebrow">
                            TRL {min}–{max}
                          </span>

                          <h3>{label}</h3>

                          <strong>
                            {
                              projects.filter(
                                project =>
                                  project.score_trl >=
                                    Number(min) &&
                                  project.score_trl <=
                                    Number(max),
                              ).length
                            } projetos
                          </strong>

                          {projects
                            .filter(
                              project =>
                                project.score_trl >=
                                  Number(min) &&
                                project.score_trl <=
                                  Number(max),
                            )
                            .slice(0, 3)
                            .map(project => (
                              <button
                                key={
                                  project.id_iniciativa
                                }
                                onClick={() =>
                                  openProject(project)
                                }
                              >
                                {project.codigo}
                                <small>
                                  {project.nome}
                                </small>
                              </button>
                            ))}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="card">
                    <h2>Projetos da carteira</h2>
                    {projectTable}
                  </section>

                  <p className="muted">
                    Economia fiscal e índice geral de glosa:
                    não calculados. Os scores são informados
                    pela equipe.
                  </p>
                </>
              )}

              {screen === 'projetos' && (
                <>
                  <div className="metrics">
                    <Card
                      title="Aderência ≥ 85%"
                      value={summary.eligible}
                    />

                    <Card
                      title="Aderência 60–84,99%"
                      value={summary.partial}
                    />

                    <Card
                      title="Alto risco informado"
                      value={summary.highRisk}
                    />

                    <Card
                      title="Documentos rastreados"
                      value={summary.documents}
                    />
                  </div>

                  <section className="card">
                    <div className="section-title">
                      <h2>Projetos da carteira</h2>

                      <label className="search">
                        Buscar projeto
                        <input
                          value={search}
                          onChange={event => {
                            setSearch(
                              event.target.value,
                            )
                            setPage(1)
                          }}
                          placeholder={
                            'Código, nome ou classificação'
                          }
                        />
                      </label>
                    </div>

                    {projectTable}

                    <div className="pager">
                      <span>
                        {filtered.length} projetos
                      </span>

                      <button
                        disabled={currentPage <= 1}
                        onClick={() =>
                          setPage(value => value - 1)
                        }
                      >
                        Anterior
                      </button>

                      <span>
                        {currentPage} / {pages}
                      </span>

                      <button
                        disabled={currentPage >= pages}
                        onClick={() =>
                          setPage(value => value + 1)
                        }
                      >
                        Próxima
                      </button>
                    </div>
                  </section>

                  {projectPicker}

                  {active && (
                    <DossierPanel
                      key={active.id_iniciativa}
                      id={active.id_iniciativa}
                      tools={tools}
                    />
                  )}
                </>
              )}

              {screen === 'evidencias' && (
                <>
                  {projectPicker}

                  {active ? (
                    <EvidencePanel
                      key={active.id_iniciativa}
                      p={active}
                      tools={tools}
                    />
                  ) : (
                    <Empty>
                      Cadastre um projeto primeiro.
                    </Empty>
                  )}
                </>
              )}

              {screen === 'financeiro' && (
                <>
                  {projectPicker}

                  {active ? (
                    <FinancePanel
                      key={active.id_iniciativa}
                      p={active}
                      tools={tools}
                    />
                  ) : (
                    <Empty>
                      Cadastre um projeto primeiro.
                    </Empty>
                  )}
                </>
              )}

              {screen === 'relatorios' && (
                <>
                  <section className="card">
                    <Badge>Prévia interna</Badge>

                    <h2>
                      Consolidação dos projetos registrados
                    </h2>

                    <p>
                      O JSON é obtido do backend.
                      Não é um arquivo oficial de submissão
                      ao MCTI. A impressão gera uma ficha
                      de acompanhamento.
                    </p>

                    <div className="actions">
                      <button
                        className="primary"
                        disabled={busy}
                        onClick={() =>
                          void run(
                            report,
                            'Prévia interna exportada.',
                          ).catch(() => {})
                        }
                      >
                        Exportar JSON
                      </button>

                      <button
                        onClick={() => window.print()}
                      >
                        Imprimir resumo
                      </button>
                    </div>
                  </section>

                  <div className="metrics">
                    <Card
                      title="Projetos"
                      value={summary.count}
                    />

                    <Card
                      title="Dispêndios"
                      value={money(summary.expenses)}
                    />

                    <Card
                      title="Horas aprovadas"
                      value={
                        `${number(summary.approvedHours)} h`
                      }
                    />

                    <Card
                      title="Documentos"
                      value={summary.documents}
                    />
                  </div>

                  <section className="card">
                    <h2>
                      Projetos incluídos no recorte
                    </h2>

                    {projectTable}
                  </section>
                </>
              )}

              {screen === 'auditoria' && (
                manager ? (
                  <AuditPanel revision={revision} />
                ) : (
                  <p className="notice error">
                    Acesso restrito a gestores
                    e administradores.
                  </p>
                )
              )}

              {screen === 'perfil' && (
                <section className="card profile">
                  <div className="avatar large">
                    {user.nome.slice(0, 1)}
                  </div>

                  <h2>{user.nome}</h2>

                  <div className="detail-grid">
                    <span>
                      E-mail
                      <strong>{user.email}</strong>
                    </span>

                    <span>
                      Perfil
                      <strong>{user.perfil}</strong>
                    </span>

                    <span>
                      Identificação
                      <strong>#{user.id_usuario}</strong>
                    </span>
                  </div>

                  <p>
                    Dados consultados na API.
                    Edição de perfil, foto e recuperação
                    de senha ainda não estão disponíveis.
                  </p>

                  <button onClick={logout}>
                    Encerrar sessão
                  </button>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {dialog && (
        <Modal
          dialog={dialog}
          close={() => setDialog(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  const [session, setSession] =
    useState<Session | null>(readSession)

  useEffect(() => {
    const clear = () => setSession(null)

    window.addEventListener(
      'sgalb:logout',
      clear,
    )

    return () =>
      window.removeEventListener(
        'sgalb:logout',
        clear,
      )
  }, [])

  return session ? (
    <Workspace session={session} />
  ) : (
    <Login onLogin={setSession} />
  )
}