import type { Project } from '../types'

function sum(values: (string | number)[]) {
  const cents = values.reduce<bigint>((total, value) => {
    const text = String(value)

    if (!/^\d+(\.\d{1,2})?$/.test(text)) {
      throw new Error('Valor decimal inválido nos registros.')
    }

    const [whole, fraction = ''] = text.split('.')

    return (
      total +
      BigInt(whole) * 100n +
      BigInt(fraction.padEnd(2, '0'))
    )
  }, 0n)

  return `${cents / 100n}.${String(cents % 100n).padStart(2, '0')}`
}

export function totals(projects: Project[]) {
  const expenses = projects.flatMap(project =>
    project.dispendios.filter(
      expense =>
        project.ano_base ===
        new Date(expense.data).getUTCFullYear(),
    ),
  )

  const timesheets = projects.flatMap(project =>
    project.timesheets.filter(
      timesheet =>
        project.ano_base ===
        new Date(timesheet.data).getUTCFullYear(),
    ),
  )

  const approved = timesheets.filter(
    timesheet =>
      timesheet.status === 'Aprovado pelo Gestor' &&
      Boolean(
        timesheet.aprovado_em &&
          timesheet.aprovado_por_id &&
          timesheet.justificativa?.trim(),
      ),
  )

  return {
    count: projects.length,

    eligible: projects.filter(
      project => Number(project.elegibilidade_pct) >= 85,
    ).length,

    partial: projects.filter(
      project =>
        Number(project.elegibilidade_pct) >= 60 &&
        Number(project.elegibilidade_pct) < 85,
    ).length,

    highRisk: projects.filter(project =>
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
      approved.map(timesheet => timesheet.custo_apropriado),
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
        projects.map(project => project.trilha_tecnologica),
      ),
    ].map(name => {
      const members = projects.filter(
        project => project.trilha_tecnologica === name,
      )

      return {
        name,
        count: members.length,

        cost: sum(
          members
            .flatMap(project =>
              project.dispendios.filter(
                expense =>
                  project.ano_base ===
                  new Date(expense.data).getUTCFullYear(),
              ),
            )
            .map(expense => expense.valor),
        ),

        hours: sum(
          members
            .flatMap(project =>
              project.timesheets.filter(
                timesheet =>
                  project.ano_base ===
                  new Date(timesheet.data).getUTCFullYear(),
              ),
            )
            .map(timesheet => timesheet.horas_mes),
        ),
      }
    }),
  }
}

// Preserva os centavos mesmo em totais muito grandes.
function parts(value: string | number) {
  const text =
    typeof value === 'number'
      ? value.toFixed(2)
      : value

  const match = /^(-?)(\d+)(?:\.(\d{1,2}))?$/.exec(text)

  if (!match) return null

  return {
    sign: match[1],
    whole: BigInt(match[2]).toLocaleString('pt-BR'),
    fraction: (match[3] || '').padEnd(2, '0'),
  }
}

export const money = (value: string | number) => {
  const result = parts(value)

  return result
    ? `${result.sign}R$\u00a0${result.whole},${result.fraction}`
    : Number(value).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
}

export const number = (value: string | number) => {
  const result = parts(value)

  if (!result) {
    return Number(value).toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
    })
  }

  const fraction = result.fraction.replace(/0+$/, '')

  return (
    `${result.sign}${result.whole}` +
    (fraction ? `,${fraction}` : '')
  )
}

export const date = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString('pt-BR', {
        timeZone: 'UTC',
      })
    : 'Não informado'