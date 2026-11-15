import { useEffect, useState } from 'react'

import {
  api,
  saveFile,
  textoApi,
} from '../lib/api'

import { DEMO_MODE } from '../lib/demo'
import { money, number } from '../lib/metrics'
import { canNavigate } from '../lib/navigation'

import FormpdEditor from './FormpdEditor'

import '../formpd.css'

type Activity = {
  id_iniciativa: number
  codigo_interno: string
  titulo: string
  revisao: number
  descricao: string | null
  classificacao_registrada: string
  barreira_tecnologica: string | null

  trl_inicial_registrado: number
  trl_atual_registrado: number
  trl_final_ano_base_confirmado: number | null

  pendencias_preparacao: string[]

  pendencias_acoes: {
    mensagem: string
    destino: string
    campo?: string
  }[]

  completude_tecnica: {
    preenchidos: number
    total: number
  }

  dispendios: {
    id_dispendio: number
    descricao: string
  }[]

  recursos_humanos: {
    colaborador_id: string
    colaborador_nome: string
  }[]
}

type Section = {
  situacao: string
  dados: string | null
  valor_informado?: string | null
}

type Report = {
  titulo: string
  ano_base: number
  gerado_em: string
  finalidade: string
  situacao: string

  referencia: {
    guia: string
    ano_base_documentado: number
    url: string
  }

  completude: {
    preenchidos: number
    total: number
  }

  conciliacao: {
    regra: string
    horas_pendentes: string
  }

  resumo: {
    total_projetos: number
    horas_registradas: string
    horas_com_aprovacao_completa: string
    custos_pessoal_registrados: string
    custos_pessoal_com_aprovacao_completa: string
    dispendios_registrados: string
  }

  secoes: {
    identificacao_empresa: {
      razao_social: string | null
      cnpj: string | null
    }

    programas_atividades_pdi: Activity[]

    pesquisador_exclusivo: Section
    artigo_19a: Section
    incentivos_fiscais: Section
    aperfeicoamento_lei_do_bem: Section

    relatorio_preenchimento: {
      pendencias_gerais: string[]
      total_pendencias_projetos: number
    }
  }
}

type Props = {
  year: string
  manager?: boolean
  onOpen?: (
    id: number,
    destination: string,
  ) => void
}

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Não foi possível preparar o dossiê.'

function focusEditor(id: string) {
  requestAnimationFrame(() => {
    const item =
      document.getElementById(id)

    item?.scrollIntoView({
      block: 'start',
    })

    item?.focus()
  })
}

export default function FormpdPanel({
  year,
  manager = false,
  onOpen,
}: Props) {
  const [revision, setRevision] =
    useState(0)

  const [selectedId, setSelectedId] =
    useState<number | null>(null)

  const key = `${year}:${revision}`

  const [result, setResult] = useState<{
    key: string
    data: Report | null
    error: string
  }>({
    key: '',
    data: null,
    error: '',
  })

  const [busy, setBusy] =
    useState(false)

  const [error, setError] =
    useState('')

  const [notice, setNotice] =
    useState('')

  useEffect(() => {
    let active = true

    if (!year || DEMO_MODE) return

    api<Report>(
      `/relatorios/formpd?ano_base=${encodeURIComponent(year)}`,
    )
      .then(data => {
        if (active) {
          setResult({
            key,
            data,
            error: '',
          })
        }
      })
      .catch(error => {
        if (active) {
          setResult(previous => ({
            key,

            data:
              previous.data?.ano_base ===
              Number(year)
                ? previous.data
                : null,

            error: message(error),
          }))
        }
      })

    return () => {
      active = false
    }
  }, [year, key])

  if (DEMO_MODE) {
    return (
      <section className="card">
        <h2>
          Dossiê de apoio ao FORMP&amp;D
        </h2>

        <p>
          Desative o modo de demonstração e entre
          com uma conta autorizada para preparar
          o dossiê com os dados do backend.
        </p>
      </section>
    )
  }

  if (!year) {
    return (
      <section className="card formpd-empty">
        <span className="badge">
          Um exercício por dossiê
        </span>

        <h2>
          Prepare o FORMP&amp;D com os dados da carteira
        </h2>

        <p>
          Selecione um ano-base no cabeçalho
          para conferir os registros, completar
          as informações e exportar o material
          de apoio.
        </p>
      </section>
    )
  }

  if (
    !result.data ||
    result.data.ano_base !== Number(year)
  ) {
    if (result.key !== key) {
      return (
        <p className="notice" role="status">
          Preparando o dossiê de {year}…
        </p>
      )
    }

    return (
      <section className="card">
        <p
          className="notice error"
          role="alert"
        >
          {result.error ||
            'Dossiê indisponível.'}
        </p>

        <button
          onClick={() =>
            setRevision(value => value + 1)
          }
        >
          Tentar novamente
        </button>
      </section>
    )
  }

  const report = result.data

  const loading =
    result.key !== key

  const projects =
    report.secoes.programas_atividades_pdi

  const active =
    projects.find(
      project =>
        project.id_iniciativa === selectedId,
    ) || projects[0]

  const pct =
    report.completude.total
      ? Math.round(
          (
            100 *
            report.completude.preenchidos
          ) / report.completude.total,
        )
      : 0

  async function exportCsv() {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      const content = await textoApi(
        `/relatorios/formpd?ano_base=${report.ano_base}&formato=csv`,
      )

      saveFile(
        new Blob(
          [
            '\uFEFF',
            content.replace(/^\uFEFF/, ''),
          ],
          {
            type: 'text/csv;charset=utf-8',
          },
        ),
        `apoio-formpd-${report.ano_base}.csv`,
      )

      setNotice(
        'Download solicitado com os dados salvos no servidor. Confira os downloads do navegador.',
      )
    } catch (error) {
      setError(message(error))
    } finally {
      setBusy(false)
    }
  }

  async function print() {
    const preview =
      window.open('', '_blank')

    if (!preview) {
      setError(
        'Permita abrir a janela de impressão neste navegador.',
      )

      return
    }

    preview.opener = null

    preview.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <title>Preparando dossiê</title>
        </head>
        <body>
          <p>Preparando versão para impressão…</p>
        </body>
      </html>
    `)

    preview.document.close()

    setBusy(true)
    setError('')
    setNotice('')

    try {
      const html = await textoApi(
        `/relatorios/formpd?ano_base=${report.ano_base}&formato=html`,
      )

      if (preview.closed) return

      preview.document.open()
      preview.document.write(html)
      preview.document.close()
      preview.focus()
      preview.print()
    } catch (error) {
      preview.close()
      setError(message(error))
    } finally {
      setBusy(false)
    }
  }

  function correction(
    project: Activity,
    destination: string,
  ) {
    if (
      destination.startsWith('complemento')
    ) {
      if (!canNavigate()) return

      setSelectedId(
        project.id_iniciativa,
      )

      focusEditor(
        'formpd-project-editor',
      )
    } else {
      onOpen?.(
        project.id_iniciativa,
        destination,
      )
    }
  }

  return (
    <div
      className="formpd-workspace"
      aria-busy={loading}
    >
      <section className="card formpd-hero">
        <span className="badge">
          Preparação do exercício{' '}
          {report.ano_base}
        </span>

        <h2>{report.titulo}</h2>

        <p>{report.finalidade}</p>

        <div className="formpd-completeness">
          <div>
            <strong>
              {pct}% dos campos de preparação preenchidos
            </strong>

            <small>
              {report.completude.preenchidos}
              {' de '}
              {report.completude.total}
              {' campos. '}
              Preenchimento não significa aprovação
              ou elegibilidade.
            </small>
          </div>

          <progress
            max={100}
            value={pct}
            aria-label="Preenchimento dos campos de preparação"
          />
        </div>

        <p className="muted">
          {report.situacao}
          {' · '}
          Atualizado em{' '}
          {new Date(
            report.gerado_em,
          ).toLocaleString('pt-BR')}
        </p>

        <div className="actions">
          <button
            className="primary"
            disabled={busy || loading}
            onClick={() => void print()}
          >
            Imprimir / salvar PDF
          </button>

          <button
            disabled={busy || loading}
            onClick={() => void exportCsv()}
          >
            Exportar planilha de apoio (CSV)
          </button>

          <button
            disabled={busy || loading}
            onClick={() => {
              setError('')
              setNotice('')
              setRevision(value => value + 1)
            }}
          >
            Atualizar dossiê
          </button>
        </div>

        <p className="muted">
          As exportações usam os dados salvos.
          A planilha é de apoio; a entrega ocorre
          no sistema oficial. Na impressão,
          escolha “Salvar como PDF”.
        </p>

        {loading && (
          <p role="status">
            Atualizando dados salvos…
          </p>
        )}

        {(error || result.error) && (
          <p
            className="notice error"
            role="alert"
          >
            {error || result.error}

            {result.error && (
              <button
                onClick={() =>
                  setRevision(value => value + 1)
                }
              >
                Tentar novamente
              </button>
            )}
          </p>
        )}

        {notice && (
          <p
            className="notice success"
            role="status"
          >
            {notice}
          </p>
        )}

        <details>
          <summary>
            Referência e conferência do modelo
          </summary>

          <p>
            {report.referencia.guia},
            ano-base documentado{' '}
            {report.referencia.ano_base_documentado}.

            {report.ano_base !==
              report.referencia.ano_base_documentado &&
              ' O modelo aplicável a este ano-base ainda precisa ser conferido.'}

            {' '}

            <a
              href={report.referencia.url}
              target="_blank"
              rel="noreferrer"
            >
              Abrir guia de referência
            </a>
          </p>
        </details>
      </section>

      <div className="metrics">
        <article className="card metric">
          <span>Projetos do ano-base</span>

          <strong>
            {report.resumo.total_projetos}
          </strong>
        </article>

        <article className="card metric">
          <span>
            Outros dispêndios registrados
          </span>

          <strong>
            {money(
              report.resumo.dispendios_registrados,
            )}
          </strong>
        </article>

        <article className="card metric">
          <span>
            Horas com aprovação completa
          </span>

          <strong>
            {number(
              report.resumo.horas_com_aprovacao_completa,
            )}{' '}
            h
          </strong>

          <small>
            {number(
              report.conciliacao.horas_pendentes,
            )}{' '}
            h pendentes
          </small>
        </article>

        <article className="card metric">
          <span>
            Custo de pessoal aprovado
          </span>

          <strong>
            {money(
              report.resumo
                .custos_pessoal_com_aprovacao_completa,
            )}
          </strong>
        </article>
      </div>

      <section className="card">
        <h2>
          1. Identificação da empresa
        </h2>

        <div className="detail-grid">
          <span>
            Razão social

            <strong>
              {report.secoes.identificacao_empresa
                .razao_social || 'Não informada'}
            </strong>
          </span>

          <span>
            CNPJ

            <strong>
              {report.secoes.identificacao_empresa
                .cnpj || 'Não informado'}
            </strong>
          </span>
        </div>

        <details className="formpd-details">
          <summary
            id="formpd-company-editor"
            tabIndex={-1}
          >
            Preencher empresa e informações anuais
          </summary>

          <FormpdEditor
            key={year}
            year={year}
            manager={manager}
            onSaved={() =>
              setRevision(value => value + 1)
            }
          />
        </details>
      </section>

      <section className="card">
        <h2>
          2. Programas e atividades de PD&amp;I
        </h2>

        {!projects.length && (
          <p className="empty">
            Nenhum projeto neste ano-base.
            Cadastre um projeto na carteira
            para começar.
          </p>
        )}

        {projects.map(project => (
          <article
            className="progress-project"
            key={project.id_iniciativa}
          >
            <div className="section-title">
              <h3>
                {project.codigo_interno}
                {' — '}
                {project.titulo}
              </h3>

              <span className="badge">
                {project.pendencias_preparacao.length}
                {' pendências'}
              </span>
            </div>

            <small>
              Revisão {project.revisao}
              {' · '}
              {project.classificacao_registrada}
              {' · '}
              {project.completude_tecnica.preenchidos}
              {'/'}
              {project.completude_tecnica.total}
              {' campos técnicos'}
            </small>

            <p>
              {project.descricao ||
                'Descrição não informada.'}
            </p>

            <p>
              TRL inicial:{' '}
              {project.trl_inicial_registrado}
              {' · '}
              Atual:{' '}
              {project.trl_atual_registrado}
              {' · '}
              Final confirmado do exercício:{' '}
              {project.trl_final_ano_base_confirmado ??
                'Não informado'}
            </p>

            <details>
              <summary>
                Conferir e resolver pendências
              </summary>

              {!project.pendencias_acoes.length && (
                <p>
                  Sem pendências automáticas de preparação.
                  Encaminhe os dados para conferência.
                </p>
              )}

              <ul className="formpd-pending">
                {project.pendencias_acoes.map(
                  (item, index) => (
                    <li key={index}>
                      <span>
                        {item.mensagem}
                      </span>

                      <button
                        onClick={() =>
                          correction(
                            project,
                            item.destino,
                          )
                        }
                      >
                        Corrigir

                        <span className="sr-only">
                          {' — '}
                          {item.mensagem}
                        </span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
            </details>

            <div className="actions">
              <button
                onClick={() =>
                  correction(
                    project,
                    'complemento',
                  )
                }
              >
                Complementar projeto
              </button>

              {onOpen && (
                <button
                  onClick={() =>
                    onOpen(
                      project.id_iniciativa,
                      'projetos',
                    )
                  }
                >
                  Abrir dossiê do projeto
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      {active && (
        <section
          className="card"
          id="formpd-project-editor"
          tabIndex={-1}
        >
          <div className="section-title">
            <h2>
              Complementar projeto
            </h2>

            <label>
              Projeto do exercício

              <select
                value={active.id_iniciativa}
                onChange={event => {
                  if (canNavigate()) {
                    setSelectedId(
                      Number(event.target.value),
                    )
                  }
                }}
              >
                {projects.map(project => (
                  <option
                    key={project.id_iniciativa}
                    value={project.id_iniciativa}
                  >
                    {project.codigo_interno}
                    {' — '}
                    {project.titulo}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <FormpdEditor
            key={`${year}:${active.id_iniciativa}`}
            projectId={active.id_iniciativa}
            year={year}
            expenses={active.dispendios}
            people={active.recursos_humanos}
            onSaved={() =>
              setRevision(value => value + 1)
            }
          />
        </section>
      )}

      <section className="card">
        <h2>
          3. Dispêndios do programa
        </h2>

        <p className="notice">
          {report.conciliacao.regra}
        </p>

        <div className="detail-grid">
          <span>
            Horas registradas

            <strong>
              {number(
                report.resumo.horas_registradas,
              )}{' '}
              h
            </strong>
          </span>

          <span>
            Custo pessoal registrado

            <strong>
              {money(
                report.resumo.custos_pessoal_registrados,
              )}
            </strong>
          </span>

          <span>
            Custo pessoal com aprovação completa

            <strong>
              {money(
                report.resumo
                  .custos_pessoal_com_aprovacao_completa,
              )}
            </strong>
          </span>

          <span>
            Dispêndios registrados

            <strong>
              {money(
                report.resumo.dispendios_registrados,
              )}
            </strong>
          </span>
        </div>

        <p className="muted">
          Somente registros do exercício selecionado.
          Valores registrados não equivalem automaticamente
          a valores elegíveis ou a benefício fiscal.
        </p>
      </section>

      {(
        [
          'pesquisador_exclusivo',
          'artigo_19a',
          'incentivos_fiscais',
        ] as const
      ).map((sectionKey, index) => (
        <section
          className="card"
          key={sectionKey}
        >
          <h2>
            {index + 4}.
            {' '}
            {
              [
                'Pesquisador exclusivo',
                'Art. 19-A',
                'Incentivos fiscais',
              ][index]
            }
          </h2>

          <span className="badge">
            {report.secoes[sectionKey].situacao}
          </span>

          <p className="formpd-text">
            {report.secoes[sectionKey].dados ||
              'Preencha as informações anuais da empresa e registre a avaliação do responsável.'}
          </p>

          {sectionKey === 'incentivos_fiscais' &&
            report.secoes[sectionKey]
              .valor_informado != null && (
              <p>
                Valor declarado pelo responsável:
                {' '}

                <strong>
                  {money(
                    report.secoes[sectionKey]
                      .valor_informado,
                  )}
                </strong>
              </p>
            )}

          <button
            onClick={() => {
              const summary =
                document.getElementById(
                  'formpd-company-editor',
                )

              if (
                summary?.parentElement instanceof
                HTMLDetailsElement
              ) {
                summary.parentElement.open = true
              }

              focusEditor(
                'formpd-company-editor',
              )
            }}
          >
            Editar informações anuais
          </button>
        </section>
      ))}

      <section className="card">
        <h2>
          7. Relatório de preenchimento
        </h2>

        <ul className="pending-list">
          {report.secoes.relatorio_preenchimento
            .pendencias_gerais.map(
              (item, index) => (
                <li key={index}>
                  {item}
                </li>
              ),
            )}
        </ul>

        <p>
          {
            report.secoes.relatorio_preenchimento
              .total_pendencias_projetos
          }{' '}
          itens de preparação identificados
          nos projetos.
        </p>

        <p>
          A revisão do gestor, os pareceres e
          a conferência do modelo continuam
          necessários.
        </p>
      </section>

      <section className="card">
        <h2>
          8. Aperfeiçoamento da Lei do Bem
        </h2>

        <p className="formpd-text">
          {report.secoes.aperfeicoamento_lei_do_bem
            .dados ||
            'Registre as observações nas informações anuais da empresa.'}
        </p>
      </section>
    </div>
  )
}