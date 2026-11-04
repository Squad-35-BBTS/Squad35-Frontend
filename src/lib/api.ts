import type { User } from '../types'
import { DEMO_MODE, demoResponse, demoUser } from './demo'

const KEY = 'sgalb.session.v1'

const BASE = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/$/, '')

export type Session = {
  token: string
  usuario: User
}

export function readSession(): Session | null {
  if (DEMO_MODE) {
  return {
    token: 'demo-local',
    usuario: demoUser,
  }
}
  try {
    const session = JSON.parse(
      sessionStorage.getItem(KEY) || 'null'
    )

    return (
      session &&
      typeof session.token === 'string' &&
      session.usuario?.id_usuario
    )
      ? session
      : null
  } catch {
    sessionStorage.removeItem(KEY)
    return null
  }
}

export function saveSession(session: Session) {
  sessionStorage.setItem(KEY, JSON.stringify(session))
}

export function logout() {
  sessionStorage.removeItem(KEY)
  window.dispatchEvent(new Event('sgalb:logout'))
}

async function response(
  path: string,
  method: string,
  body?: unknown,
  authenticated = true,
) {

  if (DEMO_MODE) {
  return demoResponse(path, method)
}

  const token = authenticated
    ? readSession()?.token
    : undefined

  const controller = new AbortController()

  const timer = setTimeout(
    () => controller.abort(),
    30000,
  )

  try {
    const result = await fetch(`${BASE}${path}`, {
      method,
      signal: controller.signal,

      headers: {
        ...(body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),

        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
      },

      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    })

    if (authenticated && result.status === 401) {
      logout()
    }

    if (!result.ok) {
      const error = await result.json().catch(() => null)

      throw new Error(
        error?.error ||
        `A requisição falhou (${result.status}).`,
      )
    }

    return result
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === 'AbortError'
    ) {
      throw new Error(
        'O servidor demorou para responder. Tente novamente.',
        { cause: error },
      )
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Não foi possível acessar a API. Confira se o backend está rodando e a conexão está configurada.',
        { cause: error },
      )
    }

    throw error
  } finally {
    clearTimeout(timer)
  }
}

export async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown,
  authenticated = true,
): Promise<T> {
  const result = await response(
    path,
    method,
    body,
    authenticated,
  )

  return result.status === 204
    ? undefined as T
    : result.json()
}

export function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = name
  anchor.click()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function download(
  id: number,
  name: string,
) {
  const result = await response(
    `/evidencias/${id}/arquivo`,
    'GET',
  )

  saveFile(await result.blob(), name)
}

export function encodeFile(file: File): Promise<string> {
  if (
    file.size === 0 ||
    file.size > 5 * 1024 * 1024
  ) {
    return Promise.reject(
      new Error(
        'Escolha um arquivo não vazio de até 5 MiB.',
      ),
    )
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(
        String(reader.result).split(',')[1],
      )
    }

    reader.onerror = () => {
      reject(
        new Error('Não foi possível ler o arquivo.'),
      )
    }

    reader.readAsDataURL(file)
  })
}