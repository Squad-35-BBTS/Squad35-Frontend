import { useEffect, useState } from 'react'
import './App.css'

type Screen = { file: string; label: string; group: string }

const screens: Screen[] = [
  { file: 'login.html', label: 'Login', group: 'Acesso' },
  { file: 'recuperar-senha.html', label: 'Esqueci minha senha', group: 'Acesso' },
  { file: 'dashboard.html', label: 'BEM+ Radar', group: 'Sistema' },
  { file: 'elegibilidade.html', label: 'Elegibilidade de projetos', group: 'Sistema' },
  { file: 'evidencias.html', label: 'Cadastro de evidências', group: 'Sistema' },
  { file: 'timesheets.html', label: 'Timesheets e dispêndios', group: 'Sistema' },
  { file: 'relatorios.html', label: 'Relatórios FormBR / MCTI', group: 'Sistema' },
  { file: 'perfil.html', label: 'Perfil do usuário', group: 'Sistema' },
]

function App() {
  const [page, setPage] = useState('login.html')
  const [notice, setNotice] = useState('')
  const activeScreen = screens.find((screen) => screen.file === page) ?? screens[0]

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return
      if (event.data.type === 'SGALB_NAVIGATE' && screens.some((screen) => screen.file === event.data.page)) {
        setPage(event.data.page)
        setNotice('')
      }
      if (event.data.type === 'SGALB_NOTICE') setNotice(String(event.data.message ?? ''))
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <main className="workspace">
      <header className="workspace-bar">
        <div className="workspace-brand" aria-label="SGA-LB">
          <span className="brand-mark">LB</span>
          <span><strong>SGA-LB</strong><small>Ambiente de desenvolvimento</small></span>
        </div>
        <label className="screen-picker">
          <span>Visualizar tela</span>
          <select value={page} onChange={(event) => { setPage(event.target.value); setNotice('') }}>
            {screens.map((screen) => <option value={screen.file} key={screen.file}>{screen.label}</option>)}
          </select>
        </label>
        <a className="open-tab" href={`/telas/${page}`} target="_blank" rel="noreferrer">Abrir em nova aba ↗</a>
      </header>
      {notice && <div className="workspace-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso">×</button></div>}
      <section className="screen-frame" aria-label={`Prévia da tela ${activeScreen.label}`}>
        <iframe key={page} title={activeScreen.label} src={`/telas/${page}`} />
      </section>
    </main>
  )
}

export default App
