export function canNavigate() {
  return window.dispatchEvent(
    new Event(
      'sgalb:before-navigate',
      {
        cancelable: true,
      },
    ),
  )
}