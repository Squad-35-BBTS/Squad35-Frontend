import { useEffect, useState } from 'react'
import '../loading.css'

type Props = {
  title?: string
  description?: string
  inline?: boolean
}

export default function LoadingScreen({
  title = 'Preparando seu ambiente',
  description = 'Carregando os dados necessários para continuar.',
  inline = false,
}: Props) {
  const [delayed, setDelayed] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDelayed(true),
      8000,
    )

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div
      className={`loading-screen ${
        inline ? 'loading-inline' : ''
      }`}
    >
      <div
        className="loading-content"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="loading-emblem"
          aria-hidden="true"
        >
          <span className="loading-orbit" />
          <span className="loading-monogram">LB</span>
        </div>

        <span
          className="loading-brand"
          aria-hidden="true"
        >
          SGA · LEI DO BEM
        </span>

        <h2>{title}</h2>
        <p>{description}</p>

        {delayed && (
          <p className="loading-delay">
            A conexão está demorando um pouco.
            Continuamos aguardando uma resposta.
          </p>
        )}
      </div>
    </div>
  )
}