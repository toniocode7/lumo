import { createContext, useContext, type ReactNode } from 'react'
import { useTheme } from './theme'

type ThemeCtx = ReturnType<typeof useTheme>

const Ctx = createContext<ThemeCtx | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme()
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeContext() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useThemeContext must be used inside ThemeProvider')
  return v
}
