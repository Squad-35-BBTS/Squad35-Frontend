import type { Project } from '../types'

export function totals(projects: Project[]) {
  const expenses = projects.flatMap(
    project => project.dispendios,
  )

  const timesheets = projects.flatMap(
    project => project.timesheets,
  )

  const approved = timesheets.filter(
    timesheet =>
      timesheet.status === 'Aprovado pelo Gestor',
  )

  const sum = (values: (number | string)[]) =>
    values.reduce<number>(
      (total, value) =>
        total + Math.round(Number(value) * 100),
      0,
    ) / 100

  return {
    count: projects.length,

    eligible: projects.filter(
      project =>
        Number(project.elegibilidade_pct) >= 85,
    ).length,

    partial: projects.filter(
      project =>
        Number(project.elegibilidade_pct) >= 60 &&
        Number(project.elegibilidade_pct) < 85,
    ).length,

    highRisk: projects.filter(
      project =>
        project.risco_glosa.startsWith('Alto'),
    ).length,

    expenses: sum(
      expenses.map(expense => expense.valor),
    ),

    hours: sum(
      timesheets.map(timesheet => timesheet.horas_mes),
    ),

    approvedHours: sum(
      approved.map(timesheet => timesheet.horas_mes),
    ),

    personnel: sum(
      approved.map(
        timesheet => timesheet.custo_apropriado,
      ),
    ),

    documents: projects.reduce(
      (total, project) =>
        total +
        project.marcos.reduce(
          (subtotal, milestone) =>
            subtotal + milestone.evidencias.length,
          0,
        ),
      0,
    ),

    alerts: projects
      .flatMap(project => project.alertas)
      .filter(alert => alert.status === 'Aberto'),

    tracks: [
      ...new Set(
        projects.map(
          project => project.trilha_tecnologica,
        ),
      ),
    ].map(name => {
      const members = projects.filter(
        project =>
          project.trilha_tecnologica === name,
      )

      return {
        name,
        count: members.length,

        cost: sum(
          members
            .flatMap(project => project.dispendios)
            .map(expense => expense.valor),
        ),

        hours: sum(
          members
            .flatMap(project => project.timesheets)
            .map(timesheet => timesheet.horas_mes),
        ),
      }
    }),
  }
}

export const money = (value: string | number) =>
  Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

export const number = (value: string | number) =>
  Number(value).toLocaleString('pt-BR', {
    maximumFractionDigits: 2,
  })

export const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
      })
    : 'Não informado'