
import { useState } from 'react';
import './App.css';

const iniciativas = [
  {
    nome: 'Plataforma de análise de dados',
    codigo: 'IN-2026-001',
    categoria: 'Desenvolvimento de software',
    status: 'Em análise',
    data: '05/10/2026',
  },
  {
    nome: 'Automação de processos internos',
    codigo: 'IN-2026-002',
    categoria: 'Automação',
    status: 'Em andamento',
    data: '02/10/2026',
  },
  {
    nome: 'Pesquisa em inteligência artificial',
    codigo: 'IN-2026-003',
    categoria: 'Inteligência artificial',
    status: 'Concluída',
    data: '28/09/2026',
  },
];

const menu = [
  { nome: 'Visão geral', icone: '▦' },
  { nome: 'Iniciativas', icone: '▤' },
  { nome: 'Dispêndios', icone: '◈' },
  { nome: 'Timesheets', icone: '◷' },
  { nome: 'Relatórios', icone: '▥' },
];

function App() {
  const [paginaAtiva, setPaginaAtiva] = useState('Visão geral');
  const [busca, setBusca] = useState('');

  const iniciativasFiltradas = iniciativas.filter((iniciativa) =>
    `${iniciativa.nome} ${iniciativa.codigo}`
      .toLowerCase()
      .includes(busca.toLowerCase()),
  );

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">LB</div>
          <div>
            <h2>SGA-LB</h2>
            <span>Gestão da Lei do Bem</span>
          </div>
        </div>

        <div className="menu-label">MENU PRINCIPAL</div>

        <nav className="menu">
          {menu.map((item) => (
            <button
              key={item.nome}
              className={`menu-item ${
                paginaAtiva === item.nome ? 'active' : ''
              }`}
              onClick={() => setPaginaAtiva(item.nome)}
            >
              <span className="menu-icon">{item.icone}</span>
              {item.nome}
              {item.nome === 'Iniciativas' && (
                <span className="menu-count">3</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <strong>Precisa de ajuda?</strong>
            <p>Acesse as informações do sistema.</p>
            <button onClick={() => alert('Central de ajuda em desenvolvimento.')}>
              Central de ajuda →
            </button>
          </div>

          <div className="user-mini">
            <div className="avatar">TM</div>
            <div className="user-info">
              <strong>Tamirys Maria</strong>
              <span>Usuária do sistema</span>
            </div>
            <span className="user-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>SGA-LB</span>
            <span>/</span>
            <strong>{paginaAtiva}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Buscar iniciativas..."
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="notification-button"
              aria-label="Notificações"
              onClick={() => alert('Você não possui novas notificações.')}
            >
              ♧
              <span />
            </button>

            <div className="avatar top-avatar">TM</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                PAINEL DE CONTROLE
              </div>
              <h1>
                {paginaAtiva === 'Visão geral'
                  ? 'Visão geral'
                  : paginaAtiva}
              </h1>
              <p>
                Acompanhe suas iniciativas e organize as informações da
                Lei do Bem em um só lugar.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                alert('O formulário de cadastro será implementado na próxima etapa.')
              }
            >
              <span>＋</span> Nova iniciativa
            </button>
          </section>

          <section className="fiscal-banner">
            <div className="fiscal-icon">▣</div>
            <div className="fiscal-info">
              <span>EXERCÍCIO FISCAL</span>
              <strong>Ano-base 2026</strong>
            </div>
            <div className="fiscal-divider" />
            <div className="fiscal-description">
              <span className="status-dot" />
              <span>Período de acompanhamento</span>
            </div>
            <button
              className="text-button"
              onClick={() => alert('A seleção do exercício fiscal será implementada depois.')}
            >
              Alterar exercício ↗
            </button>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-top">
                <span>Total de iniciativas</span>
                <span className="stat-icon blue">▤</span>
              </div>
              <strong className="stat-value">12</strong>
              <div className="stat-footer">
                <span className="stat-neutral">No exercício atual</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Em andamento</span>
                <span className="stat-icon purple">◷</span>
              </div>
              <strong className="stat-value">05</strong>
              <div className="stat-footer">
                <span className="stat-neutral">Iniciativas ativas</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Concluídas</span>
                <span className="stat-icon green">✓</span>
              </div>
              <strong className="stat-value">04</strong>
              <div className="stat-footer">
                <span className="stat-neutral">Finalizadas no período</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Em análise</span>
                <span className="stat-icon orange">◉</span>
              </div>
              <strong className="stat-value">03</strong>
              <div className="stat-footer">
                <span className="stat-neutral">Aguardando avaliação</span>
              </div>
            </article>
          </section>

          <section className="content-grid">
            <article className="panel initiatives-panel">
              <div className="panel-heading">
                <div>
                  <h2>Iniciativas recentes</h2>
                  <p>Acompanhe os projetos cadastrados no sistema.</p>
                </div>
                <button
                  className="outline-button"
                  onClick={() => setPaginaAtiva('Iniciativas')}
                >
                  Ver todas <span>→</span>
                </button>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>INICIATIVA</th>
                      <th>CATEGORIA</th>
                      <th>STATUS</th>
                      <th>ATUALIZAÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iniciativasFiltradas.map((item) => (
                      <tr key={item.codigo}>
                        <td>
                          <div className="initiative-name">{item.nome}</div>
                          <div className="initiative-code">{item.codigo}</div>
                        </td>
                        <td>
                          <span className="category-label">
                            {item.categoria}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${
                              item.status === 'Concluída'
                                ? 'completed'
                                : item.status === 'Em andamento'
                                  ? 'progress'
                                  : 'review'
                            }`}
                          >
                            <span className="badge-dot" />
                            {item.status}
                          </span>
                        </td>
                        <td className="date-cell">{item.data}</td>
                      </tr>
                    ))}
                    {iniciativasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={4} className="empty-state">
                          Nenhuma iniciativa encontrada para essa busca.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="panel-footer">
                Exibindo {iniciativasFiltradas.length} de 3 iniciativas demonstrativas
              </div>
            </article>

            <aside className="panel activity-panel">
              <div className="panel-heading">
                <div>
                  <h2>Resumo da atividade</h2>
                  <p>Visão rápida do seu painel.</p>
                </div>
              </div>

              <div className="activity-highlight">
                <div className="activity-highlight-icon">↗</div>
                <div>
                  <span>Iniciativas cadastradas</span>
                  <strong>12 registros</strong>
                </div>
              </div>

              <div className="progress-heading">
                <span>Distribuição das iniciativas</span>
              </div>

              <div className="progress-row">
                <div className="progress-label">
                  <span><i className="legend blue-legend" /> Em andamento</span>
                  <strong>5</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill blue-fill" style={{ width: '42%' }} />
                </div>
              </div>

              <div className="progress-row">
                <div className="progress-label">
                  <span><i className="legend green-legend" /> Concluídas</span>
                  <strong>4</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill green-fill" style={{ width: '33%' }} />
                </div>
              </div>

              <div className="progress-row">
                <div className="progress-label">
                  <span><i className="legend orange-legend" /> Em análise</span>
                  <strong>3</strong>
                </div>
                <div className="progress-track">
                  <div className="progress-fill orange-fill" style={{ width: '25%' }} />
                </div>
              </div>

              <div className="activity-note">
                <span>ⓘ</span>
                <p>
                  Estes indicadores são demonstrativos e serão conectados aos
                  dados reais da API nas próximas etapas.
                </p>
              </div>
            </aside>
          </section>

          <footer className="page-footer">
            <span>SGA-LB · Sistema de Gestão de Apuração da Lei do Bem</span>
            <span>Entrega parcial · 2026</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;