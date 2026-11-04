import type { Project, User } from '../types'

export const DEMO_MODE =
  import.meta.env.DEV &&
  import.meta.env.VITE_DEMO_MODE === 'true'

export const demoUser: User = {
  id_usuario: 1,
  nome: 'Visitante de demonstração',
  email: 'demo@example.invalid',
  perfil: 'Administrador',
}

const project: Project = {
  id_iniciativa: 1,
  codigo: 'DEMO-001',
  nome: 'Projeto demonstrativo de P&D',
  descricao: 'Dados fictícios para explorar a interface.',
  classificacao_pd: 'Desenvolvimento experimental',
  score_trl: 4,
  trl_inicial: 1,
  elegibilidade_pct: '85',
  risco_glosa: 'Baixo',
  risco_glosa_pct: '12',
  barreira_incerteza: 'Hipótese tecnológica simulada.',
  ano_base: 2026,
  diretoria: 'Tecnologia',
  gerencia: 'Inovação',
  trilha_tecnologica: 'Software',
  tipo_inovacao: 'Tecnológica',
  status: 'Em Avaliação',
  status_dossie: 'Aberto',
  revisao: 1,
  orcamento: '10000',
  usuario_responsavel_id: 1,
  usuario_responsavel: demoUser,

  marcos: [
    {
      id_marco: 1,
      titulo: 'Prova de conceito',
      periodo: 'Outubro/2026',
      descricao: 'Experimento fictício para visualizar a tela.',
      status_validacao: 'Pendente',
      evidencias: [],
    },
  ],

  timesheets: [
    {
      id_timesheet: 1,
      iniciativa_id: 1,
      colaborador_id: 'DEMO-01',
      colaborador_nome: 'Colaborador demonstrativo',
      cargo_regime: 'CLT',
      data: '2026-10-15T00:00:00.000Z',
      horas_mes: '8',
      elegivel_pct: '100',
      custo_apropriado: '500',
      justificativa: 'Experimento fictício.',
      status: 'Pendente',
    },
  ],

  dispendios: [
    {
      id_dispendio: 1,
      iniciativa_id: 1,
      descricao: 'Infraestrutura simulada',
      valor: '250.50',
      data: '2026-10-15T00:00:00.000Z',
      categoria: 'Infraestrutura',
      documento_comprobatorio: 'SIMULACAO-001',
    },
  ],

  pareceres: [],
  alertas: [],
}

export function demoResponse(
  path: string,
  method: string,
): Response {
  if (method.toUpperCase() !== 'GET') {
    throw new Error(
      'Demonstração somente para visualização. Desative VITE_DEMO_MODE e entre com sua conta para salvar alterações.',
    )
  }

  const route = path.split('?')[0]
  let data: unknown

  if (route === '/auth/me') {
    data = { usuario: demoUser }
  } else if (route === '/usuarios') {
    data = [demoUser]
  } else if (route === '/elegibilidade/dashboard') {
    data = { projetos: [project], kpis: {} }
  } else if (route === '/iniciativas') {
    data = [project]
  } else if (route === '/iniciativas/1') {
    data = project
  } else if (route === '/iniciativas/1/dossie') {
    data = {
      projeto: project,
      pendencias: [
        'Dados simulados. Validações e parecer não realizados.',
      ],
      pronto_para_fechar: false,
    }
  } else if (route === '/auditoria') {
    data = {
      dados: [],
      paginacao: {
        pagina: 1,
        limite: 20,
        total: 0,
        total_paginas: 1,
      },
    }
  } else if (route === '/relatorios/mcti') {
    data = {
      demonstracao: true,
      projetos: [project],
    }
  } else {
    throw new Error(
      'Esta consulta exige o modo normal e o backend. Desative VITE_DEMO_MODE para continuar.',
    )
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
}