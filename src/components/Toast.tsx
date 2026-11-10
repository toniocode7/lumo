import { useEffect } from 'react'
import { useGame } from '../game/store'
import './Toast.css'

export function ToastHost() {
  const { toast, dismissToast } = useGame()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(dismissToast, 4500)
    return () => clearTimeout(t)
  }, [toast, dismissToast])

  return (
    <div className="toast-host" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">
          <span className="toast-dot" />
          <span className="toast-text">{toast.text}</span>
          {toast.undo && (
            <button className="toast-undo" onClick={toast.undo}>
              Annuler
            </button>
          )}
        </div>
      )}
    </div>
  )
}
