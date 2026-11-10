import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Card, ScreenHeader } from '../components/ui'
import { useThemeContext } from '../themeContext'
import './screens.css'

export function Profile() {
  const { theme, setTheme } = useThemeContext()

  return (
    <>
      <ScreenHeader title="Profil" subtitle="Tes stats et tes réglages." />

      <h2 className="section-title">Réglages</h2>
      <Card>
        <div className="setting">
          <div>
            <strong>Thème</strong>
            <p className="muted" style={{ fontSize: 14 }}>
              Sombre par défaut, plus reposant.
            </p>
          </div>
          <div className="segmented" role="group" aria-label="Thème">
            <button aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
              <Icon name="moon" size={16} /> Sombre
            </button>
            <button aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
              <Icon name="sun" size={16} /> Clair
            </button>
          </div>
        </div>
        <Link to="/ui" className="setting" style={{ textDecoration: 'none' }}>
          <div>
            <strong>Design system</strong>
            <p className="muted" style={{ fontSize: 14 }}>
              Couleurs, typos et composants de l'appli.
            </p>
          </div>
          <Icon name="chevron" />
        </Link>
      </Card>
    </>
  )
}
