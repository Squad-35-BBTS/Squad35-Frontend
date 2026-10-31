import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'squad35.theme'

function initialTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark'
      ? 'dark'
      : 'light'
  } catch {
    return 'light'
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  const dark = theme === 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = theme

    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Continua funcionando se o armazenamento estiver indisponível.
    }
  }, [theme])

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Tema escuro"
      aria-pressed={dark}
      title={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      <span aria-hidden="true">{dark ? '☀' : '☾'}</span>
      {dark ? 'Tema claro' : 'Tema escuro'}
    </button>
  )
}