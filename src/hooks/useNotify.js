// src/hooks/useNotify.js
export function useNotify() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI?.isElectron

  const notify = (title, body) => {
    if (isElectron) {
      window.electronAPI.notify(title, body)
    } else if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(p => {
          if (p === 'granted') new Notification(title, { body })
        })
      }
    }
  }

  return { notify, isElectron }
}
