import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Auth.css'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else if (!isLogin) {
      setMessage({
        text: 'Inscription réussie ! Vérifiez votre email pour confirmer.',
        type: 'success',
      })
    }

    setLoading(false)
  }

  const toggle = () => {
    setIsLogin(!isLogin)
    setMessage({ text: '', type: '' })
  }

  return (
    <div className="auth-root">
      <div className="auth-card">

        <div className="auth-brand">
          <span className="auth-brand-dot" />
          <span className="auth-brand-name">Mon Kanban</span>
        </div>

        <h1 className="auth-title">
          {isLogin ? <>Bon retour <em>parmi nous</em></> : <>Créer un <em>compte</em></>}
        </h1>
        <p className="auth-subtitle">
          {isLogin
            ? 'Connectez-vous pour accéder à vos tableaux.'
            : 'Rejoignez-nous et organisez vos projets.'}
        </p>

        <div className="auth-divider" />

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Adresse email</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Mot de passe</label>
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Chargement…' : isLogin ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        {message.text && (
          <div className={`auth-message ${message.type}`}>{message.text}</div>
        )}

        <div className="auth-toggle">
          {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
          <button className="auth-toggle-btn" onClick={toggle}>
            {isLogin ? "S'inscrire" : 'Se connecter'}
          </button>
        </div>

      </div>
    </div>
  )
}
