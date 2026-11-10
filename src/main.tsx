import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import '@fontsource-variable/inter'
import '@fontsource-variable/space-grotesk'
import './index.css'
import { Layout } from './components/Layout'
import { ThemeProvider } from './themeContext'
import { Home } from './screens/Home'
import { DailyCards, Expedition, Nest, Tasks } from './screens/Placeholders'
import { Profile } from './screens/Profile'
import { DesignSystem } from './screens/DesignSystem'

// HashRouter: GitHub Pages has no server-side rewrites.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
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
    </ThemeProvider>
  </StrictMode>,
)
