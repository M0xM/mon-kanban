import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import './App.css'

const THEMES = [
  { id: 'espresso', color: '#2c2420', label: 'Espresso' },
  { id: 'sage',     color: '#2d4a3e', label: 'Sauge' },
  { id: 'navy',     color: '#1e3a5f', label: 'Marine' },
  { id: 'terra',    color: '#7a3020', label: 'Terre cuite' },
  { id: 'plum',     color: '#3d1f52', label: 'Prune' },
]

function applyTheme(color) {
  document.documentElement.style.setProperty('--accent', color)
}

const getInitial = (email) => (email ? email[0].toUpperCase() : '?')
const getUsername = (email) => (email ? email.split('@')[0] : '')

export default function App() {
  const [session, setSession]     = useState(null)
  const [themeId, setThemeId]     = useState('espresso')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const fileInputRef              = useRef(null)

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
    if (file) setAvatarUrl(URL.createObjectURL(file))
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
          {/* Profile */}
          <div className="app-nav-profile" onClick={() => fileInputRef.current?.click()} title="Changer la photo de profil">
            <div className="app-nav-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="avatar" /> : getInitial(email)}
            </div>
            <div className="app-nav-profile-info">
              <span className="app-nav-profile-label">Profil</span>
              <span className="app-nav-profile-email">{email}</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />

          <span className="app-nav-sep" />

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

          {/* Theme card */}
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
              Thème : <strong>{currentTheme?.label}</strong> — appliqué à la navbar et aux accents.
            </p>
          </div>

          {/* Profile tip card */}
          <div className="app-card">
            <p className="app-card-label">Personnalisation</p>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
              Personnalisez davantage votre page d'accueil : changez votre <strong style={{ color: 'var(--text)' }}>photo de profil</strong> en cliquant sur votre avatar en haut à droite, et choisissez une <strong style={{ color: 'var(--text)' }}>couleur d'accent</strong> à gauche.
            </p>
          </div>

        </div>

        {/* Kanban placeholder */}
        <div className="app-kanban-placeholder">
          <div className="placeholder-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
