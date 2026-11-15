import type { Project } from '../types'

type Props = {
  projects: Project[]
  onOpen: (project: Project) => void
}

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
}: Props) {
  const entries = projects.map(project => ({
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

  return (
    <section className="card portfolio-progress">
      <div className="section-title">
        <div>
          <h2>Progresso dos projetos</h2>

          <p>
            Acompanhe o preenchimento e os status registrados
            em cada etapa.
          </p>
        </div>

        {entries.length > 0 && (
          <strong>{average}% no recorte</strong>
        )}
      </div>

      {!entries.length ? (
        <p className="empty">
          Nenhum projeto neste ano-base.
        </p>
      ) : (
        entries.map(entry => (
          <article
            className="progress-project"
            key={entry.project.id_iniciativa}
          >
            <div className="section-title">
              <button
                type="button"
                className="project-title-button"
                onClick={() => onOpen(entry.project)}
              >
                {entry.project.codigo}
                {' — '}
                {entry.project.nome}
              </button>

              <strong>
                {entry.percentage}%
              </strong>
            </div>

            <progress
              value={entry.percentage}
              max={100}
              aria-label={`Progresso de ${entry.project.nome}`}
            />

            <small>
              {entry.completed} de {entry.stages.length}{' '}
              etapas concluídas
            </small>

            <ul className="progress-stages">
              {entry.stages.map(stage => (
                <li key={stage.name}>
                  <span aria-hidden="true">
                    {stage.completed ? '✓' : '○'}
                  </span>
                  {' '}
                  {stage.name}
                  {': '}
                  {stage.completed
                    ? 'Concluído'
                    : 'Pendente'}
                </li>
              ))}
            </ul>
          </article>
        ))
      )}

      <p className="muted">
        Cada etapa representa 20% do acompanhamento.
        Este indicador não representa elegibilidade,
        aprovação fiscal ou autorização para fechar o dossiê.
      </p>
    </section>
  )
}