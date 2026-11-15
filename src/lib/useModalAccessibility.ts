import { useEffect } from 'react'

export function useModalAccessibility() {
  useEffect(() => {
    let dialog: HTMLElement | null = null
    let previous: HTMLElement | null = null

    const selector =
      'button, input, select, textarea, a[href], [tabindex]'

    const items = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(selector) || [],
      ).filter(
        item =>
          item.tabIndex >= 0 &&
          !item.matches(':disabled') &&
          !item.closest(
            '[hidden], [inert], [aria-hidden="true"]',
          ) &&
          window.getComputedStyle(item).display !== 'none' &&
          window.getComputedStyle(item).visibility !== 'hidden',
      )

    function restore() {
      if (previous?.isConnected) previous.focus()
      previous = null
    }

    function update() {
      const next =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            '.modal[role="dialog"]',
          ),
        ).at(-1) || null

      if (next === dialog) return

      if (!next) {
        dialog = null
        restore()
        return
      }

      previous =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      dialog = next
      dialog.tabIndex = -1

      ;(items()[0] || dialog).focus()
    }

    function keydown(event: KeyboardEvent) {
      if (!dialog) return

      if (event.key === 'Escape') {
        const close =
          dialog.querySelector<HTMLButtonElement>(
            'button[aria-label="Fechar formulário"]',
          )

        if (close && !close.disabled) {
          event.preventDefault()
          close.click()
        }
      }

      if (event.key !== 'Tab') return

      const eligible = items()
      const first = eligible[0]
      const last = eligible.at(-1)

      if (!first) {
        event.preventDefault()
        dialog.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        last?.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        first.focus()
      }
    }

    const observer = new MutationObserver(update)

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    document.addEventListener('keydown', keydown)
    update()

    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', keydown)
      restore()
    }
  }, [])
}