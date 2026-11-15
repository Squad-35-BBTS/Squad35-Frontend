export type Field = {
  name: string
  label: string
  type?: 'textarea' | 'number' | 'boolean' | 'option'
  max?: number
  maxLength?: number
  step?: string
  options?: string[]
}

export type Primitive =
  | string
  | number
  | boolean
  | null

export type Values = Record<string, Primitive>

export type Preparation = {
  revisao: number
  atualizado_em: string | null
  dados: Record<string, unknown>
  ano_base?: number
  fechado?: boolean
}

export const technicalFields: Field[] = [
  {
    name: 'objetivos',
    label: 'Objetivos do projeto',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'categoria_predominante_formpd',
    label: 'Categoria predominante',
    maxLength: 191,
  },
  {
    name: 'area_predominante_formpd',
    label: 'Área predominante',
    maxLength: 191,
  },
  {
    name: 'palavras_chave',
    label: 'Palavras-chave',
    maxLength: 500,
  },
  {
    name: 'natureza_predominante',
    label: 'Natureza predominante',
    maxLength: 191,
  },
  {
    name: 'elemento_inovador',
    label: 'Elemento novo ou inovador',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'metodologia',
    label: 'Metodologia e métodos empregados',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'trl_final_ano_base_confirmado',
    label: 'TRL final confirmado do ano-base',
    type: 'number',
    max: 9,
    step: '1',
  },
  {
    name: 'justificativa_trl',
    label: 'Justificativa dos níveis TRL',
    type: 'textarea',
    maxLength: 1500,
  },
  {
    name: 'resultado_inovacao',
    label: 'Resultados de inovação',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'resultado_economico',
    label: 'Resultados econômicos (ou ausência de resultados)',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'projeto_plurianual',
    label: 'Projeto plurianual?',
    type: 'boolean',
  },
  {
    name: 'atividades_desenvolvidas_no_ano_base',
    label: 'Atividades desenvolvidas no exercício',
    type: 'textarea',
    maxLength: 3000,
  },
]

export const annualFields: Field[] = [
  {
    name: 'razao_social',
    label: 'Razão social',
    maxLength: 191,
  },
  {
    name: 'cnpj',
    label: 'CNPJ',
    maxLength: 18,
  },
  {
    name: 'tipo_empresa',
    label: 'Tipo da empresa',
    maxLength: 191,
  },
  {
    name: 'situacao_empresa',
    label: 'Situação da empresa',
    maxLength: 191,
  },
  {
    name: 'origem_capital',
    label: 'Origem do capital',
    maxLength: 191,
  },
  {
    name: 'receita_operacional_bruta',
    label: 'Receita operacional bruta (R$)',
    type: 'number',
    step: '0.01',
  },
  {
    name: 'receita_liquida',
    label: 'Receita líquida (R$)',
    type: 'number',
    step: '0.01',
  },
  {
    name: 'total_funcionarios',
    label: 'Total de funcionários',
    type: 'number',
    step: '1',
    max: 100000000,
  },
  {
    name: 'prejuizo_fiscal',
    label: 'Houve prejuízo fiscal?',
    type: 'boolean',
  },
  {
    name: 'estrutura_pd',
    label: 'Estrutura de pesquisa e desenvolvimento',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'fontes_financiamento',
    label: 'Fontes de financiamento do exercício',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'pesquisador_exclusivo_aplicabilidade',
    label: 'Pesquisador exclusivo: aplicabilidade',
    type: 'option',
  },
  {
    name: 'pesquisador_exclusivo_detalhes',
    label: 'Pesquisador exclusivo: detalhes ou justificativa',
    type: 'textarea',
    maxLength: 5000,
  },
  {
    name: 'artigo_19a_aplicabilidade',
    label: 'Art. 19-A: aplicabilidade',
    type: 'option',
  },
  {
    name: 'artigo_19a_detalhes',
    label: 'Art. 19-A: detalhes ou justificativa',
    type: 'textarea',
    maxLength: 5000,
  },
  {
    name: 'incentivos_fiscais_detalhes',
    label: 'Apuração dos incentivos pelo responsável',
    type: 'textarea',
    maxLength: 5000,
  },
  {
    name: 'valor_incentivo_informado',
    label: 'Incentivo informado pelo responsável (R$)',
    type: 'number',
    step: '0.01',
  },
  {
    name: 'aperfeicoamento_lei_do_bem',
    label: 'Observações para aperfeiçoamento da Lei do Bem',
    type: 'textarea',
    maxLength: 3000,
  },
  {
    name: 'modelo_referencia_conferido',
    label: 'Modelo do ano-base conferido pelo gestor?',
    type: 'boolean',
  },
]