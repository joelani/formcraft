import { useEffect, useState } from 'react'

const STORAGE_KEY = 'formcraft-theme'
const THEME_CHANGE_EVENT = 'formcraft-theme-change'

function getPreferredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' ? 'dark' : 'light'
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function useTheme() {
  const [theme, setTheme] = useState(getPreferredTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, theme)
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }))
  }, [theme])

  useEffect(() => {
    function handleThemeChange(event) {
      setTheme(event.detail)
    }

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange)
    return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange)
  }, [])

  function toggleTheme() {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme, isDark: theme === 'dark' }
}
