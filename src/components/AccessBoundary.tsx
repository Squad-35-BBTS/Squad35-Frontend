import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'

import { api, download, logout } from '../lib/api'
import { DEMO_MODE } from '../lib/demo'
import { date, number } from '../lib/metrics'
import { filterProjects } from '../lib/projectView'
import { canNavigate } from '../lib/navigation'

import type { Project, User } from '../types'

import ProfilePanel from './ProfilePanel'
import PortfolioProgress from './PortfolioProgress'
import FormpdEditor from './FormpdEditor'

import '../formpd.css'

type Access = {
  papel:
    | 'gestor'
    | 'analista'
    | 'auditor'
    | 'consultoria'
    | null
  telas: string[]
  pode_mapear: boolean
  pode_aprovar: boolean
  pode_editar_enquadramento: boolean
}

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Não foi possível carregar o acesso.'

export default function AccessBoundary({
  children,
}: {
  children: ReactNode
}) {
  const [access, setAccess] = useState<Access | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    let active = true

    if (DEMO_MODE) return

    api<Access>('/auth/permissoes')
      .then(value => {
        if (active) setAccess(value)
      })
      .catch(error => {
        if (active) setError(message(error))
      })

    return () => {
      active = false
    }
  }, [retry])

  if (DEMO_MODE) {
    return <>{children}</>
  }

  if (error) {
    return (
      <main id="main-content">
        <p role="alert">{error}</p>

        <button
          onClick={() => {
            setError('')
            setRetry(value => value + 1)
          }}
        >
          Tentar novamente
        </button>

        <button onClick={logout}>Sair</button>
      </main>
    )
  }

  if (!access) {
    return (
      <main id="main-content">
        <p role="status">Carregando permissões…</p>
      </main>
    )
  }

  if (
    access.papel === 'gestor' ||
    access.papel === 'analista'
  ) {
    return <>{children}</>
  }

  if (
    access.papel === 'auditor' ||
    access.papel === 'consultoria'
  ) {
    return <RestrictedWorkspace access={access} />
  }

  return (
    <main id="main-content">
      <p role="alert">
        Seu perfil não possui acesso aos projetos.
        Solicite a configuração ao administrador.
      </p>

      <button onClick={logout}>Sair</button>
    </main>
  )
}

function RestrictedWorkspace({
  access,
}: {
  access: Access
}) {
  const [screen, setScreen] = useState('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [revision, setRevision] = useState(0)

  const [data, setData] = useState<{
    usuario: User
    projetos: Project[]
  } | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const [selectedId, setSelectedId] =
    useState<number | null>(null)

  const [search, setSearch] = useState('')
  const [classification, setClassification] = useState('')
  const [dossier, setDossier] = useState('')
  const [year, setYear] = useState('')
  const [page, setPage] = useState(1)

  const projectCardRef = useRef<HTMLElement>(null)

  const auditor = access.papel === 'auditor'

  useEffect(() => {
    let active = true

    Promise.all([
      api<{ usuario: User }>('/auth/me'),
      api<{ projetos: Project[] }>(
        '/elegibilidade/dashboard',
      ),
    ])
      .then(([me, dashboard]) => {
        if (!active) return

        setData({
          usuario: me.usuario,
          projetos: dashboard.projetos.map(project => ({
            ...project,
            marcos: project.marcos || [],
            timesheets: project.timesheets || [],
            dispendios: [],
            alertas: [],
            pareceres: [],
          })),
        })
      })
      .catch(error => {
        if (active) setError(message(error))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [revision])

  const all = data?.projetos || []

  const projects = filterProjects(all, {
    busca: search,
    classificacao: classification,
    dossie: dossier,
    ano: year,
  })

  const active =
    projects.find(
      project => project.id_iniciativa === selectedId,
    ) || projects[0]

  const pages = Math.max(
    1,
    Math.ceil(projects.length / 5),
  )

  const currentPage = Math.min(page, pages)

  const classifications = [
    ...new Set(
      all.map(project => project.classificacao_pd),
    ),
  ].sort((a, b) => a.localeCompare(b, 'pt-BR'))

  const screens = [
    { id: 'dashboard', label: 'BEM+ Radar' },
    { id: 'projetos', label: 'Elegibilidade e projetos' },
    { id: 'evidencias', label: 'Marcos e evidências' },
    { id: 'pessoas', label: 'Pessoas e dedicação' },
    { id: 'perfil', label: 'Meu perfil' },
  ].filter(item => access.telas.includes(item.id))

  function navigate(id: string) {
    if (!access.telas.includes(id) || !canNavigate()) {
      return
    }

    setScreen(id)
    setMenuOpen(false)
    setNotice('')
    setError('')
  }

  function reload() {
    setLoading(true)
    setError('')
    setRevision(value => value + 1)
  }

  function open(project: Project) {
    if (!canNavigate()) return

    setSelectedId(project.id_iniciativa)
    setScreen('projetos')
    setMenuOpen(false)

    requestAnimationFrame(() => {
      projectCardRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      projectCardRef.current?.focus({
        preventScroll: true,
      })
    })
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !active ||
      !access.pode_editar_enquadramento
    ) {
      return
    }

    const body = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    )

    setBusy(true)
    setError('')
    setNotice('')

    try {
      await api(
        `/iniciativas/${active.id_iniciativa}`,
        'PUT',
        body,
      )

      setNotice('Enquadramento atualizado.')
      reload()
    } catch (error) {
      setError(message(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${
          menuOpen ? 'is-open' : ''
        }`}
      >
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
            <small>Lei do Bem · P&amp;D</small>
          </span>
        </a>

        <nav>
          {screens.map(item => (
            <button
              key={item.id}
              className={
                screen === item.id ? 'active' : ''
              }
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <footer>
          <strong>{data?.usuario.nome}</strong>
          <small>{data?.usuario.perfil}</small>

          <button
            onClick={() => {
              if (canNavigate()) logout()
            }}
          >
            Sair da conta ↗
          </button>
        </footer>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button
            className="menu-toggle"
            aria-label={
              menuOpen ? 'Fechar menu' : 'Abrir menu'
            }
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(value => !value)
            }
          >
            {menuOpen ? '✕' : '☰'}
          </button>

          <span>
            Gestão de Pesquisa e Desenvolvimento
          </span>

          <div className="actions">
            <label>
              Ano-base

              <select
                value={year}
                onChange={event => {
                  if (!canNavigate()) return

                  setYear(event.target.value)
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
                          value != null,
                      ),
                  ),
                ]
                  .sort((a, b) => b - a)
                  .map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
              </select>
            </label>

            <button
              disabled={loading || busy}
              onClick={() => {
                if (canNavigate()) reload()
              }}
            >
              Atualizar
            </button>
          </div>
        </header>

        <main id="main-content" tabIndex={-1}>
          <div className="page-title">
            <div>
              <span className="eyebrow">
                {data?.usuario.perfil}
              </span>

              <h1>
                {
                  screens.find(
                    item => item.id === screen,
                  )?.label
                }
              </h1>
            </div>
          </div>

          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}

          {notice && (
            <p className="notice success" role="status">
              {notice}
            </p>
          )}

          {loading ? (
            <p role="status">Carregando dados…</p>
          ) : !data ? (
            <button onClick={reload}>
              Tentar novamente
            </button>
          ) : (
            <>
              {screen === 'perfil' && (
                <ProfilePanel
                  user={data.usuario}
                  onUpdated={reload}
                />
              )}

              {screen === 'dashboard' && (
                <>
                  <div className="metrics">
                    <article className="card metric">
                      <span>Projetos disponíveis</span>
                      <strong>{projects.length}</strong>
                    </article>

                    <article className="card metric">
                      <span>Dossiês abertos</span>

                      <strong>
                        {
                          projects.filter(
                            project =>
                              project.status_dossie ===
                              'Aberto',
                          ).length
                        }
                      </strong>
                    </article>
                  </div>

                  {auditor ? (
                    <PortfolioProgress
                      projects={projects}
                      onOpen={open}
                    />
                  ) : (
                    <section className="card">
                      <h2>
                        Enquadramento dos projetos
                      </h2>

                      <p>
                        Consulte classificação,
                        maturidade e incerteza
                        tecnológica pela tela
                        Elegibilidade e projetos.
                      </p>

                      <button
                        onClick={() =>
                          navigate('projetos')
                        }
                      >
                        Consultar projetos
                      </button>
                    </section>
                  )}
                </>
              )}

              {screen === 'projetos' && (
                <>
                  <section className="card">
                    <h2>Projetos da carteira</h2>

                    <div className="portfolio-filters">
                      <label className="search">
                        Buscar projetos

                        <input
                          type="search"
                          value={search}
                          placeholder="Código, nome ou classificação"
                          onChange={event => {
                            if (!canNavigate()) return

                            setSearch(event.target.value)
                            setPage(1)
                          }}
                        />
                      </label>

                      <label>
                        Classificação

                        <select
                          value={classification}
                          onChange={event => {
                            if (!canNavigate()) return

                            setClassification(
                              event.target.value,
                            )
                            setPage(1)
                          }}
                        >
                          <option value="">
                            Todas as classificações
                          </option>

                          {classifications.map(value => (
                            <option
                              key={value}
                              value={value}
                            >
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Dossiê

                        <select
                          value={dossier}
                          onChange={event => {
                            if (!canNavigate()) return

                            setDossier(event.target.value)
                            setPage(1)
                          }}
                        >
                          <option value="">
                            Todos os dossiês
                          </option>

                          <option value="Aberto">
                            Aberto
                          </option>

                          <option value="Fechado">
                            Fechado
                          </option>
                        </select>
                      </label>

                      <button
                        onClick={() => {
                          if (!canNavigate()) return

                          setSearch('')
                          setClassification('')
                          setDossier('')
                          setYear('')
                          setPage(1)
                        }}
                      >
                        Limpar filtros
                      </button>
                    </div>

                    <p role="status">
                      {projects.length} projetos encontrados
                    </p>

                    <div
                      className="table-wrap"
                      role="region"
                      aria-label="Tabela de registros com rolagem horizontal"
                      tabIndex={0}
                    >
                      <table>
                        <thead>
                          <tr>
                            <th>Projeto</th>
                            <th>Classificação</th>
                            <th>TRL</th>
                            <th>Dossiê</th>
                            <th>Ação</th>
                          </tr>
                        </thead>

                        <tbody>
                          {projects
                            .slice(
                              (currentPage - 1) * 5,
                              currentPage * 5,
                            )
                            .map(project => (
                              <tr
                                key={
                                  project.id_iniciativa
                                }
                                className="project-row"
                                tabIndex={0}
                                aria-label={`Abrir projeto ${project.codigo}`}
                                onClick={event => {
                                  const target =
                                    event.target as HTMLElement

                                  if (
                                    !target.closest('button')
                                  ) {
                                    open(project)
                                  }
                                }}
                                onKeyDown={event => {
                                  if (
                                    event.target ===
                                      event.currentTarget &&
                                    ['Enter', ' '].includes(
                                      event.key,
                                    )
                                  ) {
                                    event.preventDefault()
                                    open(project)
                                  }
                                }}
                              >
                                <td>
                                  <small>
                                    {project.codigo}
                                  </small>

                                  <strong>
                                    {project.nome}
                                  </strong>
                                </td>

                                <td>
                                  {
                                    project.classificacao_pd
                                  }
                                </td>

                                <td>
                                  {project.trl_inicial}
                                  {' → '}
                                  {project.score_trl}
                                </td>

                                <td>
                                  {project.status_dossie}
                                </td>

                                <td>
                                  <button
                                    onClick={() =>
                                      open(project)
                                    }
                                  >
                                    Abrir projeto
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>

                    {!projects.length && (
                      <p className="empty">
                        Nenhum projeto encontrado.
                      </p>
                    )}

                    <div className="pager">
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

                  {active && (
                    <section
                      className="card"
                      ref={projectCardRef}
                      tabIndex={-1}
                      aria-label={`Detalhes do projeto ${active.codigo}`}
                    >
                      <h2>
                        {active.codigo} — {active.nome}
                      </h2>

                      <p>{active.descricao}</p>

                      {!auditor && (
                        <details className="formpd-details">
                          <summary>
                            Complementar dados técnicos
                            do FORMP&D
                          </summary>

                          <FormpdEditor
                            key={active.id_iniciativa}
                            projectId={
                              active.id_iniciativa
                            }
                            technicalOnly
                            onSaved={() => {
                              setRevision(
                                value => value + 1,
                              )
                            }}
                          />
                        </details>
                      )}

                      <p>
                        Incerteza tecnológica:{' '}
                        {active.barreira_incerteza ||
                          'Não informada'}
                      </p>

                      {auditor ? (
                        <>
                          <p>
                            Classificação:{' '}
                            {active.classificacao_pd}
                          </p>

                          <div className="actions">
                            <button
                              onClick={() =>
                                navigate('evidencias')
                              }
                            >
                              Consultar marcos
                            </button>

                            <button
                              onClick={() =>
                                navigate('pessoas')
                              }
                            >
                              Consultar pessoas e horas
                            </button>
                          </div>
                        </>
                      ) : (
                        <form
                          key={`${active.id_iniciativa}:${active.revisao}`}
                          onSubmit={save}
                        >
                          <fieldset
                            className="account-fields"
                            disabled={
                              busy ||
                              active.status_dossie ===
                                'Fechado' ||
                              !access.pode_editar_enquadramento
                            }
                          >
                            <legend>
                              Enquadramento
                            </legend>

                            <div className="form-grid">
                              <label>
                                Classificação de P&D

                                <input
                                  name="classificacao_pd"
                                  required
                                  defaultValue={
                                    active.classificacao_pd
                                  }
                                />
                              </label>

                              <label>
                                Tipo de inovação

                                <input
                                  name="tipo_inovacao"
                                  required
                                  defaultValue={
                                    active.tipo_inovacao
                                  }
                                />
                              </label>

                              <label>
                                TRL inicial

                                <input
                                  name="trl_inicial"
                                  type="number"
                                  min={1}
                                  max={9}
                                  required
                                  defaultValue={
                                    active.trl_inicial
                                  }
                                />
                              </label>

                              <label>
                                TRL atual

                                <input
                                  name="score_trl"
                                  type="number"
                                  min={1}
                                  max={9}
                                  required
                                  defaultValue={
                                    active.score_trl
                                  }
                                />
                              </label>

                              <label>
                                Elegibilidade informada (%)

                                <input
                                  name="elegibilidade_pct"
                                  type="number"
                                  min={0}
                                  max={100}
                                  step="0.01"
                                  required
                                  defaultValue={String(
                                    active.elegibilidade_pct,
                                  )}
                                />
                              </label>

                              <label>
                                Risco informado

                                <select
                                  name="risco_glosa"
                                  defaultValue={
                                    active.risco_glosa.split(
                                      ' (',
                                    )[0]
                                  }
                                >
                                  <option>Baixo</option>
                                  <option>Médio</option>
                                  <option>Alto</option>
                                </select>
                              </label>

                              <label className="full">
                                Incerteza tecnológica

                                <textarea
                                  name="barreira_incerteza"
                                  required
                                  rows={4}
                                  defaultValue={
                                    active.barreira_incerteza ||
                                    ''
                                  }
                                />
                              </label>
                            </div>

                            <button
                              className="primary"
                              disabled={busy}
                            >
                              {busy
                                ? 'Salvando…'
                                : 'Salvar enquadramento'}
                            </button>
                          </fieldset>

                          {active.status_dossie ===
                            'Fechado' && (
                            <p className="notice">
                              Dossiê fechado. Solicite
                              a reabertura ao gestor.
                            </p>
                          )}
                        </form>
                      )}
                    </section>
                  )}
                </>
              )}

              {auditor &&
                ['evidencias', 'pessoas'].includes(
                  screen,
                ) && (
                  <>
                    <label className="project-picker">
                      Projeto

                      <select
                        value={
                          active?.id_iniciativa || ''
                        }
                        onChange={event =>
                          setSelectedId(
                            Number(event.target.value),
                          )
                        }
                      >
                        {!projects.length && (
                          <option value="">
                            Nenhum projeto
                          </option>
                        )}

                        {projects.map(project => (
                          <option
                            key={project.id_iniciativa}
                            value={project.id_iniciativa}
                          >
                            {project.codigo}
                            {' — '}
                            {project.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    {screen === 'evidencias' &&
                      (active?.marcos.length ? (
                        active.marcos.map(marco => (
                          <section
                            className="card"
                            key={marco.id_marco}
                          >
                            <span className="badge">
                              {marco.status_validacao}
                            </span>

                            <h2>{marco.titulo}</h2>
                            <small>{marco.periodo}</small>
                            <p>{marco.descricao}</p>

                            {marco.evidencias.map(
                              evidencia => (
                                <article
                                  className="record"
                                  key={
                                    evidencia.id_evidencia
                                  }
                                >
                                  <div>
                                    <strong>
                                      {evidencia.nome}
                                    </strong>

                                    <small>
                                      {evidencia.status}
                                    </small>

                                    <code>
                                      SHA-256:{' '}
                                      {evidencia.sha256}
                                    </code>
                                  </div>

                                  <button
                                    disabled={busy}
                                    onClick={async () => {
                                      setBusy(true)
                                      setError('')

                                      try {
                                        await download(
                                          evidencia.id_evidencia,
                                          evidencia.nome,
                                        )
                                      } catch (error) {
                                        setError(
                                          message(error),
                                        )
                                      } finally {
                                        setBusy(false)
                                      }
                                    }}
                                  >
                                    Baixar
                                  </button>
                                </article>
                              ),
                            )}

                            {!marco.evidencias.length && (
                              <p>
                                Nenhuma evidência anexada.
                              </p>
                            )}
                          </section>
                        ))
                      ) : (
                        <p className="empty">
                          Nenhum marco registrado.
                        </p>
                      ))}

                    {screen === 'pessoas' && (
                      <section className="card">
                        <h2>Pessoas e dedicação</h2>

                        <div
                          className="table-wrap"
                          role="region"
                          aria-label="Tabela de registros com rolagem horizontal"
                          tabIndex={0}
                        >
                          <table>
                            <thead>
                              <tr>
                                <th>Colaborador</th>
                                <th>Regime</th>
                                <th>Referência</th>
                                <th>Horas</th>
                                <th>Justificativa</th>
                                <th>Status</th>
                              </tr>
                            </thead>

                            <tbody>
                              {active?.timesheets.map(
                                item => (
                                  <tr
                                    key={
                                      item.id_timesheet
                                    }
                                  >
                                    <td>
                                      {
                                        item.colaborador_nome
                                      }
                                    </td>

                                    <td>
                                      {item.cargo_regime}
                                    </td>

                                    <td>
                                      {date(item.data)}
                                    </td>

                                    <td>
                                      {number(
                                        item.horas_mes,
                                      )}
                                    </td>

                                    <td>
                                      {item.justificativa ||
                                        'Não informada'}
                                    </td>

                                    <td>{item.status}</td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>

                        {!active?.timesheets.length && (
                          <p>
                            Nenhuma dedicação registrada.
                          </p>
                        )}
                      </section>
                    )}
                  </>
                )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}