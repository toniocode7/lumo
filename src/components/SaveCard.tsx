import { useEffect, useRef, useState } from 'react'
import { levelFromXp } from '../game/rules'
import { exportSave, parseSave } from '../game/storage'
import { useGame } from '../game/store'
import type { GameState } from '../game/types'
import { Button, Card } from './ui'

type InstallEvent = Event & { prompt: () => Promise<void> }

const standalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

/** Install the app, export the save to a file, or restore one. */
export function SaveCard() {
  const { state, importState } = useGame()
  const file = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ state: GameState; exportedAt: string } | null>(null)
  const [error, setError] = useState('')
  const [install, setInstall] = useState<InstallEvent | null>(null)
  const [installed, setInstalled] = useState(standalone)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setInstall(e as InstallEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const download = () => {
    const { name, json } = exportSave(state)
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const pick = async (f: File | undefined) => {
    setError('')
    setPending(null)
    if (!f) return
    try {
      setPending(parseSave(await f.text()))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ce fichier ne peut pas être lu.')
    } finally {
      if (file.current) file.current.value = ''
    }
  }

  const date = (iso: string) =>
    iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso)) : ''

  return (
    <Card className="stack">
      {!installed && (
        <div className="setting">
          <div>
            <strong>Installer l’appli</strong>
            <p className="muted" style={{ fontSize: 14 }}>
              {install
                ? 'Ajoute Lumo à ton écran d’accueil. Elle marche même hors connexion.'
                : isIos()
                  ? 'Dans Safari\u00a0: bouton Partager, puis « Sur l’écran d’accueil ».'
                  : 'Depuis le menu du navigateur\u00a0: « Installer l’application » ou « Ajouter à l’écran d’accueil ».'}
            </p>
          </div>
          {install && (
            <Button variant="secondary" onClick={() => install.prompt().then(() => setInstall(null))}>
              Installer
            </Button>
          )}
        </div>
      )}

      <div className="setting" style={{ alignItems: 'flex-start', flexDirection: 'column' }}>
        <div>
          <strong>Sauvegarde</strong>
          <p className="muted" style={{ fontSize: 14 }}>
            Ta progression vit sur cet appareil, sans compte. Exporte-la de temps en temps pour la
            garder au chaud ou la passer sur un autre téléphone.
          </p>
        </div>
        <div className="row" style={{ width: '100%' }}>
          <Button variant="secondary" onClick={download} style={{ flex: 1 }}>
            Exporter
          </Button>
          <Button variant="secondary" onClick={() => file.current?.click()} style={{ flex: 1 }}>
            Importer
          </Button>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </div>
        {error && (
          <p role="alert" style={{ color: 'var(--coral-text)', fontSize: 14 }}>
            {error}
          </p>
        )}
        {pending && (
          <div className="import-confirm" role="alertdialog" aria-label="Confirmer l’import">
            <p>
              Remplacer ta progression actuelle par cette sauvegarde
              {pending.exportedAt && <> du {date(pending.exportedAt)}</>}&nbsp;? Niveau{' '}
              {levelFromXp(pending.state.player.xp).level}, {pending.state.player.tasksDone} tâche
              {pending.state.player.tasksDone > 1 ? 's' : ''} faite{pending.state.player.tasksDone > 1 ? 's' : ''}.
            </p>
            <div className="row">
              <Button
                onClick={() => {
                  importState(pending.state)
                  setPending(null)
                }}
              >
                Remplacer
              </Button>
              <Button variant="ghost" onClick={() => setPending(null)}>
                Annuler
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
