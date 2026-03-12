// src/hooks/useNotify.js
export function useNotify() {
  const notify = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }
  return { notify }
}
