import { useEffect, useRef, useState } from 'react'

type Settings = { font: 100 | 112.5 | 125; contrast: boolean; underline: boolean; motion: boolean }
const defaults: Settings = { font: 100, contrast: false, underline: false, motion: false }
const KEY = 'squad35.accessibility'

function readSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      font: [100, 112.5, 125].includes(saved?.font) ? saved.font : 100,
      contrast: saved?.contrast === true,
      underline: saved?.underline === true,
      motion: saved?.motion === true,
    }
  } catch { return { ...defaults } }
}

export default function AccessibilityTools() {
  const [settings, setSettings] = useState<Settings>(readSettings)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const root = document.documentElement
    root.style.fontSize = `${settings.font}%`
    root.dataset.textSize = settings.font === 100 ? 'normal' : 'large'
    root.dataset.highContrast = String(settings.contrast)
    root.dataset.underlineLinks = String(settings.underline)
    root.dataset.reduceMotion = String(settings.motion)
    try { localStorage.setItem(KEY, JSON.stringify(settings)) } catch { /* Preferências continuam aplicadas nesta sessão. */ }
  }, [settings])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !panelRef.current?.contains(event.target) && !toggleRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [open])

  function close() { setOpen(false); toggleRef.current?.focus() }
  function size(direction: -1 | 1) {
    const sizes = [100, 112.5, 125] as const
    setSettings(current => ({ ...current, font: sizes[Math.min(2, Math.max(0, sizes.indexOf(current.font) + direction))] }))
  }

  return <div className="accessibility-tools">
    <button type="button" ref={toggleRef} className="accessibility-toggle" aria-label="Ferramentas de acessibilidade" title="Ferramentas de acessibilidade" aria-expanded={open} aria-controls="accessibility-panel" onClick={() => setOpen(value => !value)}>
<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <circle
    cx="9"
    cy="16"
    r="6"
    stroke="currentColor"
    strokeWidth="2"
  />

  <circle
    cx="10"
    cy="4"
    r="2"
    fill="currentColor"
  />

  <path
    d="M10 8v7h6l3 6 3-1M10 10h6"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
</svg>

    </button>
    {open && <section ref={panelRef} id="accessibility-panel" className="accessibility-panel" role="dialog" aria-labelledby="accessibility-title" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close() } }}>
      <header><h2 id="accessibility-title">Acessibilidade</h2><button type="button" ref={closeRef} aria-label="Fechar acessibilidade" onClick={close}>×</button></header>
      <p>Ajuste a leitura da plataforma.</p>
      <div className="accessibility-font"><span>Tamanho do texto</span><div>
        <button type="button" aria-label="Diminuir texto" disabled={settings.font === 100} onClick={() => size(-1)}>A−</button>
        <output aria-live="polite">{settings.font}%</output>
        <button type="button" aria-label="Aumentar texto" disabled={settings.font === 125} onClick={() => size(1)}>A+</button>
      </div></div>
      <label><input type="checkbox" checked={settings.contrast} onChange={event => setSettings(current => ({ ...current, contrast: event.target.checked }))} />Alto contraste</label>
      <label><input type="checkbox" checked={settings.underline} onChange={event => setSettings(current => ({ ...current, underline: event.target.checked }))} />Sublinhar links</label>
      <label><input type="checkbox" checked={settings.motion} onChange={event => setSettings(current => ({ ...current, motion: event.target.checked }))} />Reduzir movimentos</label>
      <button className="accessibility-reset" type="button" onClick={() => setSettings({ ...defaults })}>Restaurar preferências</button>
      <small>Para tradução em Libras, utilize o botão do VLibras na lateral da página.</small>
    </section>}
  </div>
}
