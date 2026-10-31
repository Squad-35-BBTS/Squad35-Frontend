export type Decimal = string | number

export type User = {
  id_usuario: number
  nome: string
  email: string
  perfil: string
}

export type Evidence = {
  id_evidencia: number
  nome: string
  sha256: string
  tamanho_bytes: number
  status: string
}

export type Milestone = {
  id_marco: number
  titulo: string
  periodo: string
  descricao: string
  status_validacao: string
  evidencias: Evidence[]
}

export type Timesheet = {
  id_timesheet: number
  iniciativa_id: number
  colaborador_id: string
  colaborador_nome: string
  cargo_regime: string
  data: string
  horas_mes: Decimal
  elegivel_pct: Decimal
  custo_apropriado: Decimal
  justificativa: string | null
  status: string
}

export type Expense = {
  id_dispendio: number
  iniciativa_id: number
  descricao: string
  valor: Decimal
  data: string
  categoria: string
  documento_comprobatorio: string | null
}

export type Alert = {
  id_alerta: number
  iniciativa_id: number
  titulo: string
  descricao: string
  severidade: string
  status: string
  prazo: string | null
  resolucao: string | null
}

export type Opinion = {
  id_parecer: number
  conteudo: string
  conclusao: string
  autor_id: number
  revisao_projeto: number
  criado_em: string
}

export type Project = {
  id_iniciativa: number
  codigo: string
  nome: string
  descricao: string | null
  classificacao_pd: string
  score_trl: number
  trl_inicial: number
  elegibilidade_pct: Decimal
  risco_glosa: string
  risco_glosa_pct: Decimal | null
  barreira_incerteza: string | null
  ano_base: number | null
  diretoria: string
  gerencia: string
  trilha_tecnologica: string
  tipo_inovacao: string
  status: string
  status_dossie: string
  revisao: number
  orcamento: Decimal
  usuario_responsavel_id: number
  usuario_responsavel: User
  marcos: Milestone[]
  timesheets: Timesheet[]
  dispendios: Expense[]
  pareceres: Opinion[]
  alertas: Alert[]
}

export type Dossier = {
  projeto: Project
  pendencias: string[]
  pronto_para_fechar: boolean
}

export type Dashboard = {
  projetos: Project[]
  kpis: Record<string, number>
}

export type Pagination<T> = {
  dados: T[]
  paginacao: {
    pagina: number
    limite: number
    total: number
    total_paginas: number
  }
}

export type Audit = {
  id_auditoria: number
  usuario_id: number
  acao: string
  entidade: string
  registro_id: string
  criado_em: string
}