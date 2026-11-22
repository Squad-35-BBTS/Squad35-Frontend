import { useState } from 'react'
import type { Project } from '../types'

type Props = {
  projects: Project[]
  onOpen: (project: Project) => void
  onFinalize?: (project: Project) => void
  busy?: boolean
}

type Filter = 'all' | 'pending' | 'complete'

function calculateProgress(project: Project) {
  const milestones = project.marcos || []
  const timesheets = project.timesheets || []

  const stages = [
    {
      name: 'Mapeamento',
      completed: Boolean(
        project.nome?.trim() &&
          project.descricao?.trim() &&
          project.ano_base &&
          project.barreira_incerteza?.trim(),
      ),
    },
    {
      name: 'Marcos',
      completed:
        milestones.length > 0 &&
        milestones.every(
          milestone =>
            milestone.status_validacao === 'Validado' &&
            Boolean(
              milestone.validado_em &&
                milestone.validado_por_id,
            ),
        ),
    },
    {
      name: 'Evidências',
      completed:
        milestones.length > 0 &&
        milestones.every(
          milestone =>
            milestone.evidencias.length > 0 &&
            milestone.evidencias.every(
              evidence =>
                evidence.status === 'Validado' &&
                Boolean(
                  evidence.validado_em &&
                    evidence.validado_por_id,
                ),
            ),
        ),
    },
    {
      name: 'Dedicação de pessoas',
      completed:
        timesheets.length > 0 &&
        timesheets.every(
          timesheet =>
            timesheet.status === 'Aprovado pelo Gestor' &&
            Boolean(
              timesheet.justificativa?.trim() &&
                timesheet.aprovado_em &&
                timesheet.aprovado_por_id,
            ) &&
            new Date(timesheet.data).getUTCFullYear() ===
              project.ano_base,
        ),
    },
    {
      name: 'Dossiê',
      completed: project.status_dossie === 'Fechado',
    },
  ]

  const completed = stages.filter(
    stage => stage.completed,
  ).length

  return {
    stages,
    completed,
    percentage: Math.round(
      (completed / stages.length) * 100,
    ),
  }
}

export default function PortfolioProgress({
  projects,
  onOpen,
  onFinalize,
  busy = false,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const activeProjects = projects.filter(
    project => project.status !== 'Concluído',
  )

  const entries = activeProjects.map(project => ({
    project,
    ...calculateProgress(project),
  }))

  const average = entries.length
    ? Math.round(
        entries.reduce(
          (total, entry) => total + entry.percentage,
          0,
        ) / entries.length,
      )
    : 0

  const completedCount = entries.filter(
    entry => entry.percentage === 100,
  ).length

  const visible = entries.filter(entry => {
    if (filter === 'complete') {
      return entry.percentage === 100
    }

    if (filter === 'pending') {
      return entry.percentage < 100
    }

    return true
  })

  const filters = [
    ['all', 'Todos'],
    ['pending', 'Com pendências'],
    ['complete', 'Etapas concluídas'],
  ] as const

  return (
    <section className="card portfolio-progress portfolio-overview">
      <div className="section-title">
        <div>
          <span className="eyebrow">
            Visão da carteira
          </span>

          <h2>Progresso dos projetos</h2>

          <p>
            Acompanhe as etapas e identifique o que
            precisa de atenção.
          </p>
        </div>

        <div className="portfolio-average">
          <strong>{average}%</strong>
          <span>Média no recorte</span>
        </div>
      </div>

      <div
        className="portfolio-summary"
        aria-label="Resumo do acompanhamento"
      >
        <span>
          <strong>{entries.length}</strong>
          {' '}projetos
        </span>

        <span>
          <strong>
            {entries.length - completedCount}
          </strong>
          {' '}com etapas pendentes
        </span>

        <span>
          <strong>{completedCount}</strong>
          {' '}com todas as etapas registradas
        </span>
      </div>

      <div
        className="portfolio-switch"
        role="group"
        aria-label="Filtrar progresso dos projetos"
      >
        {filters.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="portfolio-result" role="status">
        {visible.length} de {entries.length} projetos
        neste filtro
      </p>

      <div className="portfolio-project-grid">
        {visible.map(entry => (
          <article
            className="portfolio-project-card"
            key={entry.project.id_iniciativa}
          >
            <div className="portfolio-project-top">
              <span className="eyebrow">
                {entry.project.codigo}
              </span>

              <span
                className={
                  `portfolio-percentage ${
                    entry.percentage === 100
                      ? 'is-complete'
                      : ''
                  }`
                }
              >
                {entry.percentage}%
              </span>
            </div>

            <button
              type="button"
              className="project-title-button"
              onClick={() => onOpen(entry.project)}
            >
              {entry.project.nome}
            </button>

            <progress
              value={entry.percentage}
              max={100}
              aria-label={
                `Progresso de ${entry.project.nome}`
              }
            />

            <small>
              {entry.completed} de {entry.stages.length}
              {' '}etapas concluídas
            </small>

            <details className="portfolio-stage-details">
              <summary>
                Ver etapas do projeto
              </summary>

              <ul className="portfolio-stage-list">
                {entry.stages.map(stage => (
                  <li
                    key={stage.name}
                    className={
                      stage.completed ? 'is-complete' : ''
                    }
                  >
                    <span aria-hidden="true">
                      {stage.completed ? '✓' : '○'}
                    </span>

                    <span>{stage.name}</span>

                    <small>
                      {stage.completed
                        ? 'Concluído'
                        : 'Pendente'}
                    </small>
                  </li>
                ))}
              </ul>
            </details>

            <button
              type="button"
              className="portfolio-open"
              onClick={() => onOpen(entry.project)}
            >
              Abrir projeto

              <span aria-hidden="true">↗</span>
            </button>

            {entry.completed === entry.stages.length && onFinalize && (
              <button
                type="button"
                className="primary portfolio-finalize"
                disabled={busy}
                onClick={() => onFinalize(entry.project)}
              >
                Finalizar projeto
              </button>
            )}
          </article>
        ))}
      </div>

      {!visible.length && (
        <p className="empty">
          {entries.length
            ? 'Nenhum projeto corresponde a este filtro.'
            : projects.length
              ? 'Todos os projetos deste recorte já foram finalizados. Consulte o histórico em Elegibilidade e projetos.'
              : 'Nenhum projeto neste ano-base.'}
        </p>
      )}

      <p className="muted portfolio-disclaimer">
        Cada etapa representa 20% do acompanhamento.
        Este indicador não representa elegibilidade,
        aprovação fiscal ou autorização para fechar
        o dossiê.
      </p>
    </section>
  )
}
