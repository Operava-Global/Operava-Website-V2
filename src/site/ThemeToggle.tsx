import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Mode = 'dark' | 'light'
const getMode = (): Mode => {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** Black is the default; the user may explicitly opt into the matching light palette. */
export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>(getMode)
  useEffect(() => {
    const listener = () => setMode(getMode())
    window.addEventListener('operava-theme-change', listener)
    return () => window.removeEventListener('operava-theme-change', listener)
  }, [])
  const change = () => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.documentElement.style.colorScheme = next
    setMode(next)
    try { localStorage.setItem('operava-theme', next) } catch { /* blocked storage */ }
    window.dispatchEvent(new Event('operava-theme-change'))
  }
  return (
    <button type="button" onClick={change}
      title={mode === 'dark' ? 'Switch to light theme' : 'Switch to black theme'}
      aria-label={mode === 'dark' ? 'Switch to light theme' : 'Switch to black theme'}
      aria-pressed={mode === 'light'}
      className="theme-toggle w-9 h-9 rounded-full border border-neutral-800 flex items-center justify-center hover:border-accent transition-colors"
    >
      {mode === 'dark' ? <Sun aria-hidden="true" size={16} /> : <Moon aria-hidden="true" size={16} />}
    </button>
  )
}
