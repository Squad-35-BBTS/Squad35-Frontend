import { useEffect, useState } from 'react'
import './today-date.css'

const formatter = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function currentDate() {
  const parts = formatter.formatToParts(new Date())
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(item => item.type === type)?.value || ''
  const day = part('day')
  const month = part('month')
  const year = part('year')
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

  return {
    label: `${day} de ${months[Number(month) - 1]}`.toLocaleUpperCase('pt-BR'),
    iso: `${year}-${month}-${day}`,
  }
}

export default function TodayDate() {
  const [today, setToday] = useState(currentDate)

  useEffect(() => {
    function refresh() {
      const next = currentDate()
      setToday(previous => previous.iso === next.iso ? previous : next)
    }

    // Alinha a atualização à próxima virada de minuto, inclusive à meia-noite.
    let timer: ReturnType<typeof setTimeout>
    function schedule() {
      timer = setTimeout(() => {
        refresh()
        schedule()
      }, 60000 - Date.now() % 60000)
    }
    schedule()
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return (
    <div className="today-date" title="Data atual no horário de Brasília">
      <span className="today-date-label">Hoje</span>
      <time dateTime={today.iso} aria-label={`Hoje, ${today.label}, horário de Brasília`}>
        {today.label}
      </time>
    </div>
  )
}
