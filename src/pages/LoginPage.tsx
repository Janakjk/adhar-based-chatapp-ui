import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/forms.css'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registered = (location.state as { registered?: boolean } | null)?.registered

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!userId.trim()) {
      setError('Please enter your user ID.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }
    navigate('/chat')
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="auth-sub">Use your user ID and password</p>
        {registered ? (
          <p className="form-error" style={{ color: 'var(--success)', marginBottom: '1rem' }}>
            Registration successful. You can sign in now.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="login-userid">User ID</label>
            <input
              id="login-userid"
              name="userId"
              autoComplete="username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Username or email"
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" className="btn-primary">
            Sign in
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.5rem' }}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}
