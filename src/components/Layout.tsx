import { NavLink, Outlet } from 'react-router-dom'
import { Icon, type IconName } from './Icon'
import './Layout.css'

type Tab = { to: string; label: string; icon: IconName; railOnly?: boolean }

const tabs: Tab[] = [
  { to: '/', label: 'Accueil', icon: 'home' },
  { to: '/taches', label: 'Tâches', icon: 'tasks' },
  { to: '/cartes', label: 'Cartes', icon: 'cards' },
  { to: '/expedition', label: 'Expédition', icon: 'compass' },
  { to: '/nid', label: 'Nid', icon: 'nest' },
  { to: '/profil', label: 'Profil', icon: 'user', railOnly: true },
]

export function Layout() {
  return (
    <div className="shell">
      <nav className="nav" aria-label="Navigation principale">
        <div className="nav-brand">
          <img src="./icon.svg" alt="" width={32} height={32} />
          <span>Lumo</span>
        </div>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'is-active' : ''} ${t.railOnly ? 'rail-only' : ''}`
            }
          >
            <span className="nav-icon">
              <Icon name={t.icon} />
            </span>
            <span className="nav-label">{t.label}</span>
          </NavLink>
        ))}
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
