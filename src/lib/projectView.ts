import type { Project } from '../types'

export type ProjectFilters = {
  busca: string
  classificacao: string
  dossie: string
  ano: string
}

export function filterProjects(
  projects: Project[],
  filters: ProjectFilters,
) {
  const text = filters.busca
    .trim()
    .toLocaleLowerCase('pt-BR')

  return projects.filter(project => {
    const matchesYear =
      !filters.ano ||
      String(project.ano_base) === filters.ano

    const matchesClassification =
      !filters.classificacao ||
      project.classificacao_pd === filters.classificacao

    const matchesDossier =
      !filters.dossie ||
      project.status_dossie === filters.dossie

    const searchableText = [
      project.codigo,
      project.nome,
      project.classificacao_pd,
    ]
      .join(' ')
      .toLocaleLowerCase('pt-BR')

    return (
      matchesYear &&
      matchesClassification &&
      matchesDossier &&
      searchableText.includes(text)
    )
  })
}

export function projectRole(perfil: string) {
  if (
    [
      'Administrador',
      'Gestor P&D / Lei do Bem',
      'Gestor Lei do Bem',
    ].includes(perfil)
  ) {
    return 'gestor'
  }

  if (perfil === 'Analista P&D') {
    return 'analista'
  }

  if (perfil === 'Auditor') {
    return 'auditor'
  }

  if (perfil === 'Consultoria especializada') {
    return 'consultoria'
  }

  return 'desconhecido'
}