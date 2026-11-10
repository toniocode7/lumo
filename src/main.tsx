import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './index.css'
import { Layout } from './components/Layout'
import { ThemeProvider } from './themeContext'
import { Home } from './screens/Home'
import { Nest } from './screens/Nest'
import { Expedition } from './screens/Expedition'
import { DailyCards } from './screens/DailyCards'
import { Tasks } from './screens/Tasks'
import { GameProvider } from './game/store'
import { Profile } from './screens/Profile'
import { DesignSystem } from './screens/DesignSystem'

// HashRouter: GitHub Pages has no server-side rewrites.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <GameProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="taches" element={<Tasks />} />
              <Route path="cartes" element={<DailyCards />} />
              <Route path="expedition" element={<Expedition />} />
              <Route path="nid" element={<Nest />} />
              <Route path="profil" element={<Profile />} />
              <Route path="ui" element={<DesignSystem />} />
              <Route path="*" element={<Home />} />
            </Route>
          </Routes>
        </HashRouter>
      </GameProvider>
    </ThemeProvider>
  </StrictMode>,
)
