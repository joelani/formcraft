// Theme initialization: runs before React mounts to prevent flash.
const savedTheme = localStorage.getItem('formcraft-theme')
const isDark = savedTheme === 'dark'
document.documentElement.classList.toggle('dark', isDark)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
