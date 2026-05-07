import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import './App.css'

const THEMES = [
  { id: 'espresso',   color: '#2c2420', label: 'Espresso' },
  { id: 'sage',       color: '#2d4a3e', label: 'Sauge' },
  { id: 'navy',       color: '#1e3a5f', label: 'Marine' },
  { id: 'terra',      color: '#8b3a2a', label: 'Terre cuite' },
  { id: 'plum',       color: '#4a2060', label: 'Prune' },
]

function applyTheme(color) {
  document.documentElement.style.setProperty('--bg',          '#f2ede6')
  document.documentElement.style.setProperty('--card',        '#ffffff')
  document.documentElement.style.setProperty('--card-border', '#e4ddd3')
  document.documentElement.style.setProperty('--accent',      color)
  document.documentElement.style.setProperty('--text',        '#1c1917')
  document.documentElement.style.setProperty('--text-muted',  '#9c8f85')
  document.documentElement.style.setProperty('--input-bg',    '#faf8f5')
}

function getInitial(email) {
  return email ? email[0].toUpperCase() : '?'
}

function getUsername(email) {
  return email ? email.split('@')[0] : ''
}

export default function App() {
  const [session, setSession]       = useState(null)
  const [themeId, setThemeId]       = useState('espresso')
  const [avatarUrl, setAvatarUrl]   = useState(null)
  const fileInputRef                = useRef(null)

  useEffect(() => {
    applyTheme(THEMES[0].color)
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const handleTheme = (theme) => {
    setThemeId(theme.id)
    applyTheme(theme.color)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setAvatarUrl(url)
  }

  if (!session) return <Auth />

  const { email } = session.user
  const currentTheme = THEMES.find(t => t.id === themeId)

  return (
    <div className="app-root">

      {/* Navbar */}
      <nav className="app-nav">
        <div className="app-nav-brand">
          <span className="app-nav-dot" />
          <span className="app-nav-name">Mon Kanban</span>
        </div>
        <div className="app-nav-right">
          <span className="app-nav-email">{email}</span>
          <button className="app-signout-btn" onClick={() => supabase.auth.signOut()}>
            Se déconnecter
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="app-main">

        {/* Hero */}
        <section className="app-hero">
          <h1 className="app-hero-title">
            Bonjour, <em>{getUsername(email)}</em>.
          </h1>
          <p className="app-hero-sub">Prêt à organiser votre journée ?</p>
        </section>

        {/* Cards */}
        <div className="app-grid">

          {/* Avatar card */}
          <div className="app-card">
            <p className="app-card-label">Mon profil</p>
            <div className="avatar-area">
              <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                <div className="avatar-circle">
                  {avatarUrl
                    ? <img src={avatarUrl} alt="avatar" />
                    : getInitial(email)
                  }
                </div>
                <div className="avatar-overlay">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <input
                  ref={fileInputRef}
                  className="avatar-input"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="avatar-info">
                <h3>{getUsername(email)}</h3>
                <p>{email}</p>
              </div>
            </div>
            <p className="avatar-hint">Cliquez sur l'avatar pour changer votre photo de profil.</p>
          </div>

          {/* Color card */}
          <div className="app-card">
            <p className="app-card-label">Couleur d'accent</p>
            <div className="color-swatches">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  className={`swatch${themeId === theme.id ? ' active' : ''}`}
                  style={{ backgroundColor: theme.color }}
                  title={theme.label}
                  onClick={() => handleTheme(theme)}
                />
              ))}
            </div>
            <p className="color-hint">
              Thème actuel : <strong>{currentTheme?.label}</strong>. La couleur s'applique à toute l'interface.
            </p>
          </div>

        </div>

        {/* Kanban placeholder */}
        <div className="app-kanban-placeholder">
          <div className="placeholder-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="9" rx="1"/>
              <rect x="14" y="3" width="7" height="5" rx="1"/>
              <rect x="14" y="12" width="7" height="9" rx="1"/>
              <rect x="3" y="16" width="7" height="5" rx="1"/>
            </svg>
          </div>
          <div className="placeholder-text">
            <h3>Mes tableaux Kanban</h3>
            <p>Créez et gérez vos colonnes, cartes et tâches.</p>
          </div>
          <span className="placeholder-badge">Bientôt disponible</span>
        </div>

      </main>
    </div>
  )
}
